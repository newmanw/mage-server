import { FeedType } from '../../entities/feeds/entities.feeds';


interface LoadFeedTypes {
  (): Promise<FeedType[]>
}

export interface PluginHooks {
  loadFeedTypes: LoadFeedTypes | undefined
}