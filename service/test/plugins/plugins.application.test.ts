import { describe, it } from 'mocha'
import chai from 'chai'
import { PluginDescriptor, PluginDescriptorAttrs } from '../../lib//plugins/entities/plugins.entities'
import { PluginRepository } from '../../lib//plugins/application/plugins.app.contracts'

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

class TestPluginRepository implements PluginRepository {

  readonly plugins = new Map<string, PluginDescriptor>()

  async readAll(): Promise<PluginDescriptor[]> {
    return Array.from(this.plugins.values())
  }

  findById(id: string): Promise<PluginDescriptor> {
    throw new Error("Method not implemented.")
  }

  update(attrs: Partial<PluginDescriptor>): Promise<PluginDescriptor> {
    throw new Error("Method not implemented.")
  }
}

import { ListPluginsFn } from '../../lib/plugins/application/plugins.app.fn'

class PluginsTestAdapter {

  readonly repo = new TestPluginRepository()
  readonly listPlugins = ListPluginsFn(this.repo)

  setRegisteredPlugins(...descs: PluginDescriptorAttrs[]) {
    descs.forEach(desc => {
      this.repo.plugins.set(desc.id, new PluginDescriptor(desc))
    })
  }
}