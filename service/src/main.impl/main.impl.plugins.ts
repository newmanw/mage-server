import { FeedsPluginHooks, FeedServiceTypeRepository } from '../entities/feeds/entities.feeds';
import { loadFeedsHooks } from './plugin_hooks/main.impl.plugin_hooks.feeds'
import { loadIconsHooks } from './plugin_hooks/main.impl.plugin_hooks.icons'
import { IconPluginHooks, StaticIconRepository } from '../entities/icons/entities.icons'
import { loadMageEventsHoooks } from './plugin_hooks/main.impl.plugin_hooks.events'
import { MageEventsPluginHooks } from '../entities/events/entities.events'

export type PluginHooks = MageEventsPluginHooks & FeedsPluginHooks & IconPluginHooks

export interface PluginDependencies {
  feeds: {
    serviceTypeRepo: FeedServiceTypeRepository
  },
  icons: {
    staticIconRepo: StaticIconRepository
  }
}

export async function loadPlugins(pluginModules: string[], deps: PluginDependencies): Promise<void> {
  for (const moduleName of pluginModules) {
    try {
      const hooks = await import(moduleName) as PluginHooks
      await loadMageEventsHoooks(moduleName, hooks)
      await loadIconsHooks(moduleName, hooks, deps.icons.staticIconRepo)
      await loadFeedsHooks(moduleName, hooks, deps.feeds.serviceTypeRepo)
    }
    catch (err) {
      console.log(`error loading plugin module: ${moduleName}`, err)
    }
  }
}
