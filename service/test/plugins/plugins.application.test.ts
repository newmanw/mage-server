import { describe, it } from 'mocha'
import chai from 'chai'
import { PluginDescriptor, PluginDescriptorAttrs } from '../../src/plugins/entities/plugins.entities'

const expect = chai.expect

describe.only('plugins administration', function() {

  it('lists registered plugins', async function() {

    const registeredPlugins: PluginDescriptorAttrs[] = [
      {
        id: 'plugin1',
        version: '0.0.1',
        title: 'Plugin 1',
        summary: null,
        enabled: true,
        stateLog: [],
        settingsSchema: null,
        settings: { 'flur': 'nar' }
      },
      {
        id: 'plugin2',
        version: '0.0.2',
        title: 'Plugin 2',
        summary: null,
        enabled: true,
        stateLog: [],
        settingsSchema: null,
        settings: { 'lorp': 'snef' }
      }
    ]
    const app = new PluginsTestAdapter()
    app.setRegisteredPlugins(...registeredPlugins)
    const plugins = await app.listPlugins()

    expect(plugins).to.deep.include(registeredPlugins)
  })
})

class PluginsTestAdapter {

  constructor() {

  }

  setRegisteredPlugins(...pluginDescriptor: Partial<PluginDescriptorAttrs>[]) {

  }

  async listPlugins(): Promise<PluginDescriptor[]> {
    return []
  }
}