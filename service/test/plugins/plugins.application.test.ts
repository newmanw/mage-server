import { describe, it } from 'mocha'
import { expect } from 'chai'
import { PluginDescriptor, PluginDescriptorAttrs } from '../../lib//plugins/entities/plugins.entities'
import { PluginRepository } from '../../lib//plugins/application/plugins.app.contracts'

const plugin1Attrs: PluginDescriptorAttrs = {
  id: 'plugin1',
  version: '0.0.1',
  title: 'Plugin 1',
  summary: null,
  enabled: true,
  stateLog: [],
  settingsSchema: null,
  settings: { 'flur': 'nar' }
}

const plugin2Attrs: PluginDescriptorAttrs = {
  id: 'plugin2',
  version: '0.0.2',
  title: 'Plugin 2',
  summary: null,
  enabled: true,
  stateLog: [],
  settingsSchema: null,
  settings: { 'lorp': 'snef' }
}

describe.only('plugins administration', function() {

  let app: PluginsTestAdapter

  beforeEach(function() {
    app = new PluginsTestAdapter()
  })

  it('lists registered plugins', async function() {

    const registeredPlugins: PluginDescriptor[] = [
      new PluginDescriptor(plugin1Attrs),
      new PluginDescriptor(plugin2Attrs)
    ]
    app.setRegisteredPlugins(...registeredPlugins)
    const plugins = await app.listPlugins()

    expect(plugins).to.have.deep.members(registeredPlugins)
  })

  describe("saving plugin settings", function() {

    it('saves the settings to storage', async function() {

      const desc = new PluginDescriptor(plugin1Attrs)
      app.setRegisteredPlugins(desc)
      const settings = {
        flur: true,
        crep: 456,
        lena: 'gurt'
      }
      const saved = await app.savePluginSettings(desc.id, settings)
      const fetched = await app.getPlugin(desc.id)

      expect(desc)
      expect(saved.settings).to.deep.equal(settings)
      expect(fetched).to.deep.equal(saved)
    })

    it('applies the settings to the plugin component', async function() {
      expect.fail('todo')
    })
  })
})

import { ListPluginsFn, GetPluginFn, SavePluginSettingsFn } from '../../lib/plugins/application/plugins.app.fn'

class PluginsTestAdapter {

  readonly repo = new TestPluginRepository()
  readonly listPlugins = ListPluginsFn(this.repo)
  readonly getPlugin = GetPluginFn(this.repo)
  readonly savePluginSettings = SavePluginSettingsFn(this.repo)

  setRegisteredPlugins(...descs: PluginDescriptorAttrs[]) {
    descs.forEach(desc => {
      this.repo.plugins.set(desc.id, new PluginDescriptor(desc))
    })
  }
}

class TestPluginRepository implements PluginRepository {

  readonly plugins = new Map<string, PluginDescriptor>()

  async readAll(): Promise<PluginDescriptor[]> {
    return Array.from(this.plugins.values())
  }

  async findById(id: string): Promise<PluginDescriptor | null> {
    return this.plugins.get(id) || null
  }

  async savePluginSettings(pluginId: string, settings: object): Promise<PluginDescriptor> {
    const current = await this.findById(pluginId)
    const updated = new PluginDescriptor(current!)
    updated.settings = settings
    this.plugins.set(pluginId, updated)
    return updated
  }

  async update(attrs: Partial<PluginDescriptor>): Promise<PluginDescriptor> {
    throw new Error('unimplemented')
  }
}