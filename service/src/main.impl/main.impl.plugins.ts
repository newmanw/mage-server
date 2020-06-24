import { FeedsPluginHooks, FeedServiceTypeRepository } from '../entities/feeds/entities.feeds';
import { loadFeedsHooks } from './plugin_hooks/main.impl.plugin_hooks.feeds'

export type PluginHooks = FeedsPluginHooks

export interface PluginDependencies {
  feeds: {
    serviceTypeRepo: FeedServiceTypeRepository
  }
}

export async function loadPlugins(pluginModules: string[], deps: PluginDependencies): Promise<void> {
  for (const moduleName of pluginModules) {
    try {
      const hooks = await import(moduleName) as PluginHooks
      loadFeedsHooks(deps.feeds.serviceTypeRepo, moduleName, hooks)
    }
    catch (err) {
      console.log(`error loading plugin module: ${moduleName}`, err)
    }
  }
}
