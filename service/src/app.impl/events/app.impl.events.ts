import { AddFeedToEvent, AddFeedToEventRequest } from '../../app.api/events/app.api.events'
import { MageEventRepository, MageEvent } from '../../entities/events/entities.events'
import { entityNotFound, EntityNotFoundError } from '../../app.api/app.api.global.errors'
import { AppResponse } from '../../app.api/app.api.global'


export function AddFeedToEvent(eventRepo: MageEventRepository): AddFeedToEvent {
  return async function(req: AddFeedToEventRequest): ReturnType<AddFeedToEvent> {
    const event = await eventRepo.addFeedToEvent(req.event, req.feed)
    if (!event) {
      return AppResponse.error<MageEvent, EntityNotFoundError>(entityNotFound(req.event, 'MageEvent'))
    }
    return AppResponse.success<MageEvent, unknown>(event)
  }
}