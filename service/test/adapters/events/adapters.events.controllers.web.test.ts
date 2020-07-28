import { beforeEach } from 'mocha'
import express from 'express'
import { expect } from 'chai'
import supertest from 'supertest'
import { Substitute as Sub, SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import uniqid from 'uniqid'
import _ from 'lodash'
import { AppResponse, AppRequestContext, AppRequest } from '../../../lib/app.api/app.api.global'
import EventRoutes from '../../../lib/routes/events'
import { ListEventFeeds } from '../../../lib/app.impl/events/app.impl.events'
import { WebAppRequestFactory } from '../../../lib/adapters/adapters.controllers.web'
import { MageEvent, MageEventId, MageEventJson } from '../../../lib/entities/events/entities.events'
import { AddFeedToEvent, AddFeedToEventRequest } from '../../../lib/app.api/events/app.api.events'

const rootPath = '/test/events'
const jsonMimeType = /^application\/json/
const testUser = 'lummytin'

describe('event feeds web controller', function() {

  let createAppRequest: WebAppRequestFactory = <P>(webReq: express.Request, params?: P): AppRequest<typeof testUser> & P => {
    return {
      context: {
        requestToken: Symbol(),
        requestingPrincipal(): typeof testUser {
          return testUser
        }
      },
      ...(params || {})
    } as AppRequest<typeof testUser> & P
  }
  let eventFeedsRoutes: express.Router
  let app: express.Application
  let eventFeedsApp: SubstituteOf<EventRoutes.EventFeedsApp>
  let client: supertest.SuperTest<supertest.Test>

  beforeEach(function() {
    eventFeedsApp = Sub.for<EventRoutes.EventFeedsApp>()
    eventFeedsRoutes = EventRoutes.FeedRoutes(eventFeedsApp, createAppRequest)
    app = express()
    app.use(rootPath, eventFeedsRoutes)
    client = supertest(app)
  })

  describe('POST /events/{eventId}/feeds', function() {

    it('adds a feed to the context event', async function() {

      const eventId: MageEventId = 123
      const feedId = uniqid()
      const event: MageEvent = {
        id: eventId,
        name: 'Test Event',
        description: 'For testing',
        collectionName: 'observations' + eventId,
        complete: false,
        forms: [],
        teamIds: [],
        layerIds: [],
        feedIds: [ feedId ],
        style: {},
        acl: {
          [testUser]: 'GUEST'
        }
      }
      const eventJson = _.omit(event, 'acl') as any
      eventJson.acl =  { acl: { [testUser]: { role: 'GUEST', permissions: 'read' }}}

      const requestParams: Partial<AddFeedToEventRequest> = {
        event: eventId,
        feed: feedId
      }
      eventFeedsApp.addFeedToEvent(Arg.is(x => _.isMatch(x, requestParams)))
        .resolves(AppResponse.success<MageEvent, unknown>(event))
      const res = await client
        .post(`${rootPath}/${eventId}/feeds`)
        .send(feedId)

      expect(res.status).to.equal(200)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.deep.equal(eventJson as MageEventJson)
      eventFeedsApp.received(1).addFeedToEvent(Arg.is(x => _.isMatch(x, requestParams)))
    })

    it('fails with 404 if the event does not exist', async function() {
      expect.fail('todo')
    })

    it('fails with 400 if the feed does not exist', async function() {
      expect.fail('todo')
    })
  })

  describe('GET /events/{eventId}/feeds/{feedId}/content', function() {

    it('has tests', async function() {
      expect.fail('todo')
    })
  })
})