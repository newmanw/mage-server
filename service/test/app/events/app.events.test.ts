import _ from 'lodash'
import uniqid from 'uniqid'
import { expect } from 'chai'
import { Substitute as Sub, Arg } from '@fluffy-spoon/substitute'
import { MageEvent, MageEventId, MageEventRepository } from '../../../lib/entities/events/entities.events'
import { AddFeedToEventRequest, ListEventFeedsRequest } from '../../../lib/app.api/events/app.api.events'
import { AddFeedToEvent, ListEventFeeds } from '../../../lib/app.impl/events/app.impl.events'
import { MageError, ErrEntityNotFound } from '../../../lib/app.api/app.api.global.errors'
import { AppRequest } from '../../../lib/app.api/app.api.global'
import { Feed, FeedRepository, FeedServiceRepository, FeedServiceTypeRepository } from '../../../lib/entities/feeds/entities.feeds'


function requestBy<P extends object>(user: string, params: P): AppRequest<string> & P {
  return {
    context: {
      requestToken: Symbol(),
      requestingPrincipal: () => user
    },
    ...params
  }
}

describe('events use case interactions', function() {

  let app: EventsUseCaseInteractions

  beforeEach(function() {
    app = new EventsUseCaseInteractions()
  })

  describe('assigning a feed to an event', function() {

    it('saves the feed to the event feeds list', async function() {

      const req: AddFeedToEventRequest = requestBy('admin', {
        feed: uniqid(),
        event: 123
      })
      const event: MageEvent = {
        id: 123,
        name: 'Maintenance Issues',
        teamIds: [],
        layerIds: [],
        style: {},
        forms: [],
        acl: {},
        feedIds: [ req.feed ]
      }
      app.eventRepo.addFeedsToEvent(req.event, req.feed).resolves(event)

      const res = await app.addFeedToEvent(req)

      expect(res.error).to.be.null
      expect(res.success).to.be.an('object')
      expect(res.success?.feedIds).to.deep.equal([ req.feed ])
      app.eventRepo.received(1).addFeedsToEvent(req.event, req.feed)
    })

    it('fails if the event id does not exist', async function() {

      const req: AddFeedToEventRequest = requestBy('admin', {
        feed: uniqid(),
        event: 123
      })
      app.eventRepo.addFeedsToEvent(Arg.all()).resolves(null)

      const res = await app.addFeedToEvent(req)

      expect(res.success).to.be.null
      expect(res.error).to.be.instanceOf(MageError)
      expect(res.error?.code).to.equal(ErrEntityNotFound)
      expect(res.error?.data.entityId).to.equal(req.event)
      expect(res.error?.data.entityType).to.equal('MageEvent')
      app.eventRepo.received(1).addFeedsToEvent(req.event, req.feed)
    })

    xit('checks permission for assigning a feed to the event', async function() {
      // for now, because event logic is mostly legacy that will transition to,
      // the new architecture, permission handling for events will remain in
      // the express routing middleware.
      expect.fail('todo')
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
      app.feedRepo.findFeedsByIds(...event.feedIds).resolves(feeds)
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
      const req: ListEventFeedsRequest = requestBy('admin', { event: eventId })
      app.feedRepo.findFeedsByIds(...event.feedIds).resolves([ feed ])
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
      expect(res.error?.data.entityId).to.equal(req.event)
      expect(res.error?.data.entityType).to.equal('MageEvent')
    })

    xit('checks permission for listing event feeds', async function() {
      expect.fail('todo: legacy express middleware handles this for now')
    })
  })
})

class EventsUseCaseInteractions {

  readonly eventRepo = Sub.for<MageEventRepository>()
  readonly feedRepo = Sub.for<FeedRepository>()
  readonly feedServiceRepo = Sub.for<FeedServiceRepository>()
  readonly feedServiceTypeRepo = Sub.for<FeedServiceTypeRepository>()

  readonly addFeedToEvent = AddFeedToEvent(this.eventRepo)
  readonly listEventFeeds = ListEventFeeds(this.eventRepo, this.feedRepo)
}
