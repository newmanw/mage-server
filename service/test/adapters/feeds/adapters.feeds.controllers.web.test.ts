
import { beforeEach } from 'mocha'
import express from 'express'
import { expect } from 'chai'
import supertest from 'supertest'
import Substitute, { SubstituteOf } from '@fluffy-spoon/substitute'
import { FeedServiceTypeDescriptor } from '../../../lib/entities/feeds/entities.feeds'
import { FeedsRoutes, FeedsAppLayer, AuthenticatedWebRequest } from '../../../lib/adapters/feeds/adapters.feeds.controllers.web'
import { AppResponse } from '../../../lib/app.api/app.api.global'

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

    expect(res.type).to.match(/application\/json/)
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal(serviceTypes)
  })
})