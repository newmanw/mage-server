import { URL } from 'url'

export interface EntityIdFactory {
  nextId(): Promise<string>
}

/**
 * TODO: This class may belong somewhere else, but for now is here until things
 * evolve a bit more.
 */
export class PluginResourceUrl extends URL {

  static readonly pluginProtocol = 'mage-plugin:'

  constructor(readonly pluginModuleName: string, readonly resourcePath: string) {
    super(`${PluginResourceUrl.pluginProtocol}///${pluginModuleName}/${resourcePath}`)
  }
}