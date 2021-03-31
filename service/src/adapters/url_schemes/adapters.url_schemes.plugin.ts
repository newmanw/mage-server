import fs from 'fs'
import fsx from 'fs-extra'
import path from 'path'
import { URL } from 'url'
import { PluginResourceUrl, UrlResolutionError, UrlScheme } from '../../entities/entities.global'

export class PluginUrlScheme implements UrlScheme {

  private readonly pluginNamesDescending: string[]

  /**
   * This class must know the registered plugin module names to ensure
   * resolution of only intended resources.
   * @param pluginNames
   */
  constructor(pluginNames: string[], private extraSearchPaths: string[] | null = null) {
    this.pluginNamesDescending = pluginNames.sort().reverse()
  }

  get isLocalScheme() { return true }

  canResolve(url: URL): boolean {
    return url.protocol === PluginResourceUrl.pluginProtocol
  }

  async resolveContent(url: URL): Promise<NodeJS.ReadableStream | UrlResolutionError> {
    if (!this.canResolve(url)) {
      return new UrlResolutionError(url, 'invalid scheme')
    }
    const pluginPath = PluginResourceUrl.pluginPathOf(url)
    if (!pluginPath) {
      return new UrlResolutionError(url, 'not a plugin url')
    }
    const longestMatchingPlugin = this.pluginNamesDescending.find(pluginName => pluginPath.startsWith(pluginName))
    if (!longestMatchingPlugin) {
      return new UrlResolutionError(url, 'no matching plugin module')
    }
    const contentRelPath = pluginPath.slice(longestMatchingPlugin.length + 1)
    const resolveOpts: { paths?: string[] } = {}
    if (Array.isArray(this.extraSearchPaths)) {
      resolveOpts.paths = this.extraSearchPaths
    }
    const pluginMainFilePath = require.resolve(longestMatchingPlugin, resolveOpts)
    const pluginBaseDirPath = path.dirname(pluginMainFilePath)
    const contentPath = path.join(pluginBaseDirPath, contentRelPath)
    console.log(`resolved url ${url} to file path ${contentPath}`)
    const stats = await fsx.stat(contentPath)
    if (stats.isFile()) {
      return fs.createReadStream(contentPath)
    }
    return new UrlResolutionError(url, 'no content found')
  }
}