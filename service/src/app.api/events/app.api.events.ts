import { AppRequest, AppResponse } from '../app.api.global'
import { FeedId } from '../../entities/feeds/entities.feeds'
import { MageEventId, MageEvent } from '../../entities/events/entities.events'
import { EntityNotFoundError } from '../app.api.global.errors'

export interface AddFeedToEventRequest extends AppRequest {
  feed: FeedId,
  event: MageEventId
}

export interface AddFeedToEvent {
  (req: AddFeedToEventRequest): Promise<AppResponse<MageEvent, EntityNotFoundError>>
}