
import { beforeEach } from 'mocha'
import express from 'express'
import { expect } from 'chai'
import supertest from 'supertest'
import Substitute, { SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import uniqid from 'uniqid'
import { AppResponse } from '../../../lib/app.api/app.api.global'
import { FeedsRoutes, FeedsAppLayer, AuthenticatedWebRequest } from '../../../lib/adapters/feeds/adapters.feeds.controllers.web'
import { CreateFeedServiceRequest, FeedServiceTypeDescriptor, FeedServiceDescriptor } from '../../../lib/app.api/feeds/app.api.feeds'
import { FeedService } from '../../../src/entities/feeds/entities.feeds'

const jsonMimeType = /^application\/json/

describe.only('feeds web adapter', function() {

  const adminPrincipal = {
    user: 'admin'
  }

  let client: supertest.SuperTest<supertest.Test>
  let appLayer: SubstituteOf<FeedsAppLayer>

  beforeEach(function() {
    appLayer = Substitute.for<FeedsAppLayer>()
    const feedsRoutes: express.Router = FeedsRoutes(appLayer)
    const endpoint = express()
    endpoint.use(function lookupUser(req: express.Request, res: express.Response, next: express.NextFunction) {
      const authReq = req as AuthenticatedWebRequest
      authReq.userId = req.headers['user'] as string
      next()
    })
    endpoint.use('/', feedsRoutes)
    client = supertest(endpoint)
  })

  describe('GET /service_types', function() {

    it('lists service types', async function() {

      const serviceTypes: FeedServiceTypeDescriptor[] = [
        {
          descriptorOf: 'FeedServiceType',
          id: 'wfs',
          title: 'Web Feature Service',
          summary: null,
          configSchema: {
            title: 'URL',
            description: 'The base URL of the WFS endpoint',
            type: 'string',
            format: 'uri'
          }
        },
        {
          descriptorOf: 'FeedServiceType',
          id: 'nws',
          title: 'National Weather Service',
          summary: null,
          configSchema: null
        }
      ]
      appLayer.listServiceTypes(adminPrincipal).resolves(AppResponse.success(serviceTypes))
      const res = await client.get('/service_types')
        .set('user', adminPrincipal.user)

      expect(res.type).to.match(jsonMimeType)
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal(serviceTypes)
    })
  })

  describe('POST /services', function() {

    it('creates a service', async function() {

      const submitted = {
        serviceType: 'wfs',
        title: 'USGS Earthquake Data',
        summary: 'Pull features from the USGS earthquake WFS endpoint',
        config: {
          url: 'https://usgs.gov/data/earthquakes/wfs?service=WFS'
        }
      }
      const appReq: CreateFeedServiceRequest = {
        ...submitted,
        ...adminPrincipal
      }
      const created: FeedService = {
        id: `wfs:${uniqid()}`,
        ...submitted
      }
      appLayer.createService(Arg.deepEquals(appReq)).resolves(AppResponse.success(created))

      const res = await client.post('/services')
        .set('user', adminPrincipal.user)
        .send(submitted)

      expect(res.status).to.equal(201)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.deep.equal(created)
    })
  })
})