import { FeedTopicId, FeedServiceTypeRepository, FeedServiceType, FeedServiceTypeId } from '../entities/feeds/entities.feeds';
import { FeedsPluginHooks } from '../main.api/plugin_hooks/main.api.plugin_hooks.feeds'
import feedsHook from './plugin_hooks/m'
import { BaseMongooseRepository } from '../adapters/base/adapters.base.db.mongoose';
import { Model, Document } from 'mongoose';

export type PluginHooks = FeedsPluginHooks

type PluginModule = {
  moduleName: string,
  hooks: PluginHooks
}



async function loadPlugins(pluginModules: string[]): Promise<void> {
  for (const moduleName of pluginModules) {
    const hooks = await import(moduleName) as PluginHooks
    loadFeedTypesOf({ moduleName, hooks })
  }
}




