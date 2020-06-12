
import { beforeEach } from 'mocha'
import express from 'express'
import { expect } from 'chai'
import supertest from 'supertest'
import Substitute, { SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import uniqid from 'uniqid'
import _ from 'lodash'
import { AppResponse } from '../../../lib/app.api/app.api.global'
import { FeedsRoutes, FeedsAppLayer, AuthenticatedWebRequest } from '../../../lib/adapters/feeds/adapters.feeds.controllers.web'
import { CreateFeedServiceRequest, FeedServiceTypeDescriptor } from '../../../lib/app.api/feeds/app.api.feeds'
import { FeedService } from '../../../lib/entities/feeds/entities.feeds'
import { permissionDenied, PermissionDeniedError, InvalidInputError, invalidInput, EntityNotFoundError, entityNotFound } from '../../../lib/app.api/app.api.global.errors'
import { AppRequestFactory } from '../../../lib/adapters/adapters.controllers.global'

const jsonMimeType = /^application\/json/

describe('feeds web adapter', function() {

  const adminPrincipal = {
    user: 'admin'
  }

  const createAdminRequest: AppRequestFactory = <Params>(p: Params) => {
    return {
      ...p,
      context: {
        requestToken: Symbol(),
        requestingPrincipal() {
          return adminPrincipal
        }
      }
    }
  }

  let client: supertest.SuperTest<supertest.Test>
  let appLayer: SubstituteOf<FeedsAppLayer>

  beforeEach(function() {
    appLayer = Substitute.for<FeedsAppLayer>()
    const feedsRoutes: express.Router = FeedsRoutes(appLayer, createAdminRequest)
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
      appLayer.listServiceTypes(Arg.deepEquals(adminPrincipal)).resolves(AppResponse.success(serviceTypes))
      const res = await client.get('/service_types')
        .set('user', adminPrincipal.user)

      expect(res.type).to.match(jsonMimeType)
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal(serviceTypes)
    })

    it('fails without permission', async function() {

      appLayer.listServiceTypes(Arg.any()).resolves(AppResponse.error<any, PermissionDeniedError>(permissionDenied('list service types', 'admin')))

      const res = await client.get('/service_types')

      expect(res.status).to.equal(403)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('permission denied: list service types')
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
      appLayer.createService(Arg.deepEquals(appReq)).resolves(AppResponse.success(created))

      const res = await client.post('/services')
        .set('user', adminPrincipal.user)
        .send(submitted)

      expect(res.status).to.equal(201)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.deep.equal(created)
    })

    it('fails without permission', async function() {

      appLayer.createService(Arg.any()).resolves(AppResponse.error<any, PermissionDeniedError>(permissionDenied('create service', 'admin')))

      const res = await client.post('/services')
        .send({
          serviceType: 'nga-msi',
          title: 'NGA Maritime Safety Information',
          config: null
        })

      expect(res.status).to.equal(403)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('permission denied: create service')
    })

    it('fails if the request is invalid', async function() {

      const reqBody = {
        serviceType: 'wfs',
        title: 'Invalid Service',
        config: {
          url: 'https://invalid.service.url'
        },
      }
      appLayer.createService(Arg.any()).resolves(AppResponse.error<any, InvalidInputError>(invalidInput('invalid service url')))

      const res = await client.post('/services').send(reqBody)

      expect(res.status).to.equal(400)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal(`
invalid input:
  invalid service url`
        .trim())
      appLayer.received(1).createService(Arg.any())
    })

    it('fails if the service type does not exist', async function() {

      const reqBody = {
        serviceType: 'not_found',
        title: 'What Service Type?',
        config: {}
      }
      appLayer.createService(Arg.any()).resolves(AppResponse.error<any, EntityNotFoundError>(entityNotFound(reqBody.serviceType, 'FeedServiceType')))

      const res = await client.post('/services').send(reqBody)

      expect(res.status).to.equal(400)
      expect(res.type).to.match(jsonMimeType)
      expect(res.body).to.equal('service type not found')
      appLayer.received(1).createService(Arg.any())
    })

    describe('request body mapping', function() {

      it('fails if the request body has no service type', async function() {

        appLayer.createService(Arg.any()).rejects(new Error('unexpected'))
        const res = await client.post('/services')
          .send({
            title: 'Forgot Service Type',
            config: {
              url: 'https://unknown.service.type'
            }
          })

        expect(res.status).to.equal(400)
        expect(res.type).to.match(jsonMimeType)
        expect(res.body).to.equal(`
invalid input:
  missing service type
          `.trim())
        appLayer.didNotReceive().createService(Arg.any())
      })

      it('fails if the request body has no title', async function() {

        appLayer.createService(Arg.any()).rejects(new Error('unexpected'))
        const res = await client.post('/services')
          .send({
            serviceType: 'wfs',
            config: {
              url: 'https://usgs.gov/earthquakes'
            }
          })

        expect(res.status).to.equal(400)
        expect(res.type).to.match(jsonMimeType)
        expect(res.body).to.equal(`
invalid input:
  missing title`
          .trim())
        appLayer.didNotReceive().createService(Arg.any())
      })

      it('maps absent config to null', async function() {

        const appReq: CreateFeedServiceRequest = createAdminRequest({
          serviceType: 'configless',
          title: 'No Config Necessary',
          config: null,
          summary: undefined,
        })
        const created = {
          id: uniqid(),
          serviceType: 'configless',
          title: 'No Config Necessary',
          summary: null,
          config: null,
        }
        appLayer.createService(Arg.deepEquals(appReq))
          .resolves(AppResponse.success<FeedService, unknown>(created))

        const res = await client.post('/services')
          .set('user', 'admin')
          .send(_.omit(appReq, 'config'))

        expect(res.status).to.equal(201)
        expect(res.type).to.match(jsonMimeType)
        expect(res.body).to.deep.equal(created)
        appLayer.received(1).createService(Arg.deepEquals(appReq))
      })
    })
  })
})