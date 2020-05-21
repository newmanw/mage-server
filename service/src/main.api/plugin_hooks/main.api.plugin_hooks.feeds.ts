import { FeedServiceType } from '../../entities/feeds/entities.feeds';


interface LoadFeedServiceTypes {
  (): Promise<FeedServiceType[]>
}

export interface FeedsPluginHooks {
  readonly loadServiceTypes?:  LoadFeedServiceTypes
}