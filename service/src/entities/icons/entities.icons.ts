import { URL } from 'url'
import fs from 'fs'
import fsx from 'fs-extra'
import path from 'path'

export interface IconPluginHooks {
  icons: {
    loadPluginStaticIcons: () => Promise<PluginStaticIcon[]>
  }
}

/**
 * `PluginStaticIcon` defines properties necessary for plugin packages to
 * provide bundled static icon assets for use in MAGE.
 */
export type PluginStaticIcon = Required<StaticIconStub> & {
  /**
   * The module relative path of a plugin icon points to an image file within
   * the plugin package.  The path is relative to the root of the plugin
   * package that contains the icon.
   */
  pluginRelativePath: string
}

export type StaticIconStub = Omit<StaticIcon, 'sourceUrl' | 'id' | 'registered' | 'resolved' | 'getContent'>

export interface ImageSize {
  width: number,
  height: number
}

/**
 * The reason behind the 'static' qualifier of `StaticIcon` is to distinguish
 * that the icon image is not dynamically generated and so is subject to
 * caching.  Other types of icons, such as the [Joint Military Symbology](https://www.jcs.mil/Portals/36/Documents/Doctrine/Other_Pubs/ms_2525d.pdf)
 * may be dynamically generated based on the attributes of the feature the icon
 * represents.
 */
export interface StaticIcon {
  /**
   * The source URL of an icon is a persistent, cache-friendly URL that exists
   * outside the URL namespace of a particular MAGE server.  For example, this
   * could be an HTTP URL that MAGE can use to retrieve and cache the icon.
   */
  sourceUrl: URL
  id: StaticIconId
  registered: Date
  resolved: Date | null
  imageType?: 'raster' | 'vector'
  /**
   * The icons's media type is a standard [IANA media/MIME](https://www.iana.org/assignments/media-types/media-types.xhtml)
   * type strings, such as `image/jpeg`.
   */
  mediaType?: string
  /**
   * The size in pixels is the width and height
   */
  sizePixels?: ImageSize
  sizeBytes?: number
  contentHash?: string
  contentTimestamp?: Date
  title?: string
  summary?: string
  /**
   * The icon's file name is the original file name of an uploaded icon, and/or
   * the default file name provided to download the icon.
   */
  fileName?: string
  tags: string[]
  getContent(): Promise<NodeJS.ReadableStream>
}

const iconIsResolved = (icon: StaticIcon): boolean => {
  return typeof icon.contentHash === 'string' && typeof icon.contentTimestamp === 'number'
}

export const UnregisteredStaticIcon = Symbol()

export type StaticIconId = string | typeof UnregisteredStaticIcon

export interface StaticIconRepository {
  registerBySourceUrl(sourceUrl: URL, attrs?: Omit<StaticIconStub, 'sourceUrl'>): Promise<StaticIcon>
  findById(id: StaticIconId): Promise<StaticIcon | null>
  saveContent(id: StaticIconId, content: NodeJS.ReadableStream): Promise<boolean>
  loadContent(id: StaticIconId): Promise<NodeJS.ReadableStream | null>
}

export interface IconUrlResolver {
  canResolve(url: URL): boolean
  resolveContent(url: URL): Promise<NodeJS.ReadableStream | IconContentNotFoundError>
}

export const IconContentNotFound = Symbol.for('icon.content_not_found')

export type IconErrorCode = typeof IconContentNotFound

export class IconError<Code extends IconErrorCode = IconErrorCode> extends Error {
  constructor(readonly code: Code, message?: string) {
    super(message)
  }
}

export type IconContentNotFoundError = IconError<typeof IconContentNotFound>
export function IconContentNotFoundError(sourceUrl: URL): IconContentNotFoundError {
  return new IconError(IconContentNotFound, `no content found for icon url ${sourceUrl}`)
}

export class PluginResourceUrl extends URL {

  static readonly pluginProtocol = 'mage-plugin:'

  constructor(readonly pluginModuleName: string, readonly resourcePath: string) {
    super(`${PluginResourceUrl.pluginProtocol}///${pluginModuleName}/${resourcePath}`)
  }
}

export class PluginIconResolver implements IconUrlResolver {

  readonly pluginNamesDescending: string[]

  constructor(pluginNames: string[]) {
    this.pluginNamesDescending = pluginNames.sort().reverse()
  }

  canResolve(url: URL): boolean {
    return url.protocol === PluginResourceUrl.pluginProtocol
  }

  async resolveContent(sourceUrl: URL): Promise<NodeJS.ReadableStream | IconContentNotFoundError> {
    const longestMatchingPlugin = this.pluginNamesDescending.find(pluginName => sourceUrl.toString().startsWith(pluginName))
    if (!longestMatchingPlugin) {
      return IconContentNotFoundError(sourceUrl)
    }
    const relPath = sourceUrl.pathname.slice(longestMatchingPlugin.length)
    const basePath = require.resolve(longestMatchingPlugin)
    const fullPath = path.join(basePath, relPath)
    const stats = await fsx.stat(fullPath)
    if (stats.isFile()) {
      return fs.createReadStream(fullPath)
    }
    return IconContentNotFoundError(sourceUrl)
  }
}