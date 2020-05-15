import { FeedType } from '../../entities/feeds/entities.feeds';


interface LoadFeedTypes {
  (): Promise<FeedType[]>
}

export interface FeedsPluginHooks {
  readonly loadFeedTypes?:  LoadFeedTypes
}