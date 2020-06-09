import { FeedServiceTypeRepository, FeedServiceType, FeedServiceTypeId, FeedsPluginHooks } from '../../entities/feeds/entities.feeds'
import { BaseMongooseRepository } from '../../adapters/base/adapters.base.db.mongoose'
import { Model, Document } from 'mongoose'


interface IdentifiedFeedServiceType extends FeedServiceType {
  readonly guid: FeedServiceTypeId,
  readonly moduleName: string
}


const serviceTypeRepo: FeedServiceTypeRepository = new class GFTRImpl extends BaseMongooseRepository<Document, Model<Document>, IdentifiedFeedServiceType> implements FeedServiceTypeRepository {

  static qualifiedNameOf(feedType: FeedServiceType, inModuleName: string): string {
    return `${inModuleName}/${feedType.id}`
  }

  readonly qualifiedNameIndex = new Map<string, IdentifiedFeedServiceType>()

  constructor() {
    super(Model)
  }

  async register(moduleName: string, moduleServiceType: FeedServiceType): Promise<IdentifiedFeedServiceType> {
    const qualifiedName = GFTRImpl.qualifiedNameOf(moduleServiceType, moduleName)
    let persistedServiceType = this.qualifiedNameIndex.get(qualifiedName)
    if (!persistedServiceType) {
      const guid = `${Date.now()}+${moduleServiceType.id}`
      persistedServiceType = Object.create(moduleServiceType, {
        guid: { value: guid },
        moduleName: { value: moduleName }
      }) as IdentifiedFeedServiceType
      persistedServiceType = await this.create(persistedServiceType)
      this.qualifiedNameIndex.set(qualifiedName, persistedServiceType)
    }
    return persistedServiceType
  }
}

export async function loadFeedsHooks(registry: FeedServiceTypeRepository, moduleName: string, hooks: Partial<FeedsPluginHooks>): Promise<void> {
  if (!(hooks?.feeds?.loadServiceTypes instanceof Function)) {
    return
  }
  const serviceTypes = await hooks.feeds.loadServiceTypes()
  for (const serviceType of serviceTypes) {
    registry.register(moduleName, serviceType)
  }
}

loadFeedsHooks(serviceTypeRepo, 'derp', {})
