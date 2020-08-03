import { AddFeedToEvent, AddFeedToEventRequest, ListEventFeeds, ListEventFeedsRequest, UserFeed } from '../../app.api/events/app.api.events'
import { MageEventRepository, MageEvent } from '../../entities/events/entities.events'
import { entityNotFound, EntityNotFoundError, PermissionDeniedError } from '../../app.api/app.api.errors'
import { AppResponse } from '../../app.api/app.api.global'
import { FeedRepository } from '../../entities/feeds/entities.feeds'
import { EventPermissionServiceImpl } from '../../permissions/permissions.events'


export function AddFeedToEvent(permissionService: EventPermissionServiceImpl, eventRepo: MageEventRepository): AddFeedToEvent {
  return async function(req: AddFeedToEventRequest): ReturnType<AddFeedToEvent> {
    let event = await eventRepo.findById(req.event)
    if (!event) {
      return AppResponse.error<MageEvent, EntityNotFoundError>(entityNotFound(req.event, 'MageEvent'))
    }
    const denied = await permissionService.ensureEventUpdatePermission(req.context)
    if (denied) {
      return AppResponse.error<MageEvent, PermissionDeniedError>(denied)
    }
    event = await eventRepo.addFeedsToEvent(req.event, req.feed)
    return AppResponse.success<MageEvent, unknown>(event!)
  }
}

export function ListEventFeeds(permissionService: EventPermissionServiceImpl, eventRepo: MageEventRepository, feedRepo: FeedRepository): ListEventFeeds {
  return async function(req: ListEventFeedsRequest): ReturnType<ListEventFeeds> {
    const event = await eventRepo.findById(req.event)
    if (!event) {
      return AppResponse.error<UserFeed[], EntityNotFoundError>(entityNotFound(req.event, 'MageEvent'))
    }
    const denied = await permissionService.ensureEventReadPermission(req.context)
    if (denied) {
      return AppResponse.error<UserFeed[], PermissionDeniedError>(denied)
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
