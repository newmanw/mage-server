import { loadFeedsHooks } from './plugin_hooks/main.impl.plugin_hooks.feeds'
import { loadIconsHooks } from './plugin_hooks/main.impl.plugin_hooks.icons'
import { loadMageEventsHoooks } from './plugin_hooks/main.impl.plugin_hooks.events'
import { InitPluginHook, Injection, InjectionToken } from '../plugins.api'
import { FeedServiceTypeRepositoryToken, FeedsPluginHooks } from '../plugins.api/plugins.api.feeds'
import { IconPluginHooks, StaticIconRepositoryToken } from '../plugins.api/pugins.api.icons'
import { MageEventsPluginHooks } from '../plugins.api/plugins.api.events'
import { loadWebRoutesHooks } from './plugin_hooks/main.impl.plugin_hooks.web'
import { WebRoutesHooks } from '../plugins.api/plugins.api.web'
import { Router } from 'express'

export type PluginHooks = MageEventsPluginHooks & FeedsPluginHooks & IconPluginHooks & WebRoutesHooks

export interface InjectableServices {
  <Service>(token: InjectionToken<Service>): Service
}

export async function loadPlugins(pluginModules: string[], services: InjectableServices, addWebRoutesFromPlugin: (pluginId: string, routes: Router) => void): Promise<void> {
  for (const moduleName of pluginModules) {
    try {
      const initPlugin = await import(moduleName) as InitPluginHook<any>
      let injection: Injection<any> | null = null
      let hooks: PluginHooks
      if (initPlugin.inject) {
        injection = {}
        for (const serviceKey of Object.keys(initPlugin.inject)) {
          injection[serviceKey] = services(initPlugin.inject[serviceKey])
        }
        hooks = await initPlugin(injection)
      }
      else {
        hooks = await initPlugin()
      }
      await loadMageEventsHoooks(moduleName, hooks)
      await loadIconsHooks(moduleName, hooks, services(StaticIconRepositoryToken))
      await loadFeedsHooks(moduleName, hooks, services(FeedServiceTypeRepositoryToken))
      if (hooks.webRoutes) {
        await addWebRoutesFromPlugin(moduleName, hooks.webRoutes)
      }
    }
    catch (err) {
      console.log(`error loading plugin module: ${moduleName}`, err)
    }
  }
}
