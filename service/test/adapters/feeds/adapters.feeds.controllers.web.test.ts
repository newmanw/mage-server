
import { beforeEach } from 'mocha'
import express from 'express'
import { expect } from 'chai'
import supertest from 'supertest'
import Substitute, { SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import uniqid from 'uniqid'
import _, { functionsIn } from 'lodash'
import { AppResponse, AppRequestContext, AppRequest } from '../../../lib/app.api/app.api.global'
import { FeedsRoutes, FeedsAppLayer } from '../../../lib/adapters/feeds/adapters.feeds.controllers.web'
import { CreateFeedServiceRequest, FeedServiceTypeDescriptor, PreviewTopicsRequest, CreateFeedRequest } from '../../../lib/app.api/feeds/app.api.feeds'
import { FeedService, Feed, FeedTopic } from '../../../lib/entities/feeds/entities.feeds'
import { permissionDenied, PermissionDeniedError, InvalidInputError, invalidInput, EntityNotFoundError, entityNotFound } from '../../../lib/app.api/app.api.global.errors'
import { WebAppRequestFactory } from '../../../lib/adapters/adapters.controllers.web'
import { JSONSchema4 } from 'json-schema'

declare module 'express-serve-static-core' {
  interface Request {
    testUser: string
  }
}

const jsonMimeType = /^application\/json/

describe('feeds web controller', function() {

  const adminPrincipal = {
    user: 'admin'
  }

  const createAdminRequest = <Params>(p?: Params): Params & AppRequest<{ user: string }> => {
    const safeParams = p || {} as any
    return {
      ...safeParams,
      context: {
        requestToken: Symbol(),
        requestingPrincipal() {
          return adminPrincipal
        }
      }
    }
  }

  type AppRequestFactoryHandle = {
    createRequest: WebAppRequestFactory
  }

  const rootPath = '/test/feeds'
  let client: supertest.SuperTest<supertest.Test>
  let appLayer: SubstituteOf<FeedsAppLayer>
  let appRequestFactory: SubstituteOf<AppRequestFactoryHandle>

  beforeEach(function() {
    appLayer = Substitute.for<FeedsAppLayer>()
    appRequestFactory = Substitute.for<AppRequestFactoryHandle>()
    const feedsRoutes: express.Router = FeedsRoutes(appLayer, appRequestFactory.createRequest)
    const endpoint = express()
    endpoint.use(function lookupUser(req: express.Request, res: express.Response, next: express.NextFunction) {
      req.testUser = req.headers['user'] as string
      next()
    })
    endpoint.use(rootPath, feedsRoutes)
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
      const appReq = createAdminRequest()
      appRequestFactory.createRequest(Arg.any(), Arg.deepEquals(void 0)).returns(appReq)
      appLayer.listServiceTypes(Arg.deepEquals(appReq)).resolves(AppResponse.success(serviceTypes))
      const res = await client.get(`${rootPath}/service_types`)
        .set('user', adminPrincipal.user)

      expect(res.type).to.match(jsonMimeType)
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal(serviceTypes)
    })

    it('fails without permission', async function() {

      appLayer.listServiceTypes(Arg.any()).resolves(AppResponse.error<any, PermissionDeniedError>(permissionDenied('list service types', 'admin')))

      const res = await client.get(`${rootPath}/service_types`)

      expect(res.status).to.equal(403)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('permission denied: list service types')
    })
  })

  describe('POST /service_types/:serviceTypeId/topic_preview', function() {

    it('returns the list of topics for the service config', async function() {

      const topics: FeedTopic[] = [
        {
          id: 'asam',
          title: 'Anti-Shipping Activity Messages',
          itemsHaveSpatialDimension: true,
          itemTemporalProperty: 'date',
          itemPrimaryProperty: 'description'
        },
        {
          id: 'navwarn',
          title: 'Navigational Warnings',
          itemsHaveSpatialDimension: false,
          itemTemporalProperty: 'issueDate'
        }
      ]
      const postBody = {
        serviceConfig: 'https://msi.gs.mil'
      }
      const reqParams = {
        ...postBody,
        serviceType: 'nga-msi'
      }
      const appReq: PreviewTopicsRequest = createAdminRequest(reqParams)
      appRequestFactory.createRequest(Arg.any(), Arg.deepEquals(reqParams)).returns(appReq)
      appLayer.previewTopics(Arg.deepEquals(appReq))
        .resolves(AppResponse.success<FeedTopic[], unknown>(topics))

      const res = await client.post(`${rootPath}/service_types/nga-msi/topic_preview`).send(postBody)

      expect(res.status).to.equal(200)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.deep.equal(topics)
    })

    it('fails with 403 without permission', async function() {

      appLayer.previewTopics(Arg.any())
        .resolves(AppResponse.error<FeedTopic[], PermissionDeniedError>(permissionDenied('preview topics', 'you')))

      const res = await client.post(`${rootPath}/service_types/nga-msi/topic_preview`).send({
        serviceConfig: 'https://msi.gs.mil'
      })

      expect(res.status).to.equal(403)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('permission denied: preview topics')
    })

    it('fails with 404 if the service type does not exist', async function() {

      appLayer.previewTopics(Arg.any())
        .resolves(AppResponse.error<FeedTopic[], EntityNotFoundError>(entityNotFound('nga-msi', 'feed service type')))

      const res = await client.post(`${rootPath}/service_types/nga-msi/topic_preview`).send({
        serviceConfig: 'does not exist'
      })

      expect(res.status).to.equal(404)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('feed service type not found: nga-msi')
    })

    it('fails with 400 if the service config is invalid', async function() {

      appLayer.previewTopics(Arg.any())
        .resolves(AppResponse.error<FeedTopic[], InvalidInputError>(invalidInput('bad service config', [ 'unexpected null', 'serviceConfig' ])))

      const res = await client.post(`${rootPath}/service_types/nga-msi/topic_preview`).send({
        serviceConfig: null
      })

      expect(res.status).to.equal(400)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('bad service config\n  serviceConfig: unexpected null')
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
      const appReq: CreateFeedServiceRequest = createAdminRequest(submitted)
      const created: FeedService = {
        id: `wfs:${uniqid()}`,
        ...submitted
      }
      appRequestFactory.createRequest(Arg.any(), Arg.deepEquals(submitted)).returns(appReq)
      appLayer.createService(Arg.deepEquals(appReq)).resolves(AppResponse.success(created))

      const res = await client.post(`${rootPath}/services`)
        .set('user', adminPrincipal.user)
        .send(submitted)

      expect(res.status).to.equal(201)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.deep.equal(created)
    })

    it('fails with 403 without permission', async function() {

      appLayer.createService(Arg.any()).resolves(AppResponse.error<any, PermissionDeniedError>(permissionDenied('create service', 'admin')))

      const res = await client.post(`${rootPath}/services`)
        .send({
          serviceType: 'nga-msi',
          title: 'NGA Maritime Safety Information',
          config: null
        })

      expect(res.status).to.equal(403)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('permission denied: create service')
    })

    it('fails with 400 if the request is invalid', async function() {

      const reqBody = {
        serviceType: 'wfs',
        title: 'Invalid Service',
        config: {
          url: 'https://invalid.service.url'
        },
      }
      appLayer.createService(Arg.any()).resolves(AppResponse.error<any, InvalidInputError>(invalidInput('invalid service config', [ 'url is invalid', 'config', 'url' ])))

      const res = await client.post(`${rootPath}/services`).send(reqBody)

      expect(res.status).to.equal(400)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal(`
invalid service config
  config > url: url is invalid`
        .trim())
      appLayer.received(1).createService(Arg.any())
    })

    it('fails with 400 if the service type does not exist', async function() {

      const reqBody = {
        serviceType: 'not_found',
        title: 'What Service Type?',
        config: {}
      }
      appLayer.createService(Arg.any()).resolves(AppResponse.error<any, EntityNotFoundError>(entityNotFound(reqBody.serviceType, 'FeedServiceType')))

      const res = await client.post(`${rootPath}/services`).send(reqBody)

      expect(res.status).to.equal(400)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('service type not found')
      appLayer.received(1).createService(Arg.any())
    })

    describe('request body mapping', function() {

      it('fails with 400 if the request body has no service type', async function() {

        appLayer.createService(Arg.any()).rejects(new Error('unexpected'))
        const res = await client.post(`${rootPath}/services`)
          .send({
            title: 'Forgot Service Type',
            config: {
              url: 'https://unknown.service.type'
            }
          })

        expect(res.status).to.equal(400)
        expect(res.type).to.match(jsonMimeType)
        expect(res.body).to.equal(`
invalid request
  serviceType: missing
          `.trim())
        appLayer.didNotReceive().createService(Arg.any())
      })

      it('fails if the request body has no title', async function() {

        appLayer.createService(Arg.any()).rejects(new Error('unexpected'))
        const res = await client.post(`${rootPath}/services`)
          .send({
            serviceType: 'wfs',
            config: {
              url: 'https://usgs.gov/earthquakes'
            }
          })

        expect(res.status).to.equal(400)
        expect(res.type).to.match(jsonMimeType)
        expect(res.body).to.equal(`
invalid request
  title: missing`
          .trim())
        appLayer.didNotReceive().createService(Arg.any())
      })

      it('maps absent config to null', async function() {

        const params = {
          serviceType: 'configless',
          title: 'No Config Necessary',
          config: null,
          summary: undefined,
        }
        const appReq: CreateFeedServiceRequest = createAdminRequest(params)
        const created = {
          id: uniqid(),
          serviceType: 'configless',
          title: 'No Config Necessary',
          summary: null,
          config: null,
        }
        appRequestFactory.createRequest(Arg.any(), Arg.deepEquals(params)).returns(appReq)
        appLayer.createService(Arg.deepEquals(appReq))
          .resolves(AppResponse.success<FeedService, unknown>(created))

        const res = await client.post(`${rootPath}/services`)
          .set('user', 'admin')
          .send(_.omit(appReq, 'config'))

        expect(res.status).to.equal(201)
        expect(res.type).to.match(jsonMimeType)
        expect(res.body).to.deep.equal(created)
        appLayer.received(1).createService(Arg.deepEquals(appReq))
      })
    })
  })

  describe('GET /services', function() {

    it('returns all the services', async function() {

      const appReq = createAdminRequest()
      appRequestFactory.createRequest(Arg.any()).returns(appReq)
      const services: FeedService[] = [
        {
          id: 'wfs:' + uniqid(),
          serviceType: 'wfs',
          title: 'Agricultural Features',
          config: 'https://usda.gov/wfs/ag',
          summary: null
        },
        {
          id: 'denver_weather:' + uniqid(),
          serviceType: 'denver_weather',
          title: 'Denver Area Weather Updates',
          config: null,
          summary: 'A propprietary service that provides updates about Denver area local weather events'
        }
      ]
      appLayer.listServices(Arg.is((x: AppRequest) => x.context.requestToken === appReq.context.requestToken))
        .resolves(AppResponse.success<FeedService[], unknown>(services))
      const res = await client.get(`${rootPath}/services`)

      expect(res.status).to.equal(200)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.deep.equal(services)
    })

    it('returns 403 without permission', async function() {

      appLayer.listServices(Arg.any())
        .resolves(AppResponse.error<FeedService[], PermissionDeniedError>(permissionDenied('list services', 'you')))
      const res = await client.get(`${rootPath}/services`)

      expect(res.status).to.equal(403)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('permission denied: list services')
    })
  })

  describe('POST /services/{serviceId}/topics/{topicId}/feeds', function() {

    it('creates a feed for service and topic', async function() {

      const service = uniqid()
      const topic = uniqid()
      const postBody = {
        title: 'Created Feed',
        summary: 'The feed we created',
        constantParams: {
          test: true
        },
        variableParamsSchema: <JSONSchema4>{
          type: 'object',
          properties: {
            where: {
              type: 'array', items: { type: 'number' }
            },
            when: {
              type: 'number'
            }
          }
        }
      }
      const appReq: CreateFeedRequest = createAdminRequest({
        feed: {
          service,
          topic,
          ...postBody,
          itemsHaveIdentity: undefined,
          itemsHaveSpatialDimension: undefined,
          itemPrimaryProperty: undefined,
          itemSecondaryProperty: undefined,
          itemTemporalProperty: undefined,
          updateFrequency: undefined
        }
      })
      const feed: Feed = {
        id: uniqid(),
        service,
        topic,
        title: appReq.feed.title!,
        summary: appReq.feed.summary!,
        itemsHaveIdentity: false,
        itemsHaveSpatialDimension: false,
        constantParams: appReq.feed.constantParams,
        variableParamsSchema: appReq.feed.variableParamsSchema
      }
      appRequestFactory.createRequest(Arg.any(), Arg.deepEquals({ feed: appReq.feed })).returns(appReq)
      appLayer.createFeed(Arg.is((x: AppRequest) => x.context?.requestToken === appReq.context.requestToken)).resolves(AppResponse.success<Feed, unknown>(feed))

      const res = await client
        .post(`${rootPath}/services/${service}/topics/${topic}/feeds`)
        .send(postBody)

      expect(res.status).to.equal(201)
      expect(res.header.location).to.equal(`${rootPath}/all_feeds/${feed.id}`)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.deep.equal(feed)
    })

    it('tests all the input parameters', async function() {
      expect.fail('todo')
    })

    it('returns 403 for permission denied error', async function() {
      expect.fail('todo')
    })

    it('returns 404 when the service does not exist', async function() {
      expect.fail('todo')
    })

    it('returns 500 when the service type is not found', async function() {
      expect.fail('todo')
    })
  })

  describe('GET /all_feeds', function() {

  })

  describe('GET /all_feeds/{feedId}', function() {

  })
})