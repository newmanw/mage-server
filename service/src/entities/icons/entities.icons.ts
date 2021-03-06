import { URL } from 'url'
import { PageOf, PagingParameters } from '../entities.global'

export interface IconPluginHooks {
  icons: {
    loadPluginStaticIcons: () => Promise<PluginStaticIcon[]>
  }
}

/**
 * `PluginStaticIcon` defines properties necessary for plugin packages to
 * provide bundled static icon assets for use in MAGE.
 */
export type PluginStaticIcon = Omit<StaticIconStub, 'sourceUrl'> & Required<Pick<StaticIconStub, 'contentHash'>> & {
  /**
   * The module relative path of a plugin icon points to an image file within
   * the plugin package.  The path is relative to the root of the plugin
   * package that contains the icon.
   */
  pluginRelativePath: string
}

export type StaticIconStub = Omit<StaticIcon, 'id' | 'registeredTimestamp' | 'resolvedTimestamp'>

export interface ImageSize {
  width: number,
  height: number
}

/**
 * The reason for the 'static' qualifier of `StaticIcon` is to distinguish
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
  registeredTimestamp: number
  resolvedTimestamp?: number
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
  contentTimestamp?: number
  title?: string
  summary?: string
  /**
   * The icon's file name is the original file name of an uploaded icon, and/or
   * the default file name provided to download the icon.
   */
  fileName?: string
  tags?: string[]
}

export type LocalStaticIconStub = Omit<StaticIconStub, 'sourceUrl' | 'title'> & Required<Pick<StaticIcon, 'title'>>

const iconIsResolved = (icon: StaticIcon): boolean => {
  return typeof icon.contentHash === 'string' && typeof icon.contentTimestamp === 'number'
}

export type StaticIconId = string

export enum StaticIconImportFetch {
  /**
   * Immediately fetch and store the icon content from the source URL and wait
   * for the fetch to complete.
   */
  EagerAwait = 'StaticIconFetch.eagerAwait',
  /**
   * Immediately fetch and store the icon content from the source URL, but do
   * not serially wait for the fetch to complete.
   */
  Eager = 'StaticIconFetch.eager',
  /**
   * Defer fetching the icon content from the source URL until some process
   * explictly requests a fetch at some point in the future, such as a client
   * requests the icon content by its internal ID.
   */
  Lazy = 'StaticIconFetch.lazy',
}

export interface StaticIconRepository {
  findOrImportBySourceUrl(stub: StaticIconStub | URL, fetch?: StaticIconImportFetch): Promise<StaticIcon>
  createLocal(stub: LocalStaticIconStub, content: NodeJS.ReadableStream): Promise<StaticIcon>
  findById(id: StaticIconId): Promise<StaticIcon | null>
  find(paging?: PagingParameters): Promise<PageOf<StaticIcon>>
  resolveFromSourceUrl(id: StaticIconId): Promise<NodeJS.ReadableStream | null>
  resolveFromSourceUrlAndStore(id: StaticIconId): Promise<StaticIcon | null>
  loadContent(id: StaticIconId): Promise<NodeJS.ReadableStream | null>
}

export interface IconUrlScheme {
  /**
   * TODO: this should hopefully go away
   */
  isLocalScheme: boolean
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
