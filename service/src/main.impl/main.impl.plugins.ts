import { loadFeedsHooks } from './plugin_hooks/main.impl.plugin_hooks.feeds'
import { loadIconsHooks } from './plugin_hooks/main.impl.plugin_hooks.icons'
import { loadMageEventsHoooks } from './plugin_hooks/main.impl.plugin_hooks.events'
import { InitPluginHook, Injection, InjectionToken } from '../plugins.api'
import { FeedServiceTypeRepositoryToken, FeedsPluginHooks } from '../plugins.api/plugins.api.feeds'
import { IconPluginHooks, StaticIconRepositoryToken } from '../plugins.api/pugins.api.icons'
import { MageEventsPluginHooks } from '../plugins.api/plugins.api.events'
import { WebRoutesHooks } from '../plugins.api/plugins.api.web'
import { Router } from 'express'

export type PluginHooks = MageEventsPluginHooks & FeedsPluginHooks & IconPluginHooks & WebRoutesHooks

export interface InjectableServices {
  <Service>(token: InjectionToken<Service>): Service
}

export async function integratePluginHooks(pluginId: string, plugin: InitPluginHook<any>, injectService: InjectableServices, addWebRoutesFromPlugin: (pluginId: string, routes: Router) => void): Promise<void> {
  let injection: Injection<any> | null = null
  let hooks: PluginHooks
  if (plugin.inject) {
    injection = {}
    for (const [ serviceKey, serviceToken ] of Object.entries(plugin.inject)) {
      injection[serviceKey] = injectService(serviceToken)
    }
    hooks = await plugin.init(injection)
  }
  else {
    hooks = await plugin.init()
  }
  await loadMageEventsHoooks(pluginId, hooks)
  await loadIconsHooks(pluginId, hooks, injectService(StaticIconRepositoryToken))
  await loadFeedsHooks(pluginId, hooks, injectService(FeedServiceTypeRepositoryToken))
  if (hooks.webRoutes) {
    await addWebRoutesFromPlugin(pluginId, hooks.webRoutes)
  }
}
