import fs from 'fs'
import fsx from 'fs-extra'
import path from 'path'
import { URL } from 'url'
import { PluginResourceUrl } from '../../entities/entities.global'
import { IconContentNotFoundError, IconUrlScheme } from '../../entities/icons/entities.icons'

export class PluginIconScheme implements IconUrlScheme {

  readonly pluginNamesDescending: string[]

  constructor(pluginNames: string[]) {
    this.pluginNamesDescending = pluginNames.sort().reverse()
  }

  get isLocalScheme() { return true }

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