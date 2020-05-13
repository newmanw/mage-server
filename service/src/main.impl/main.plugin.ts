import { FeedType, FeedTypeKey } from '../entities/feeds/entities.feeds';




type PluginModule = {
  moduleName: string,
  hook: PluginMainHook
}

const configuredPlugins: PluginMainHook[] = []

async function bootPlugins(pluginModules: string[]): Promise<void> {
  for (const moduleName of pluginModules) {
    const hook = await import(moduleName) as PluginMainHook
    loadFeedTypesOf({ moduleName, hook })
  }
}

type FeedTypeGuid = string

interface RegisteredFeedType {
  id: FeedTypeGuid,
  pluginModuleName: string,
  feedTypeKey: FeedTypeKey
}

interface RegisteredFeedTypeRepository {
  findOrCreate(pluginModuleName: string, feedTypeKey: FeedTypeKey): Promise<RegisteredFeedType>
}

class FeedTypeRegistry {

  private readonly feedTypes = new Map<FeedTypeGuid, FeedType>()

  constructor(private readonly repo: RegisteredFeedTypeRepository) {}

  async register(pluginModuleName: string, feedType: FeedType): Promise<void> {
    const registered = await this.repo.findOrCreate(pluginModuleName, feedType.key)
    this.feedTypes.set(registered.id, feedType)
  }

  lookupFeedType(id: FeedTypeGuid): FeedType | null {
    return this.feedTypes.get(id) || null
  }
}

const feedTypeRepo: RegisteredFeedTypeRepository = {
  async findOrCreate(pluginModuleName: string, feedTypeKey: FeedTypeKey): Promise<RegisteredFeedType> {
    return {
      id: `${Date.now()}`,
      pluginModuleName: pluginModuleName,
      feedTypeKey
    }
  }
}

const feedTypeRegistry = new FeedTypeRegistry(feedTypeRepo)

async function loadFeedTypesOf({ moduleName, hook }: PluginModule): Promise<void> {

  if (!hook.createFeedTypes) {
    return
  }
  const feedTypes = await hook.createFeedTypes()
  for (const feedType of feedTypes) {
    feedTypeRegistry.register(moduleName, feedType)
  }
}