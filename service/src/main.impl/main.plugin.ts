import { FeedType, FeedTypeId } from '../entities/feeds/entities.feeds';
import { FeedsPluginHooks } from '../main.api/plugin_hooks/main.api.plugin_hooks.feeds'
import { FeedTypeRepository } from '../application/manifold/app.manifold.use_cases';
import { BaseMongooseRepository } from '../adapters/base/adapters.base.db.mongoose';
import { Model, Document } from 'mongoose';



type PluginModule = {
  moduleName: string,
  plugin: FeedsPluginHooks
}

const configuredPlugins: FeedsPluginHooks[] = []

async function bootPlugins(pluginModules: string[]): Promise<void> {
  for (const moduleName of pluginModules) {
    const plugin = await import(moduleName) as FeedsPluginHooks
    loadFeedTypesOf({ moduleName, plugin })
  }
}

type FeedTypeGuid = string

interface GuidFeedType extends FeedType {
  readonly guid: FeedTypeId,
  readonly moduleName: string
}

interface GuidFeedTypeRepository extends FeedTypeRepository {
  findOrCreate(moduleName: string, feedType: FeedType): Promise<GuidFeedType>
}

class FeedTypeRegistry implements FeedTypeRepository {

  private readonly feedTypes = new Map<FeedTypeId, FeedType>()

  constructor(private readonly repo: GuidFeedTypeRepository) {}

  async register(moduleName: string, feedType: FeedType): Promise<void> {
    const registered = await this.repo.findOrCreate(moduleName, feedType)
    this.feedTypes.set(registered.guid, feedType)
  }

  lookupFeedType(id: FeedTypeGuid): FeedType | null {
    return this.feedTypes.get(id) || null
  }

  async readAll(): Promise<FeedType[]> {
    throw new Error('todo')
  }

  async findById(): Promise<FeedType | null> {
    throw new Error('todo')
  }

  async removeById(id: FeedTypeId): Promise<void> {
    throw new Error('todo')
  }
}

const feedTypeRepo: GuidFeedTypeRepository = new class GFTRImpl extends BaseMongooseRepository<Document, Model<Document>, GuidFeedType> {

  static qualifiedNameOf(feedType: FeedType, inModuleName: string): string {
    return `${inModuleName}/${feedType.id}`
  }

  readonly db = new Map<FeedTypeId, GuidFeedType>()
  readonly qualifiedNameIndex = new Map<string, GuidFeedType>()

  constructor() {
    super(Model)
  }

  async findOrCreate(moduleName: string, feedType: FeedType): Promise<GuidFeedType> {
    const qualifiedName = GFTRImpl.qualifiedNameOf(feedType, moduleName)
    let guidFeedType = this.qualifiedNameIndex.get(qualifiedName)
    if (!guidFeedType) {
      const guid = `${Date.now()}+${feedType.id}`
      guidFeedType = Object.create(feedType, {
        guid: { value: guid },
        moduleName: { value: moduleName }
      }) as GuidFeedType
      this.db.set(guid, guidFeedType)
      this.qualifiedNameIndex.set(qualifiedName, guidFeedType)
    }
    return guidFeedType
  }

  async readAll(): Promise<GuidFeedType[]> {
    throw new Error('todo')
  }

  async findById(id: FeedTypeId): Promise<GuidFeedType | null> {
    throw new Error('todo')
  }

  async removeById(id: FeedTypeId): Promise<void> {
    throw new Error('todo')
  }
}

const feedTypeRegistry = new FeedTypeRegistry(feedTypeRepo)

async function loadFeedTypesOf({ moduleName, plugin }: PluginModule): Promise<void> {
  if (!plugin.loadFeedTypes) {
    return
  }
  const feedTypes = await plugin.loadFeedTypes()
  for (const feedType of feedTypes) {
    feedTypeRegistry.register(moduleName, feedType)
  }
}