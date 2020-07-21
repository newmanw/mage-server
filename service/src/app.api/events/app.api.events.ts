import { AppRequest, AppResponse } from '../app.api.global'
import { FeedId, Feed } from '../../entities/feeds/entities.feeds'
import { MageEventId, MageEvent } from '../../entities/events/entities.events'
import { EntityNotFoundError } from '../app.api.global.errors'

export interface AddFeedToEventRequest extends AppRequest {
  feed: FeedId,
  event: MageEventId
}

export interface AddFeedToEvent {
  (req: AddFeedToEventRequest): Promise<AppResponse<MageEvent, EntityNotFoundError>>
}

export interface ListEventFeedsRequest extends AppRequest {
  event: MageEventId
}

/**
 * This is a user-facing feed document that omits the constant parameters from
 * the feed entity for security.
 */
export type UserFeed = Omit<Feed, 'constantParams'>

export interface ListEventFeeds {
  (req: ListEventFeedsRequest): Promise<AppResponse<UserFeed[], EntityNotFoundError>>
}