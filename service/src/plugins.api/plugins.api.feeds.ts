import { InjectionToken } from '.'
import { FeedRepository, FeedServiceRepository, FeedServiceType, FeedServiceTypeRepository } from '../entities/feeds/entities.feeds'

interface LoadFeedServiceTypes {
  (): Promise<FeedServiceType[]>
}

/**
 * A plugin package that wishes to provide one or more [FeedServiceType]
 * implementations must implement this interface in the top-level export of
 * the package.  For example,
 * ```
 * export = {
 *   // ... other plugin hooks
 *   feeds: {
 *     loadServiceTypes: () => Promise<FeedServiceType[]> {
 *       // resolve the service types
 *     }
 *   }
 * }
 */
export interface FeedsPluginHooks {
  feeds: {
    readonly loadServiceTypes:  LoadFeedServiceTypes
  }
}

export const FeedServiceTypeRepositoryToken: InjectionToken<FeedServiceTypeRepository> = Symbol('InjectFeedServiceTypeRepository')
export const FeedServiceRepositoryToken: InjectionToken<FeedServiceRepository> = Symbol('InjectFeedServiceRepository')
export const FeedRepositoryToken: InjectionToken<FeedRepository> = Symbol('InjectFeedRepository')