import _ from 'lodash'
import uniqid from 'uniqid'
import { expect } from 'chai'
import { Substitute as Sub, Arg, SubstituteOf } from '@fluffy-spoon/substitute'
import { MageEvent, MageEventId, MageEventRepository } from '../../../lib/entities/events/entities.events'
import { AddFeedToEventRequest, ListEventFeedsRequest } from '../../../lib/app.api/events/app.api.events'
import { AddFeedToEvent, ListEventFeeds } from '../../../lib/app.impl/events/app.impl.events'
import { MageError, ErrEntityNotFound, permissionDenied, ErrPermissionDenied, EntityNotFoundError } from '../../../lib/app.api/app.api.errors'
import { AppRequest } from '../../../lib/app.api/app.api.global'
import { Feed, FeedRepository, FeedServiceRepository, FeedServiceTypeRepository } from '../../../lib/entities/feeds/entities.feeds'
import { EventPermissionServiceImpl } from '../../../lib/permissions/permissions.events'
import { UserDocument } from '../../../src/models/user'


function requestBy<P extends object>(user: string, params: P): AppRequest<SubstituteOf<UserDocument>> & P {
  const userDoc = Sub.for<UserDocument>()
  userDoc.id.returns!(uniqid())
  return {
    context: {
      requestToken: Symbol(),
      requestingPrincipal: () => userDoc
    },
    ...params
  }
}

describe.only('event feeds use case interactions', function() {

  let app: EventsUseCaseInteractions
  let event: MageEvent

  beforeEach(function() {
    app = new EventsUseCaseInteractions()
    event = {
      id: 123,
      name: 'Maintenance Issues',
      teamIds: [],
      layerIds: [],
      style: {},
      forms: [],
      acl: {},
      feedIds: []
    }
  })

  describe('assigning a feed to an event', function() {

    it('saves the feed to the event feeds list', async function() {

      const req: AddFeedToEventRequest = requestBy('admin', {
        feed: uniqid(),
        event: event.id
      })
      const updatedEvent = { ...event }
      updatedEvent.feedIds = [ req.feed ]
      app.eventRepo.findById(event.id).resolves(event)
      app.eventRepo.addFeedsToEvent(req.event, req.feed).resolves(updatedEvent)
      app.permissionService.ensureEventUpdatePermission(Arg.all()).resolves(null)

      const res = await app.addFeedToEvent(req)

      expect(res.error).to.be.null
      expect(res.success).to.be.an('object')
      expect(res.success?.feedIds).to.deep.equal([ req.feed ])
      app.eventRepo.received(1).addFeedsToEvent(req.event, req.feed)
    })

    it('fails if the event id does not exist', async function() {

      const req: AddFeedToEventRequest = requestBy('admin', {
        feed: uniqid(),
        event: event.id
      })
      app.eventRepo.findById(Arg.all()).resolves(null)
      app.eventRepo.addFeedsToEvent(Arg.all()).resolves(null)
      app.permissionService.ensureEventUpdatePermission(Arg.all()).resolves(null)

      const res = await app.addFeedToEvent(req)

      expect(res.success).to.be.null
      expect(res.error).to.be.instanceOf(MageError)
      expect(res.error?.code).to.equal(ErrEntityNotFound)
      const err = res.error as EntityNotFoundError
      expect(err.data.entityId).to.equal(req.event)
      expect(err.data.entityType).to.equal('MageEvent')
      app.eventRepo.didNotReceive().addFeedsToEvent(Arg.all())
    })

    it('checks permission for assigning a feed to the event', async function() {

      const req: AddFeedToEventRequest = requestBy('admin', {
        feed: uniqid(),
        event: event.id
      })
      app.eventRepo.findById(req.event).resolves(event)
      app.eventRepo.addFeedsToEvent(Arg.all()).resolves(event)
      app.permissionService.ensureEventUpdatePermission(Arg.all()).resolves(permissionDenied('update_event', 'admin'))

      const res = await app.addFeedToEvent(req)

      expect(res.success).to.be.null
      expect(res.error).to.be.instanceOf(MageError)
      expect(res.error?.code).to.equal(ErrPermissionDenied)
      app.eventRepo.received(0).addFeedsToEvent(Arg.all())
      app.permissionService.received(1).ensureEventUpdatePermission(req.context)
    })
  })

  describe('listing event feeds', function() {

    let eventId: MageEventId
    let event: MageEvent

    beforeEach(async function() {
      eventId = new Date().getMilliseconds()
      event = {
        id: eventId,
        name: 'List Event Feeds',
        teamIds: [],
        layerIds: [],
        forms: [],
        style: {},
        acl: {},
        feedIds: [ uniqid(), uniqid() ]
      }
      app.eventRepo.findById(eventId).resolves(event)
    })

    it('returns feeds for an event', async function() {

      const feeds: Feed[] = [
        {
          id: event.feedIds[0],
          service: uniqid(),
          topic: 'topic1',
          title: 'Feed 1',
          itemsHaveIdentity: true,
          itemsHaveSpatialDimension: true,
        },
        {
          id: event.feedIds[1],
          service: uniqid(),
          topic: 'topic2',
          title: 'Feed 2',
          itemsHaveIdentity: true,
          itemsHaveSpatialDimension: true,
        }
      ]
      event.feedIds = feeds.map(x => x.id)
      app.feedRepo.findFeedsByIds(...event.feedIds).resolves(feeds)
      app.permissionService.ensureEventReadPermission(Arg.all()).resolves(null)
      const req: ListEventFeedsRequest = requestBy('admin', { event: eventId })
      const res = await app.listEventFeeds(req)

      expect(res.error).to.be.null
      expect(res.success).to.be.an('array')
      expect(res.success).to.deep.equal(feeds)
    })

    it('omits feed properties users should not see', async function() {

      const feed: Feed = {
        id: uniqid(),
        service: uniqid(),
        topic: 'topic1',
        title: 'Feed 1',
        summary: 'Feed 1 for testing',
        itemsHaveIdentity: true,
        itemsHaveSpatialDimension: true,
        itemPrimaryProperty: 'label',
        itemSecondaryProperty: 'level',
        itemTemporalProperty: 'timestamp',
        updateFrequency: {
          seconds: 3600
        },
        variableParamsSchema: {
          type: 'object',
          properties: {
            bbox: {
              type: 'array',
              items: { type: 'number' }
            }
          }
        },
        constantParams: {
          apiKey: 'abc123'
        }
      }
      event.feedIds.push(feed.id)
      app.feedRepo.findFeedsByIds(...event.feedIds).resolves([ feed ])
      app.permissionService.ensureEventReadPermission(Arg.all()).resolves(null)
      const req: ListEventFeedsRequest = requestBy('admin', { event: eventId })
      const res = await app.listEventFeeds(req)

      expect(res.error).to.be.null
      expect(res.success).to.be.an('array')
      expect(res.success).to.deep.equal([
        _.omit(feed, 'constantParams')
      ])
    })

    it('fails if the event does not exist', async function() {

      const req: ListEventFeedsRequest = requestBy('admin', {
        event: eventId + 1
      })
      app.eventRepo.findById(req.event).resolves(null)
      const res = await app.listEventFeeds(req)

      expect(res.success).to.be.null
      expect(res.error).to.be.instanceOf(MageError)
      expect(res.error?.code).to.equal(ErrEntityNotFound)
      const err = res.error as EntityNotFoundError
      expect(err.data.entityId).to.equal(req.event)
      expect(err.data.entityType).to.equal('MageEvent')
    })

    it('checks permission for listing event feeds', async function() {

      const req: ListEventFeedsRequest = requestBy('admin', { event: event.id })
      app.feedRepo.findFeedsByIds(...event.feedIds).resolves([])
      app.permissionService.ensureEventReadPermission(Arg.all()).resolves(permissionDenied('read_event_user', 'admin'))
      const res = await app.listEventFeeds(req)

      expect(res.success).to.be.null
      expect(res.error).to.be.instanceOf(MageError)
      expect(res.error?.code).to.equal(ErrPermissionDenied)
      app.feedRepo.didNotReceive().findFeedsByIds(Arg.all())
      app.permissionService.received(1).ensureEventReadPermission(req.context)
    })
  })
})

class EventsUseCaseInteractions {

  readonly eventRepo = Sub.for<MageEventRepository>()
  readonly feedRepo = Sub.for<FeedRepository>()
  readonly feedServiceRepo = Sub.for<FeedServiceRepository>()
  readonly feedServiceTypeRepo = Sub.for<FeedServiceTypeRepository>()
  readonly permissionService = Sub.for<EventPermissionServiceImpl>()

  readonly addFeedToEvent = AddFeedToEvent(this.permissionService, this.eventRepo)
  readonly listEventFeeds = ListEventFeeds(this.permissionService, this.eventRepo, this.feedRepo)
}
