import { FeedTypeId, FeedServiceTypeRepository, FeedServiceType, FeedServiceTypeGuid } from '../entities/feeds/entities.feeds';
import { FeedsPluginHooks } from '../main.api/plugin_hooks/main.api.plugin_hooks.feeds'
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

interface GuidFeedServiceType extends FeedServiceType {
  readonly guid: FeedTypeId,
  readonly moduleName: string
}

interface GuidFeedTypeRepository extends FeedServiceTypeRepository {
  findOrCreate(moduleName: string, feedType: FeedServiceType): Promise<GuidFeedServiceType>
}

class FeedTypeRegistry implements FeedServiceTypeRepository {

  private readonly feedTypes = new Map<FeedServiceTypeGuid, FeedServiceType>()

  constructor(private readonly repo: GuidFeedTypeRepository) {}

  async register(moduleName: string, serviceType: FeedServiceType): Promise<void> {
    const registered = await this.repo.findOrCreate(moduleName, serviceType)
    this.feedTypes.set(registered.guid, serviceType)
  }

  lookupFeedType(id: FeedTypeGuid): FeedServiceType | null {
    return this.feedTypes.get(id) || null
  }

  async findAll(): Promise<FeedServiceType[]> {
    throw new Error('todo')
  }

  async findById(id: FeedServiceTypeGuid): Promise<FeedServiceType | null> {
    throw new Error('todo')
  }

  async removeById(id: FeedServiceTypeGuid): Promise<void> {
    throw new Error('todo')
  }
}

const serviceTypeRepo: GuidFeedTypeRepository = new class GFTRImpl extends BaseMongooseRepository<Document, Model<Document>, GuidFeedServiceType> {

  static qualifiedNameOf(feedType: FeedServiceType, inModuleName: string): string {
    return `${inModuleName}/${feedType.id}`
  }

  readonly db = new Map<FeedTypeId, GuidFeedServiceType>()
  readonly qualifiedNameIndex = new Map<string, GuidFeedServiceType>()

  constructor() {
    super(Model)
  }

  async findOrCreate(moduleName: string, feedType: FeedServiceType): Promise<GuidFeedServiceType> {
    const qualifiedName = GFTRImpl.qualifiedNameOf(feedType, moduleName)
    let guidFeedType = this.qualifiedNameIndex.get(qualifiedName)
    if (!guidFeedType) {
      const guid = `${Date.now()}+${feedType.id}`
      guidFeedType = Object.create(feedType, {
        guid: { value: guid },
        moduleName: { value: moduleName }
      }) as GuidFeedServiceType
      this.db.set(guid, guidFeedType)
      this.qualifiedNameIndex.set(qualifiedName, guidFeedType)
    }
    return guidFeedType
  }

  async findAll(): Promise<GuidFeedServiceType[]> {
    throw new Error('todo')
  }

  async findById(id: FeedTypeId): Promise<GuidFeedServiceType | null> {
    throw new Error('todo')
  }

  async removeById(id: FeedTypeId): Promise<void> {
    throw new Error('todo')
  }
}

const serviceTypeRegistry = new FeedTypeRegistry(serviceTypeRepo)

async function loadFeedTypesOf({ moduleName, plugin }: PluginModule): Promise<void> {
  if (!plugin.loadServiceTypes) {
    return
  }
  const serviceTypes = await plugin.loadServiceTypes()
  for (const serviceType of serviceTypes) {
    serviceTypeRegistry.register(moduleName, serviceType)
  }
}