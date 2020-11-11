import { FeedsPluginHooks, FeedServiceTypeRepository } from '../entities/feeds/entities.feeds';
import { loadFeedsHooks } from './plugin_hooks/main.impl.plugin_hooks.feeds'
import { loadIconsHooks } from './plugin_hooks/main.impl.plugin_hooks.icons'
import { IconPluginHooks, StaticIconRepository } from '../entities/icons/entities.icons'

export type PluginHooks = FeedsPluginHooks & IconPluginHooks

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
      await loadIconsHooks(moduleName, deps.icons.staticIconRepo, hooks)
      await loadFeedsHooks(deps.feeds.serviceTypeRepo, moduleName, hooks)
    }
    catch (err) {
      console.log(`error loading plugin module: ${moduleName}`, err)
    }
  }
}
