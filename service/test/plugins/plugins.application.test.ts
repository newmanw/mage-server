import { describe, it } from 'mocha'
import chai, { expect } from 'chai'
import asPromised from 'chai-as-promised'
import { Substitute as Sub, Arg } from '@fluffy-spoon/substitute'
import { PluginDescriptor, PluginDescriptorAttrs, PluginModule } from '../../lib//plugins/entities/plugins.entities'
import { PluginRepository, PluginManager } from '../../lib//plugins/application/plugins.app.contracts'
import deepEqual from 'deep-equal'

chai.use(asPromised)

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

describe('plugins administration', function() {

  let app: PluginsTestAdapter

  beforeEach(function() {
    app = new PluginsTestAdapter()
  })

  it('lists registered plugins', async function() {

    const registeredPlugins: PluginDescriptor[] = [
      new PluginDescriptor(plugin1Attrs),
      new PluginDescriptor(plugin2Attrs)
    ]
    app.registerPlugins(...registeredPlugins.map(x => [ x, null ] as RegisterPluginTuple))
    const plugins = await app.listPlugins()

    expect(plugins).to.have.deep.members(registeredPlugins)
  })

  describe("saving plugin settings", function() {

    it('applies settings to plugin and saves settings to storage', async function() {

      const desc = new PluginDescriptor(plugin1Attrs)
      const plugin = Sub.for<PluginModule>()
      app.registerPlugins([ desc, plugin ])
      const settings = {
        flep: 'vemp',
        slu: 1234
      }

      plugin.applySettings(Arg.is(x => deepEqual(x, settings))).resolves(plugin)
      const saved = await app.savePluginSettings(desc.id, settings)
      const fetched = await app.getPlugin(desc.id)
      const inDb = app.repo.db.get(desc.id)!

      plugin.received(1).applySettings(Arg.is(x => deepEqual(x, settings)))
      expect(saved.settings).to.deep.equal(settings)
      expect(fetched?.settings).to.deep.equal(settings)
      expect(inDb.settings).to.deep.equal(settings)
    })

    it('does not store the settings if applying the settings failed', async function() {

      const desc = new PluginDescriptor(plugin1Attrs)
      const originalSettings = JSON.parse(JSON.stringify(desc.settings))
      const plugin = Sub.for<PluginModule>()
      app.registerPlugins([ desc, plugin ])

      const settings = {
        flep: 'vemp',
        slu: 1234,
        sew: 'lop'
      }
      plugin.applySettings(Arg.all()).rejects(new Error('invalid settings'))

      await expect(app.savePluginSettings(desc.id, settings)).to.eventually.be.rejectedWith('invalid settings')
      const fetched = await app.getPlugin(desc.id)
      const inDb = app.repo.db.get(desc.id)!

      plugin.received(1).applySettings(Arg.is(x => deepEqual(x, settings)))
      expect(fetched?.settings).to.deep.equal(originalSettings)
      expect(inDb.settings).to.deep.equal(originalSettings)
    })
  })
})

import { ListPluginsFn, GetPluginFn, SavePluginSettingsFn } from '../../lib/plugins/application/plugins.app.fn'

type RegisterPluginTuple = [
  PluginDescriptor,
  PluginModule | null,
]

class PluginsTestAdapter {

  readonly repo = new TestPluginRepository()
  readonly manager = new TestPluginManager()
  readonly listPlugins = ListPluginsFn(this.repo)
  readonly getPlugin = GetPluginFn(this.repo)
  readonly savePluginSettings = SavePluginSettingsFn(this.repo, this.manager)

  registerPlugins(...pluginRegs: (RegisterPluginTuple)[]): void {
    pluginRegs.forEach(reg => {
      const [ desc, plugin ] = reg
      this.repo.db.set(desc.id, new PluginDescriptor(desc))
      this.manager.plugins.set(desc.id, plugin)
    })
  }
}

class TestPluginRepository implements PluginRepository {

  readonly db = new Map<string, PluginDescriptor>()

  async readAll(): Promise<PluginDescriptor[]> {
    return Array.from(this.db.values())
  }

  async findById(id: string): Promise<PluginDescriptor | null> {
    return this.db.get(id) || null
  }

  async savePluginSettings(pluginId: string, settings: object): Promise<PluginDescriptor> {
    const current = await this.findById(pluginId)
    const updated = new PluginDescriptor(current!)
    updated.settings = settings
    this.db.set(pluginId, updated)
    return updated
  }

  async update(attrs: Partial<PluginDescriptor>): Promise<PluginDescriptor> {
    throw new Error('unimplemented')
  }
}

class TestPluginManager implements PluginManager {

  readonly plugins = new Map<string, PluginModule | null>()

  async getPlugin(pluginId: string): Promise<PluginModule> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`plugin module not found: ${pluginId}`)
    }
    return plugin
  }
}


class ImperativePromiseExecuteContext<T> {
  resolve: ResolveFunction<T> = () => {}
  reject: RejectFunction = () => {}
  capture(resolve: ResolveFunction<T>, reject: RejectFunction): void {
    this.resolve = resolve
    this.reject = reject
  }
}
type ResolveFunction<T> = (value?: T | PromiseLike<T>) => void
type RejectFunction = (reason?: any) => void
/**
 * This promise resolves or rejects only when explicitly instructed from the
 * main thread.
 */
class ImperativePromise<T> extends Promise<T> {

  static create<T>(): ImperativePromise<T> {
    const executeContext = new ImperativePromiseExecuteContext<T>()
    const imperative = new ImperativePromise<T>(executeContext)
    imperative.resolve = executeContext.resolve
    imperative.reject = executeContext.reject
    return imperative
  }

  resolve: ResolveFunction<T> = () => {}
  reject: RejectFunction = () => {}

  constructor(executeContext: ImperativePromiseExecuteContext<T>) {
    super(executeContext.capture.bind(executeContext))
    this.resolve = executeContext.resolve
    this.reject = executeContext.reject
  }
}
