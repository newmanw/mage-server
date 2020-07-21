import { AddFeedToEvent, AddFeedToEventRequest, ListEventFeeds, ListEventFeedsRequest, UserFeed } from '../../app.api/events/app.api.events'
import { MageEventRepository, MageEvent } from '../../entities/events/entities.events'
import { entityNotFound, EntityNotFoundError } from '../../app.api/app.api.global.errors'
import { AppResponse } from '../../app.api/app.api.global'
import { FeedRepository } from '../../entities/feeds/entities.feeds'


export function AddFeedToEvent(eventRepo: MageEventRepository): AddFeedToEvent {
  return async function(req: AddFeedToEventRequest): ReturnType<AddFeedToEvent> {
    const event = await eventRepo.addFeedsToEvent(req.event, req.feed)
    if (!event) {
      return AppResponse.error<MageEvent, EntityNotFoundError>(entityNotFound(req.event, 'MageEvent'))
    }
    return AppResponse.success<MageEvent, unknown>(event)
  }
}

export function ListEventFeeds(eventRepo: MageEventRepository, feedRepo: FeedRepository): ListEventFeeds {
  return async function(req: ListEventFeedsRequest): ReturnType<ListEventFeeds> {
    const event = await eventRepo.findById(req.event)
    if (!event) {
      return AppResponse.error<UserFeed[], EntityNotFoundError>(entityNotFound(req.event, 'MageEvent'))
    }
    const feeds = await feedRepo.findFeedsByIds(...event.feedIds)
    const userFeeds = feeds.map(x => {
      const userFeed = { ...x }
      delete userFeed['constantParams']
      return userFeed
    })
    return AppResponse.success(userFeeds)
  }
}