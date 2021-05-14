import { FeedServiceTypeRepository, FeedsPluginHooks } from '../../entities/feeds/entities.feeds'


export async function loadFeedsHooks(moduleName: string, hooks: Partial<FeedsPluginHooks>, serviceTypeRepo: FeedServiceTypeRepository): Promise<void> {
  if (!(hooks?.feeds?.loadServiceTypes instanceof Function)) {
    return
  }
  const serviceTypes = await hooks.feeds.loadServiceTypes()
  for (const serviceType of serviceTypes) {
    serviceTypeRepo.register(moduleName, serviceType)
  }
}
