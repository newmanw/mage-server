import { expect } from 'chai'
import { Substitute as Sub, Arg } from '@fluffy-spoon/substitute'
import uniqid from 'uniqid'
import { MageEvent, MageEventRepository } from '../../../lib/entities/events/entities.events'
import { AddFeedToEventRequest } from '../../../lib/app.api/events/app.api.events'
import { AddFeedToEvent } from '../../../lib/app.impl/events/app.impl.events'
import { MageError, ErrEntityNotFound } from '../../../lib/app.api/app.api.global.errors'

describe('events use case interactions', function() {

  let app: EventsUseCaseInteractions

  beforeEach(function() {
    app = new EventsUseCaseInteractions()
  })

  describe.only('assigning a feed to an event', function() {

    it('saves the feed to the event feeds list', async function() {

      const req: AddFeedToEventRequest = {
        context: {
          requestToken: Symbol(),
          requestingPrincipal: () => 'admin'
        },
        feed: uniqid(),
        event: 123
      }
      const event: MageEvent = { id: 123, feeds: [ req.feed ] }
      app.eventRepo.addFeedToEvent(req.event, req.feed).resolves(event)

      const res = await app.addFeedToEvent(req)

      expect(res.error).to.be.null
      expect(res.success).to.be.an('object')
      expect(res.success?.feeds).to.deep.equal([ req.feed ])
      app.eventRepo.received(1).addFeedToEvent(req.event, req.feed)
    })

    it('fails if the event id does not exist', async function() {

      const req: AddFeedToEventRequest = {
        context: {
          requestToken: Symbol(),
          requestingPrincipal: () => 'admin'
        },
        feed: uniqid(),
        event: 123
      }
      app.eventRepo.addFeedToEvent(Arg.all()).resolves(null)

      const res = await app.addFeedToEvent(req)

      expect(res.success).to.be.null
      expect(res.error).to.be.instanceOf(MageError)
      expect(res.error?.code).to.equal(ErrEntityNotFound)
      expect(res.error?.data.entityId).to.equal(req.event)
      expect(res.error?.data.entityType).to.equal('MageEvent')
      app.eventRepo.received(1).addFeedToEvent(req.event, req.feed)
    })

    xit('checks permission for assigning a feed to the event', async function() {
      // for now, because event logic is mostly legacy that will transition to,
      // the new architecture, permission handling for events will remain in
      // the express routing middleware.
      expect.fail('todo')
    })
  })
})

class EventsUseCaseInteractions {

  readonly eventRepo = Sub.for<MageEventRepository>()

  readonly addFeedToEvent = AddFeedToEvent(this.eventRepo)
}

