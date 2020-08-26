import { describe, it, beforeEach, Context } from 'mocha'
import { expect } from 'chai'
import { Substitute as Sub, SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import { FeedServiceType, FeedTopic, FeedServiceTypeRepository, FeedServiceRepository, FeedServiceId, FeedServiceCreateAttrs, FeedsError, ErrInvalidServiceConfig, FeedService, FeedServiceConnection, RegisteredFeedServiceType, Feed, FeedMinimalAttrs, normalizeFeedMinimalAttrs, FeedRepository, FeedId, FeedContent, FeedUpdateAttrs, FeedCreateAttrs } from '../../../lib/entities/feeds/entities.feeds'
import { ListFeedServiceTypes, CreateFeedService, ListServiceTopics, PreviewTopics, ListFeedServices, PreviewFeed, CreateFeed, ListAllFeeds, FetchFeedContent, GetFeed, UpdateFeed, DeleteFeed } from '../../../lib/app.impl/feeds/app.impl.feeds'
import { MageError, EntityNotFoundError, PermissionDeniedError, ErrPermissionDenied, permissionDenied, ErrInvalidInput, ErrEntityNotFound, InvalidInputError, PermissionDeniedErrorData, KeyPathError } from '../../../lib/app.api/app.api.errors'
import { UserId } from '../../../lib/entities/authn/entities.authn'
import { FeedsPermissionService, ListServiceTopicsRequest, FeedServiceTypeDescriptor, PreviewTopicsRequest, FeedPreview, FetchFeedContentRequest, FeedExpanded, GetFeedRequest, UpdateFeedRequest, DeleteFeedRequest, CreateFeedServiceRequest } from '../../../lib/app.api/feeds/app.api.feeds'
import uniqid from 'uniqid'
import { AppRequestContext, AppRequest } from '../../../lib/app.api/app.api.global'
import { FeatureCollection } from 'geojson'
import { JsonObject, JsonSchemaService, JsonValidator } from '../../../lib/entities/entities.json_types'
import _ from 'lodash'


function mockServiceType(descriptor: FeedServiceTypeDescriptor): SubstituteOf<RegisteredFeedServiceType> {
  const mock = Sub.for<RegisteredFeedServiceType>()
  mock.id.returns!(descriptor.id)
  mock.title.returns!(descriptor.title)
  mock.summary.returns!(descriptor.summary)
  mock.configSchema.returns!(descriptor.configSchema)
  return mock
}

const someServiceTypeDescs: FeedServiceTypeDescriptor[] = [
  Object.freeze({
    descriptorOf: 'FeedServiceType',
    id: `ogc.wfs-${uniqid()}`,
    title: 'OGC Web Feature Service',
    summary: 'An OGC Web Feature Service is a standard interface to query geospatial features.',
    configSchema: {
      type: 'object',
      properties: {
        url: {
          title: 'Service URL',
          summary: 'The base URL of the WFS server',
          type: 'string',
          format: 'uri',
        }
      },
      required: [ 'url' ]
    },
  }),
  Object.freeze({
    descriptorOf: 'FeedServiceType',
    id: `ogc.oaf-${uniqid()}`,
    title: 'OGC API - Features Service',
    summary: 'An OGC API - Features service is a standard interface to query geospatial features.  OAF is the modern evolution of WFS.',
    configSchema: {
      type: 'object',
      properties: {
        url: {
          title: 'Service URL',
          summary: 'The base URL of the OAF server',
          type: 'string',
          format: 'uri',
        }
      },
      required: [ 'url' ]
    },
  })
]

type TestPrincipal = {
  user: string
}

const adminPrincipal: TestPrincipal = {
  user: 'admin'
}

const bannedPrincipal: TestPrincipal = {
  user: 'banned'
}

function requestBy<RequestType>(principal: TestPrincipal, params?: RequestType): AppRequest<TestPrincipal> & RequestType {
  return Object.create(params || {},
    {
      context: {
        value: {
          requestToken: uniqid(),
          requestingPrincipal() {
            return principal
          }
        }
      }
    }
  )
}

describe.only('feeds use case interactions', function() {

  let app: TestApp
  let someServiceTypes: SubstituteOf<RegisteredFeedServiceType>[]

  beforeEach(function() {
    app = new TestApp()
    someServiceTypes = someServiceTypeDescs.map(mockServiceType)
  })

  describe('feeds administration', function() {

    describe('listing available feed service types', async function() {

      beforeEach(function() {
        app.registerServiceTypes(...someServiceTypes)
      })

      it('returns all the feed service types', async function() {

        const serviceTypes = await app.listServiceTypes(requestBy(adminPrincipal)).then(res => res.success)

        expect(serviceTypes).to.deep.equal(someServiceTypeDescs)
      })

      it('checks permission for listing service types', async function() {

        const error = await app.listServiceTypes(requestBy(bannedPrincipal)).then(res => res.error)

        expect(error).to.be.instanceOf(MageError)
        expect(error?.code).to.equal(ErrPermissionDenied)
      })
    })

    describe('creating a feed service', async function() {

      beforeEach(function() {
        app.registerServiceTypes(...someServiceTypes)
      })

      it('checks permission for creating a feed service', async function() {

        const serviceType = someServiceTypes[1]
        const config = { url: 'https://does.not/matter' }
        const err = await app
          .createService(requestBy(bannedPrincipal, { serviceType: serviceType.id, title: 'Test Service', config }))
          .then(res => res.error)

        expect(err?.code).to.equal(ErrPermissionDenied)
        expect(app.serviceRepo.db).to.be.empty
        serviceType.didNotReceive().validateServiceConfig(Arg.any())
      })

      it('fails if the feed service config is invalid', async function() {

        const serviceType = someServiceTypes[0]
        const invalidConfig = {
          url: null
        }
        serviceType.validateServiceConfig(Arg.any()).resolves(new FeedsError(ErrInvalidServiceConfig, { invalidKeys: ['url'], config: invalidConfig }))
        const err = await app
          .createService(requestBy(adminPrincipal, { serviceType: serviceType.id, title: 'Test Service', config: invalidConfig }))
          .then(res => res.error as InvalidInputError)

        expect(err).to.be.instanceOf(MageError)
        expect(err.code).to.equal(ErrInvalidInput)
        expect(err.data).to.deep.equal([[ 'url is invalid', 'config', 'url' ]])
        expect(app.serviceRepo.db).to.be.empty
        serviceType.received(1).validateServiceConfig(Arg.deepEquals(invalidConfig) as any)
      })

      it('fails if the feed service type does not exist', async function() {

        const invalidServiceType = `${someServiceTypes[0].id}.${uniqid()}`
        const invalidConfig = {
          url: null
        }
        const err = await app
          .createService(requestBy(adminPrincipal, { serviceType: invalidServiceType, title: 'Test Serivce', config: invalidConfig }))
          .then(res => res.error as EntityNotFoundError)

        expect(err.code).to.equal(ErrEntityNotFound)
        expect(err.data?.entityId).to.equal(invalidServiceType)
        expect(err.data?.entityType).to.equal('FeedServiceType')
        expect(app.serviceRepo.db).to.be.empty
        for (const serviceType of someServiceTypes) {
          serviceType.didNotReceive().validateServiceConfig(Arg.any())
        }
      })

      it('saves the feed service config', async function() {

        const serviceType = someServiceTypes[0]
        const config = { url: 'https://some.service/somewhere' }
        serviceType.validateServiceConfig(Arg.deepEquals(config) as any).resolves(null)
        serviceType.redactServiceConfig(Arg.any()).returns(config)

        const created = await app
          .createService(requestBy(adminPrincipal, { serviceType: serviceType.id, title: 'Test Service', config }))
          .then(res => res.success)
        const inDb = created && app.serviceRepo.db.get(created.id)

        expect(created?.id).to.exist
        expect(created).to.deep.include({
          serviceType: serviceType.id,
          title: 'Test Service',
          summary: null,
          config: config
        })
        expect(inDb).to.deep.equal(created)
      })

      it('redacts the feed service config in the result', async function() {

        const serviceType = someServiceTypes[0]
        const config = { url: 'https://lerp', secret: 'redact me' }
        serviceType.validateServiceConfig(Arg.deepEquals(config) as any).resolves(null)
        serviceType.redactServiceConfig(Arg.any()).returns(_.omit(config, 'secret'))
        const req: CreateFeedServiceRequest = requestBy(adminPrincipal, {
          serviceType: serviceType.id,
          title: 'Redact Config',
          summary: null,
          config
        })
        const res = await app.createService(req)

        expect(res.error).to.be.null
        expect(res.success).to.deep.include({
          serviceType: req.serviceType,
          title: req.title,
          summary: req.summary,
          config: {
            url: config.url
          }
        })
        serviceType.received(1).redactServiceConfig(Arg.deepEquals(req.config))
      })
    })

    describe('listing services', async function() {

      const someServices: FeedService[] = [
        {
          id: `${someServiceTypeDescs[0].id}:${uniqid()}`,
          serviceType: someServiceTypeDescs[0].id,
          title: 'WFS 1',
          summary: null,
          config: {
            url: 'https://test.mage/wfs1'
          }
        },
        {
          id: `${someServiceTypeDescs[1].id}:${uniqid()}`,
          serviceType: someServiceTypeDescs[1].id,
          title: 'OAF 1',
          summary: null,
          config: {
            url: 'https://test.mage.oaf1/api',
            apiKey: '1a2s3d4f'
          }
        }
      ]

      beforeEach(function() {
        app.registerServiceTypes(...someServiceTypes)
        app.registerServices(...someServices)
      })

      it('checks permission for listing services', async function() {

        const bannedReq = requestBy(bannedPrincipal)
        let res = await app.listServices(bannedReq)

        expect(res.success).to.be.null
        expect(res.error).to.be.instanceOf(MageError)
        expect(res?.error?.code).to.equal(ErrPermissionDenied)

        app.permissionService.grantListServices(bannedPrincipal.user)
        res = await app.listServices(bannedReq)

        expect(res.error).to.be.null
        expect(res.success).to.be.instanceOf(Array)
      })

      it('returns the saved services', async function() {

        someServiceTypes[0].redactServiceConfig(Arg.all()).returns(someServices[0].config)
        someServiceTypes[1].redactServiceConfig(Arg.all()).returns(someServices[1].config)
        const adminReq = requestBy(adminPrincipal)
        const res = await app.listServices(adminReq)

        expect(res.error).to.be.null
        expect(res.success).to.be.instanceOf(Array)
        expect(res.success?.length).to.equal(someServices.length)
        expect(res.success).to.deep.include(someServices[0])
        expect(res.success).to.deep.include(someServices[1])
      })

      it('redacts service configurations', async function() {

        const anotherService: FeedService = {
          id: uniqid(),
          serviceType: someServiceTypes[1].id,
          title: 'Service Type 1 Service',
          summary: null,
          config: {
            secretUrl: 'https://type1.secret.net/api'
          }
        }
        app.registerServices(anotherService)
        someServiceTypes[0].redactServiceConfig(Arg.deepEquals(someServices[0].config)).returns(someServices[0].config)
        someServiceTypes[1].redactServiceConfig(Arg.deepEquals(someServices[1].config)).returns(someServices[1].config)
        someServiceTypes[1].redactServiceConfig(Arg.deepEquals(anotherService.config)).returns({})
        const req = requestBy(adminPrincipal)
        const res = await app.listServices(req)
        const services = res.success!

        const anotherServiceRedacted = Object.assign({ ...anotherService }, { config: {}})
        expect(services).to.have.length(3)
        expect(services).to.have.deep.members([
          someServices[0],
          someServices[1],
          anotherServiceRedacted
        ])
        someServiceTypes[0].received(1).redactServiceConfig(Arg.deepEquals(someServices[0].config))
        someServiceTypes[1].received(1).redactServiceConfig(Arg.deepEquals(someServices[1].config))
        someServiceTypes[1].received(1).redactServiceConfig(Arg.deepEquals(anotherService.config))
      })
    })

    describe('previewing topics', async function() {

      beforeEach(function() {
        app.registerServiceTypes(...someServiceTypes)
      })

      it('checks permission for previewing topics', async function() {

        const serviceType = someServiceTypes[0]
        const req: PreviewTopicsRequest = requestBy(
          bannedPrincipal,
          {
            serviceType: serviceType.id,
            serviceConfig: {}
          })
        let res = await app.previewTopics(req)

        expect(res.error).to.be.instanceOf(MageError)
        expect(res.error?.code).to.equal(ErrPermissionDenied)
        expect(res.success).to.be.null

        app.permissionService.grantCreateService(bannedPrincipal.user)
        serviceType.validateServiceConfig(Arg.any()).resolves(null)
        const conn = Sub.for<FeedServiceConnection>()
        conn.fetchAvailableTopics().resolves([])
        serviceType.createConnection(Arg.any()).resolves(conn)

        res = await app.previewTopics(req)

        expect(res.success).to.be.instanceOf(Array)
        expect(res.error).to.be.null
      })

      it('fails if the service type does not exist', async function() {

        const req: PreviewTopicsRequest = requestBy(
          adminPrincipal,
          {
            serviceType: uniqid(),
            serviceConfig: {}
          })
        const res = await app.previewTopics(req)

        expect(res.success).to.be.null
        const err = res.error as EntityNotFoundError | undefined
        expect(err).to.be.instanceOf(MageError)
        expect(err?.code).to.equal(ErrEntityNotFound)
        expect(err?.data?.entityType).to.equal('FeedServiceType')
        expect(err?.data?.entityId).to.equal(req.serviceType)
      })

      it('fails if the service config is invalid', async function() {

        const serviceType = someServiceTypes[1]
        const req: PreviewTopicsRequest = requestBy(
          adminPrincipal,
          {
            serviceType: serviceType.id,
            serviceConfig: { invalid: true }
          })
        serviceType.validateServiceConfig(Arg.deepEquals(req.serviceConfig))
          .resolves(new FeedsError(ErrInvalidServiceConfig, { invalidKeys: ['invalid'], config: { invalid: true } }))

        const res = await app.previewTopics(req)

        expect(res.success).to.be.null
        const err = res.error as InvalidInputError | undefined
        expect(err).to.be.instanceOf(MageError)
        expect(err?.code).to.equal(ErrInvalidInput)
        expect(err?.data).to.deep.equal([[ 'invalid is invalid', 'serviceConfig', 'invalid' ]])
      })

      it('lists the topics for the service config', async function() {

        const serviceType = someServiceTypes[1]
        const req: PreviewTopicsRequest = requestBy(
          adminPrincipal,
          {
            serviceType: serviceType.id,
            serviceConfig: { url: 'https://city.gov/emergency_response' }
          })
        const topics: FeedTopic[] = [
          {
            id: 'crime_reports',
            title: 'Criminal Activity',
            summary: 'Reports of criminal activity with locations',
            paramsSchema: {
              $ref: 'urn:mage:current_user_location'
            },
            itemsHaveIdentity: true,
            updateFrequencySeconds: 3600
          },
          {
            id: 'fire_reports',
            title: 'Fires',
            summary: 'Reports of fires',
            paramsSchema: {
              $ref: 'urn:mage:current_user_location'
            },
            itemsHaveIdentity: true,
            updateFrequencySeconds: 3600
          }
        ]
        const conn = Sub.for<FeedServiceConnection>()
        serviceType.validateServiceConfig(Arg.deepEquals(req.serviceConfig)).resolves(null)
        serviceType.createConnection(Arg.deepEquals(req.serviceConfig)).resolves(conn)
        conn.fetchAvailableTopics().resolves(topics)

        const res = await app.previewTopics(req)

        expect(res.error).to.be.null
        expect(res.success).to.deep.equal(topics)
      })
    })

    describe('single service operations', function() {

      describe('fetching a service', function() {

        it('redacts the service config', async function() {
          expect.fail('todo')
        })
      })

      describe('deleting a service', function() {

        it('works', async function() {

          expect.fail('todo')
        })
      })

      describe('listing topics from a saved service', async function() {

        const someServices: FeedService[] = [
          {
            id: `${someServiceTypeDescs[0].id}:${uniqid()}`,
            serviceType: someServiceTypeDescs[0].id,
            title: 'WFS 1',
            summary: null,
            config: {
              url: 'https://test.mage/wfs1'
            }
          },
          {
            id: `${someServiceTypeDescs[0].id}:${uniqid()}`,
            serviceType: someServiceTypeDescs[0].id,
            title: 'WFS 2',
            summary: null,
            config: {
              url: 'https://test.mage/wfs2'
            }
          }
        ]

        beforeEach(function() {
          app.registerServiceTypes(...someServiceTypes)
          app.registerServices(...someServices)
          for (const service of someServices) {
            app.permissionService.grantListTopics(adminPrincipal.user, service.id)
          }
        })

        it('checks permission for listing topics', async function() {

          const serviceDesc = someServices[0]
          const req: ListServiceTopicsRequest = requestBy(
            bannedPrincipal,
            {
              service: serviceDesc.id
            })
          const err = await app.listTopics(req).then(res => res.error as PermissionDeniedError)

          expect(err).to.be.instanceOf(MageError)
          expect(err.code).to.equal(ErrPermissionDenied)
          for (const serviceType of someServiceTypes) {
            serviceType.didNotReceive().createConnection(Arg.any())
          }

          const service = Sub.for<FeedServiceConnection>()
          service.fetchAvailableTopics().resolves([])
          const serviceType = someServiceTypes.filter(x => x.id === serviceDesc.serviceType)[0]
          serviceType.createConnection(Arg.deepEquals(serviceDesc.config)).resolves(service)
          app.permissionService.grantListTopics(bannedPrincipal.user, serviceDesc.id)

          const res = await app.listTopics(req)

          expect(res.success).to.be.instanceOf(Array)
          expect(res.success).to.have.lengthOf(0)
          expect(res.error).to.be.null
          serviceType.received(1).createConnection(Arg.any())
        })

        it('returns all the topics for a service', async function() {

          const topics: FeedTopic[] = [
            Object.freeze({
              id: 'weather_alerts',
              title: 'Weather Alerts',
              summary: 'Alerts about severe weather activity',
              constantParamsSchema: {
                type: 'number',
                title: 'Max items',
                default: 20,
                minimum: 1,
                maximum: 100
              },
              variableParamsSchema: {
                type: 'object',
                properties: {
                  '$mage:currentLocation': {
                    title: 'Current Location',
                    type: 'array',
                    minItems: 2,
                    maxItems: 2,
                    items: {
                      type: 'number'
                    }
                  },
                  radius: {
                    title: 'Radius (Km)',
                    type: 'number',
                    default: 5,
                    minimum: 1,
                    maximum: 250
                  }
                },
                required: [ '$mage:currentLocation' ]
              },
              updateFrequency: { seconds: 60 },
              itemsHaveIdentity: true,
              itemsHaveSpatialDimension: true,
              itemsHaveTemporalDimension: true,
              itemPrimaryProperty: 'title',
              itemSecondaryProperty: 'description'
            }),
            Object.freeze({
              id: 'quakes',
              title: 'Earthquake Alerts',
              summary: 'Alerts about seismic in a given area',
              constantParamsSchema: undefined,
              variableParamsSchema: {
                type: 'object',
                properties: {
                  '$mage:currentLocation': {
                    title: 'Current Location',
                    type: 'array',
                    minItems: 2,
                    maxItems: 2,
                    items: {
                      type: 'number'
                    }
                  }
                },
                required: [ '$mage:currentLocation' ]
              },
              updateFrequency: undefined,
              itemsHaveIdentity: false,
              itemsHaveSpatialDimension: false,
              itemsHaveTemporalDimension: true,
              itemPrimaryProperty: 'severity',
              itemSecondaryProperty: undefined
            })
          ]
          const serviceDesc = someServices[1]
          const serviceType = someServiceTypes.filter(x => x.id === serviceDesc.serviceType)[0]
          const service = Sub.for<FeedServiceConnection>()
          serviceType.createConnection(Arg.deepEquals(serviceDesc.config)).resolves(service)
          service.fetchAvailableTopics().resolves(topics)
          const req: ListServiceTopicsRequest = requestBy(adminPrincipal, { service: serviceDesc.id })
          const fetched = await app.listTopics(req).then(res => res.success)

          expect(fetched).to.deep.equal(topics)
        })
      })
    })

    describe('creating a feed', function() {

      const service: FeedService = Object.freeze({
        id: uniqid(),
        serviceType: someServiceTypeDescs[0].id,
        title: 'Local Weather WFS',
        summary: 'Data about various local weather events',
        config: {
          url: 'https://weather.local.gov/wfs'
        }
      })
      const topics: FeedTopic[] = [
        Object.freeze({
          id: 'lightning',
          title: 'Lightning Strikes',
          summary: 'Locations of lightning strikes',
          itemsHaveSpatialDimension: true,
        }),
        Object.freeze({
          id: 'tornadoes',
          title: 'Tornado Touchdowns',
          summary: 'Locations and severity of tornado touchdowns',
          itemsHaveSpatialDimension: true,
        })
      ]

      let serviceConn: SubstituteOf<FeedServiceConnection>

      beforeEach(function() {
        app.registerServiceTypes(...someServiceTypes)
        app.registerServices(service)
        app.permissionService.grantCreateFeed(adminPrincipal.user, service.id)
        serviceConn = Sub.for<FeedServiceConnection>()
        someServiceTypes[0].createConnection(Arg.deepEquals(service.config)).resolves(serviceConn)
      })

      type PreviewOrCreateOp = 'previewFeed' | 'createFeed'

      const sharedBehaviors: [string, (op: PreviewOrCreateOp) => any][] = [
        [
          'fails if the service type does not exist',
          async function(appOperation) {
            const service: FeedService = {
              id: 'defunct',
              serviceType: 'not there',
              title: 'Defunct',
              summary: null,
              config: null
            }
            app.registerServices(service)
            const feed: FeedMinimalAttrs = {
              service: service.id,
              topic: topics[0].id
            }
            app.permissionService.grantCreateFeed(adminPrincipal.user, feed.service)

            const req = requestBy(adminPrincipal, { feed })
            const res = await app[appOperation](req)

            expect(res.success).to.be.null
            const error = res.error as EntityNotFoundError
            expect(error).to.be.instanceOf(MageError)
            expect(error.code).to.equal(ErrEntityNotFound)
            expect(error.data.entityType).to.equal('FeedServiceType')
            expect(error.data.entityId).to.equal('not there')
            serviceConn.didNotReceive().fetchTopicContent(Arg.all())
          }
        ],
        [
          'fails if the service does not exist',
          async function(appOperation: PreviewOrCreateOp) {
            const feed: FeedMinimalAttrs = {
              service: 'not there',
              topic: topics[0].id
            }
            app.permissionService.grantCreateFeed(adminPrincipal.user, feed.service)

            const req = requestBy(adminPrincipal, { feed })
            const res = await app[appOperation](req)

            expect(res.success).to.be.null
            const error = res.error as EntityNotFoundError
            expect(error).to.be.instanceOf(MageError)
            expect(error.code).to.equal(ErrEntityNotFound)
            expect(error.data.entityType).to.equal('FeedService')
            expect(error.data.entityId).to.equal('not there')
            serviceConn.didNotReceive().fetchTopicContent(Arg.all())
          }
        ],
        [
          'fails if the topic does not exist',
          async function(appOperation: PreviewOrCreateOp) {
            const feed: FeedMinimalAttrs = {
              service: service.id,
              topic: 'not there'
            }
            serviceConn.fetchAvailableTopics().resolves(topics)

            const req = requestBy(adminPrincipal, { feed })
            const res = await app[appOperation](req)

            expect(res.success).to.be.null
            const error = res.error as EntityNotFoundError
            expect(error).to.be.instanceOf(MageError)
            expect(error.code).to.equal(ErrEntityNotFound)
            expect(error.data.entityType).to.equal('FeedTopic')
            expect(error.data.entityId).to.equal('not there')
            serviceConn.didNotReceive().fetchTopicContent(Arg.all())
          }
        ],
        [
          'checks permission for creating a feed',
          async function(appOperation: PreviewOrCreateOp) {
            const feed: FeedMinimalAttrs = {
              service: service.id,
              topic: topics[0].id
            }

            const req = requestBy(bannedPrincipal, { feed })
            let res = await app[appOperation](req)

            expect(res.success).to.be.null
            const error = res.error
            expect(error).to.be.instanceOf(MageError)
            expect(error?.code).to.equal(ErrPermissionDenied)
            const errData = error?.data as PermissionDeniedErrorData
            expect(errData.subject).to.equal(bannedPrincipal.user)
            expect(errData.permission).to.equal(CreateFeed.name)
            expect(errData.object).to.equal(feed.service)

            serviceConn.fetchAvailableTopics().resolves(topics)
            app.permissionService.grantCreateFeed(bannedPrincipal.user, service.id)

            res = await app[appOperation](req)

            expect(res.error).to.be.null
            expect(res.success).to.be.an('object')
          }
        ],
        [
          'validates the variable params schema',
          async function(appOperation: PreviewOrCreateOp) {
            const feed: FeedMinimalAttrs = {
              service: service.id,
              topic: topics[0].id,
              variableParamsSchema: {
                type: 'object',
                properties: {
                  bbox: {
                    type: 'array',
                    items: { type: 'number'},
                    minItems: 4,
                    maxItems: 4
                  },
                  timestamp: {
                    type: 'number',
                    description: 'The millisecond epoch time the strike ocurred',
                    minimum: 0
                  }
                }
              }
            }
            const validationError = new Error('bad schema')
            app.jsonSchemaService.validateSchema(Arg.deepEquals(feed.variableParamsSchema)).rejects(validationError)

            const req = requestBy(adminPrincipal, { feed })
            const res = await app[appOperation](req)

            expect(res.success).to.be.null
            const err = res.error as InvalidInputError
            expect(err.code).to.equal(ErrInvalidInput)
            expect(err.data.length).to.equal(1)
            expect(err.data[0]).to.have.members([ validationError, 'feed', 'variableParamsSchema' ])
            expect(err.message).to.match(/invalid variable parameters schema/)
            expect(err.message).to.match(/feed > variableParamsSchema: bad schema/)
          }
        ],
        [
          'does not validate the variable params schema when the schema is undefined',
          async function(appOperation: PreviewOrCreateOp) {
            const feed: FeedMinimalAttrs = {
              service: service.id,
              topic: topics[0].id,
            }
            serviceConn.fetchAvailableTopics().resolves(topics)

            const req = requestBy(adminPrincipal, { feed })
            const res = await app[appOperation](req)

            expect(res.error).to.be.null
            expect(res.success).to.be.an('object')
            app.jsonSchemaService.didNotReceive().validateSchema(Arg.all())
          }
        ]
      ]

      function testSharedBehaviorFor(this: Context, appOperation: PreviewOrCreateOp) {
        for (const test of sharedBehaviors) {
          it(test[0], test[1].bind(this, appOperation))
        }
      }

      describe('previewing the feed', function() {

        it('fetches items and creates feed preview with minimal inputs', async function() {

          const feed: FeedMinimalAttrs = {
            service: service.id,
            topic: topics[0].id,
          }
          const previewFeed: FeedCreateAttrs = {
            service: service.id,
            topic: topics[0].id,
            title: topics[0].title,
            summary: topics[0].summary,
            itemsHaveIdentity: false,
            itemsHaveSpatialDimension: true,
          }
          const previewItems: FeatureCollection = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [ -72, 20 ]
                },
                properties: {
                  when: '2020-06-01T23:23:00'
                }
              }
            ]
          }
          serviceConn.fetchAvailableTopics().resolves(topics)
          serviceConn.fetchTopicContent(feed.topic, Arg.deepEquals({} as JsonObject)).resolves({
            topic: feed.topic,
            items: previewItems,
          })
          const previewContent: FeedContent = {
            feed: 'preview',
            topic: feed.topic,
            items: previewItems,
            variableParams: undefined
          }

          const req = requestBy(adminPrincipal, { feed })
          const res = await app.previewFeed(req)

          expect(res.error).to.be.null
          expect(res.success?.feed).to.deep.equal(previewFeed)
          expect(res.success?.content).to.deep.equal(previewContent)
        })

        it('applies request inputs to the feed preview', async function() {

          const feed: FeedMinimalAttrs = {
            service: service.id,
            topic: topics[1].id,
            title: 'My Tornadoes',
            summary: 'Tornadoes I like',
            constantParams: {
              favoriteOf: adminPrincipal.user
            },
            variableParamsSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number'
                }
              }
            }
          }
          const variableParams = {
            limit: 10
          }
          const mergedParams = { ...feed.constantParams, ...variableParams } as JsonObject
          serviceConn.fetchAvailableTopics().resolves(topics)
          serviceConn.fetchTopicContent(topics[1].id, Arg.deepEquals(mergedParams)).resolves({
            topic: topics[1].id,
            pageCursor: null,
            items: {
              type: 'FeatureCollection',
              features: []
            }
          })
          app.jsonSchemaService.validateSchema(Arg.all()).resolves({
            validate: async () => null
          })

          const req = requestBy(adminPrincipal, {
            feed, variableParams
          })
          const res = await app.previewFeed(req)

          expect(res.error).to.be.null
          expect(res.success).to.be.instanceOf(Object)
          const preview = res.success as FeedPreview
          expect(preview.feed).to.deep.include(feed)
        })

        it('validates the variable params against the variable params schema', async function() {

          const feed: FeedMinimalAttrs = {
            service: service.id,
            topic: topics[0].id,
            variableParamsSchema: {
              type: 'object',
              properties: {
                bbox: {
                  type: 'array',
                  items: { type: 'number'},
                  minItems: 4,
                  maxItems: 4
                },
                timestamp: {
                  type: 'number',
                  description: 'The millisecond epoch time the strike ocurred',
                  minimum: 0
                }
              }
            }
          }
          const variableParams = {
            invalidParameter: true
          }
          const validationError = new Error('invalidParameter is not a valid property')
          app.jsonSchemaService.validateSchema(feed.variableParamsSchema!).resolves({
            validate: async () => validationError
          })

          const req = requestBy(adminPrincipal, { feed, variableParams })
          const res = await app.previewFeed(req)

          expect(res.success).to.be.null
          const err = res.error as InvalidInputError
          expect(err.code).to.equal(ErrInvalidInput)
          expect(err.message).to.match(/invalid variable parameters/)
          expect(err.data).to.deep.equal([
            [ validationError, 'variableParams' ]
          ])
        })

        it('validates the merged params against the topic params schema', async function() {

          const topic: FeedTopic = {
            id: 'topic_with_params_schema',
            title: 'With Constant Params',
            paramsSchema: {
              type: 'object',
              properties: {
                apiKey: { type: 'string' },
                limit: { type: 'number' },
                bbox: {
                  title: 'Bounding Box',
                  type: 'array',
                  items: { type: 'number', minItems: 4, maxItems: 6 }
                }
              }
            }
          }
          const feed: FeedMinimalAttrs = {
            service: service.id,
            topic: topic.id,
            constantParams: {
              apiKey: 'abc123',
              limit: 100
            },
            variableParamsSchema: {
              type: 'object',
              properties: {
                bbox: topic.paramsSchema!.properties!.bbox
              }
            }
          }
          const variableParams = { bbox: [ -22.6, 38.1, -22.5, 38.3 ]}
          const mergedParams = Object.assign({}, variableParams, feed.constantParams)
          const paramsValidator = Sub.for<JsonValidator>()
          const validationError = new Error('bad parameters')
          serviceConn.fetchAvailableTopics().resolves([ topic ])
          paramsValidator.validate(Arg.deepEquals(variableParams) as any).resolves(null)
          paramsValidator.validate(Arg.deepEquals(mergedParams)).resolves(validationError)
          app.jsonSchemaService.validateSchema(Arg.deepEquals(feed.variableParamsSchema)).resolves(paramsValidator)
          app.jsonSchemaService.validateSchema(Arg.deepEquals(topic.paramsSchema)).resolves(paramsValidator)

          const req = requestBy(adminPrincipal, { feed, variableParams })
          const res = await app.previewFeed(req)

          expect(res.success).to.be.null
          expect(res.error).to.be.instanceOf(MageError)
          expect(res.error?.code).to.equal(ErrInvalidInput)
          expect(res.error?.data).to.have.deep.members([
            [ validationError, 'feed', 'constantParams' ],
            [ validationError, 'variableParams' ]
          ])
          expect(res.error?.message).to.match(/invalid parameters/)
          app.jsonSchemaService.received(1).validateSchema(Arg.deepEquals(topic.paramsSchema))
          paramsValidator.received(1).validate(Arg.deepEquals(mergedParams))
        })

        it('does not validate merged params if topic params schema is undefined', async function() {

          const feed: FeedMinimalAttrs = {
            service: service.id,
            topic: topics[0].id,
            variableParamsSchema: {
              properties: {
                maxAgeDays: { type: 'number' }
              }
            }
          }
          const variableParams = { maxAgeDays: 10 }
          const validator = Sub.for<JsonValidator>()
          serviceConn.fetchAvailableTopics().resolves(topics)
          app.jsonSchemaService.validateSchema(Arg.deepEquals(feed.variableParamsSchema)).resolves(validator)
          validator.validate(Arg.deepEquals(variableParams) as any).resolves(null)

          const req = requestBy(adminPrincipal, { feed, variableParams })
          const res = await app.previewFeed(req)

          expect(res.error).to.be.null
          expect(res.success).to.be.an('object')
          app.jsonSchemaService.received(1).validateSchema(Arg.all())
          validator.received(1).validate(Arg.all())
        })

        it('prefers constant params over variable params', async function() {

          const variableParams = { limit: 1000 }
          const constantParams = { limit: 25 }
          const topic: FeedTopic = Object.assign({
            paramsSchema: {
              properties: {
                limit: { type: 'number' }
              }
            }
          }, topics[0])
          const feed: FeedMinimalAttrs = {
            service: service.id,
            topic: topics[0].id,
            constantParams,
            variableParamsSchema: {}
          }
          const mergedValidator = Sub.for<JsonValidator>()
          const variableValidator = Sub.for<JsonValidator>()
          serviceConn.fetchAvailableTopics().resolves([ topic ])
          app.jsonSchemaService.validateSchema(Arg.deepEquals(topic.paramsSchema)).resolves(mergedValidator)
          app.jsonSchemaService.validateSchema(Arg.deepEquals(feed.variableParamsSchema)).resolves(variableValidator)
          mergedValidator.validate(Arg.all()).resolves(null)
          variableValidator.validate(Arg.all()).resolves(null)

          const req = requestBy(adminPrincipal, {
            feed,
            variableParams
          })
          const res = await app.previewFeed(req)

          expect(res.error).to.be.null
          expect(res.success).to.be.an('object')
          mergedValidator.received(1).validate(Arg.all())
          mergedValidator.received(1).validate(Arg.deepEquals(constantParams) as any)
        })

        it('does not save the preview feed', async function() {

          const feed = {
            service: service.id,
            topic: topics[0].id
          }
          serviceConn.fetchAvailableTopics().resolves(topics)
          serviceConn.fetchTopicContent(Arg.all()).resolves({
            topic: feed.topic,
            items: {
              type: 'FeatureCollection',
              features: []
            }
          })

          const req = requestBy(adminPrincipal, { feed })
          const res = await app.previewFeed(req)

          expect(res.error).to.be.null
          expect(res.success).to.be.an('object')
          expect(app.feedRepo.db).to.be.empty
        })

        describe('behaviors shared with creating a feed', function() {
          testSharedBehaviorFor.call(this.ctx, 'previewFeed')
        })
      })

      describe('saving the feed', function() {

        it('saves the feed with minimal inputs', async function() {

          const feed: FeedMinimalAttrs = {
            service: service.id,
            topic: topics[1].id
          }
          serviceConn.fetchAvailableTopics().resolves(topics)

          const req = requestBy(adminPrincipal, { feed })
          const res = await app.createFeed(req)

          expect(res.error).to.be.null
          expect(res.success).to.be.instanceOf(Object)
          const created = res.success as Feed
          expect(created.id).to.be.a('string')
          expect(created.id).to.not.equal('preview')
          expect(created).to.deep.include({
            service: service.id,
            title: topics[1].title,
            summary: topics[1].summary,
            itemsHaveIdentity: false,
            itemsHaveSpatialDimension: true,
          })
          const inDb = app.feedRepo.db.get(created.id)
          expect(inDb).to.deep.include(created)
        })

        it('saves a feed from a preview', async function() {

          const feed: FeedMinimalAttrs = {
            service: service.id,
            topic: topics[1].id,
            title: 'Save From Preview',
            constantParams: {
              limit: 50
            },
            itemsHaveIdentity: true,
            itemsHaveSpatialDimension: true
          }
          serviceConn.fetchAvailableTopics().resolves(topics)

          const previewReq = requestBy(adminPrincipal, { feed, variableParams: { bbox: [ 20, 20, 21, 21 ]}})
          const previewRes = await app.previewFeed(previewReq)

          expect(previewRes.error).to.be.null
          expect(previewRes.success).to.be.an('object')

          const previewFeed = previewRes.success?.feed as FeedCreateAttrs

          const createReq = requestBy(adminPrincipal, { feed: previewFeed })
          const createRes = await app.createFeed(createReq)

          expect(createRes.error).to.be.null
          expect(createRes.success).to.be.an('object')
          expect(createRes.success).to.deep.include(feed)
          expect(app.feedRepo.db.get(createRes.success!.id)).to.deep.include(feed)
        })

        describe('behaviors shared with previewing a feed', function() {
          testSharedBehaviorFor.call(this.ctx, 'createFeed')
        })
      })
    })

    describe('single feed operations', function() {

      let feeds: Feed[]
      let services: { service: FeedService, topics: Required<FeedTopic>[], conn: SubstituteOf<FeedServiceConnection> }[]

      beforeEach(function() {
        services = [
          {
            service: Object.freeze({
              id: uniqid(),
              serviceType: someServiceTypes[1].id,
              title: 'News 1',
              summary: null,
              config: { url: 'https://test.service1', secret: uniqid() },
            }),
            topics: [
              Object.freeze({
                id: uniqid(),
                title: 'News 1 Politics',
                summary: 'News on politics 1',
                itemPrimaryProperty: 'topic1:primary',
                itemSecondaryProperty: 'topic1:secondary',
                itemTemporalProperty: 'topic1:published',
                itemsHaveIdentity: false,
                itemsHaveSpatialDimension: true,
                paramsSchema: {
                  title: 'Topic 1 Params'
                },
                mapStyle: {
                  iconUrl: 'topic1.png'
                },
                updateFrequencySeconds: 5 * 60,
              })
            ],
            conn: Sub.for<FeedServiceConnection>(),
          },
          {
            service: Object.freeze({
              id: uniqid(),
              serviceType: someServiceTypes[1].id,
              title: 'News 2',
              summary: null,
              config: { url: 'https://test.service2' },
            }),
            topics: [
              Object.freeze({
                id: uniqid(),
                title: 'News 2 Sports',
                summary: 'News on sports 2',
                itemPrimaryProperty: 'topic2:primary',
                itemSecondaryProperty: 'topic2:secondary',
                itemTemporalProperty: 'topic2:published',
                itemsHaveIdentity: false,
                itemsHaveSpatialDimension: true,
                paramsSchema: {
                  title: 'Topic 2 Params'
                },
                mapStyle: {
                  iconUrl: 'topic2.png'
                },
                updateFrequencySeconds: 15 * 60,
              })
            ],
            conn: Sub.for<FeedServiceConnection>(),
          }
        ]
        feeds = [
          Object.freeze({
            id: uniqid(),
            title: 'Politics',
            service: services[0].service.id,
            topic: services[0].topics[0].id,
            itemsHaveIdentity: true,
            itemsHaveSpatialDimension: false,
            variableParamsSchema: {
              properties: {
                search: { type: 'string' }
              }
            }
          }),
          Object.freeze({
            id: uniqid(),
            title: 'Sports',
            service: services[1].service.id,
            topic: services[1].topics[0].id,
            itemsHaveIdentity: true,
            itemsHaveSpatialDimension: true,
            constantParams: {
              limit: 50
            },
            updateFrequencySeconds:  10 * 60
          })
        ]
        app.registerServiceTypes(...someServiceTypes)
        app.registerServices(...services.map(x => x.service))
        app.registerFeeds(...feeds)
        const serviceType = someServiceTypes[1]
        for (const serviceTuple of services) {
          serviceType.createConnection(Arg.deepEquals(serviceTuple.service.config)).resolves(serviceTuple.conn)
          serviceTuple.conn.fetchAvailableTopics().resolves(serviceTuple.topics)
        }
      })

      describe('getting an expanded feed', function() {

        it('returns the feed with service and topic populated', async function() {

          const feedExpanded: FeedExpanded = Object.assign({ ...feeds[0] }, {
            service: { ...services[0].service },
            topic: { ...services[0].topics[0] }
          })
          const req: GetFeedRequest = requestBy(adminPrincipal, { feed: feeds[0].id })
          const res = await app.getFeed(req)

          expect(res.error).to.be.null
          expect(res.success).to.deep.equal(feedExpanded)
        })

        it('checks permission for fetting the feed', async function() {

          app.permissionService.revokeListFeeds(adminPrincipal.user)
          const req: GetFeedRequest = requestBy(adminPrincipal, { feed: feeds[0].id })
          const res = await app.getFeed(req)

          expect(res.success).to.be.null
          expect(res.error).to.be.instanceOf(MageError)
          expect(res.error?.code).to.equal(ErrPermissionDenied)
        })
      })

      describe('updating a feed', function() {

        beforeEach(function() {
          app.permissionService.grantCreateFeed(adminPrincipal.user, feeds[0].service)
          app.permissionService.grantCreateFeed(adminPrincipal.user, feeds[1].service)
        })

        it('saves the new feed attributes', async function() {

          const feedMod: Omit<Required<Feed>, 'service' | 'topic'> = {
            id: feeds[1].id,
            title: 'Updated Feed',
            summary: 'Test updateds',
            itemPrimaryProperty: 'updated1',
            itemSecondaryProperty: 'updated2',
            itemTemporalProperty: 'updatedTemporal',
            itemsHaveIdentity: !feeds[1].itemsHaveIdentity,
            itemsHaveSpatialDimension: !feeds[1].itemsHaveSpatialDimension,
            constantParams: {
              updated: true
            },
            variableParamsSchema: {
              properties: {
                test: { type: 'string' }
              }
            },
            mapStyle: {
              fill: 'updated-green'
            },
            updateFrequencySeconds: 357
          }
          const req: UpdateFeedRequest = requestBy(adminPrincipal, { feed: feedMod })
          const res = await app.updateFeed(req)

          const expanded = Object.assign({ ...feedMod }, { service: services[1].service, topic: services[1].topics[0] })
          const referenced = Object.assign({ ...feedMod }, { service: feeds[1].service, topic: feeds[1].topic })
          const inDb = app.feedRepo.db.get(feeds[1].id)
          expect(res.error).to.be.null
          expect(res.success).to.deep.equal(expanded)
          expect(inDb).to.deep.equal(referenced)
        })

        it('does not allow changing the service and topic', async function() {

          const feedMod: FeedUpdateAttrs & Pick<Feed, 'service' | 'topic'> = Object.freeze({
            id: feeds[0].id,
            service: feeds[0].service + '-mod',
            topic: feeds[0].topic + '-mod'
          })
          const req: UpdateFeedRequest = requestBy(adminPrincipal, { feed: feedMod })
          const res = await app.updateFeed(req)

          expect(res.success).to.be.null
          expect(res.error).to.be.instanceOf(MageError)
          expect(res.error?.code).to.equal(ErrInvalidInput)
          expect(res.error?.message).to.contain('service')
          expect(res.error?.message).to.contain('topic')
          const errData = res.error?.data as KeyPathError[]
          expect(errData).to.have.deep.members([
            [ 'changing feed service is not allowed', 'feed', 'service' ],
            [ 'changing feed topic is not allowed', 'feed', 'topic' ]
          ])
          const inDb = app.feedRepo.db.get(feeds[0].id)
          expect(inDb).to.deep.equal(feeds[0])
        })

        it('accepts service and topic if they match the existing feed', async function() {

          const feedMod: FeedUpdateAttrs & Pick<Feed, 'service' | 'topic'> = Object.freeze({
            id: feeds[0].id,
            service: feeds[0].service,
            topic: feeds[0].topic
          })
          const req: UpdateFeedRequest = requestBy(adminPrincipal, { feed: feedMod })
          const res = await app.updateFeed(req)

          expect(res.error).to.be.null
          expect(res.success).to.deep.include({
            id: feeds[0].id,
            service: services[0].service,
            topic: services[0].topics[0]
          })
        })

        it('applies topic attributes for attributes the update does not specify', async function() {

          const feedMod: FeedUpdateAttrs = {
            id: feeds[1].id,
          }
          const req: UpdateFeedRequest = requestBy(adminPrincipal, { feed: feedMod })
          const res = await app.updateFeed(req)

          const withTopicAttrs = normalizeFeedMinimalAttrs(services[1].topics[0], { ...feedMod, service: feeds[1].service, topic: feeds[1].topic })
          withTopicAttrs.id = feedMod.id
          const expanded = Object.assign({ ...withTopicAttrs }, { service: services[1].service, topic: services[1].topics[0] })
          const inDb = app.feedRepo.db.get(feeds[1].id)
          expect(res.error).to.be.null
          expect(res.success).to.deep.equal(expanded)
          expect(inDb).to.deep.equal(withTopicAttrs)
        })

        it('checks permission for updating the feed', async function() {

          const feedMod: FeedUpdateAttrs = {
            id: feeds[0].id,
          }
          const req: UpdateFeedRequest = requestBy(bannedPrincipal, { feed: feedMod })
          const res = await app.updateFeed(req)

          expect(res.success).to.be.null
          expect(res.error).to.be.instanceOf(MageError)
          expect(res.error?.code).to.equal(ErrPermissionDenied)
          const inDb = app.feedRepo.db.get(feeds[0].id)
          expect(inDb).to.deep.equal(feeds[0])
        })
      })

      describe('deleting a feed', function() {

        beforeEach(function() {
          app.permissionService.grantCreateFeed(adminPrincipal.user, services[0].service.id)
          app.permissionService.grantCreateFeed(adminPrincipal.user, services[1].service.id)
        })

        it('deletes the feed from the repository', async function() {

          const req: DeleteFeedRequest = requestBy(adminPrincipal, { feed: feeds[0].id })
          const res = await app.deleteFeed(req)

          expect(res.error).to.be.null
          expect(res.success).to.be.true
          const inDb = app.feedRepo.db.get(feeds[0].id)
          expect(inDb).to.be.undefined
        })

        it('checks permission for deleting a feed', async function() {

          const req: DeleteFeedRequest = requestBy(bannedPrincipal, { feed: feeds[1].id })
          const res = await app.deleteFeed(req)

          expect(res.success).to.be.null
          expect(res.error).to.be.instanceOf(MageError)
          expect(res.error?.code).to.equal(ErrPermissionDenied)
          const err = res.error as PermissionDeniedError
          expect(err.data.subject).to.equal(bannedPrincipal.user)
          expect(err.data.permission).to.equal(CreateFeed.name)
          expect(err.data.object).to.equal(feeds[1].service)
          const inDb = app.feedRepo.db.get(req.feed)
          expect(inDb).to.deep.equal(feeds[1])
        })

        it('fails if the feed id is not found', async function() {

          const req: DeleteFeedRequest = requestBy(adminPrincipal, { feed: feeds[0].id + '-nope' })
          const res = await app.deleteFeed(req)

          expect(res.success).to.be.null
          expect(res.error).to.be.instanceOf(MageError)
          expect(res.error?.code).to.equal(ErrEntityNotFound)
          const err = res.error as EntityNotFoundError
          expect(err.data.entityId).to.equal(req.feed)
          expect(err.data.entityType).to.equal('Feed')
        })
      })
    })


    describe('listing all feeds', function() {

      it('returns all the feeds', async function() {

        const feeds: Feed[] = [
          {
            id: uniqid(),
            title: 'Test Feed 1',
            summary: 'First test feed',
            service: uniqid(),
            topic: 'topic1',
            itemsHaveIdentity: true,
            itemsHaveSpatialDimension: false
          },
          {
            id: uniqid(),
            title: 'Test Feed 2',
            summary: 'Second test feed',
            service: uniqid(),
            topic: 'topic1',
            itemsHaveIdentity: true,
            itemsHaveSpatialDimension: true,
            constantParams: {
              limit: 100
            },
            updateFrequencySeconds: 3600
          }
        ]
        app.registerFeeds(...feeds)
        const req = requestBy(adminPrincipal)
        const res = await app.listFeeds(req)

        expect(res.error).to.be.null
        expect(res.success).to.deep.equal(feeds)
      })

      it('checks permission for listing all feeds', async function() {

        const req = requestBy(bannedPrincipal)
        let res = await app.listFeeds(req)

        expect(res.success).to.be.null
        expect(res.error).to.be.instanceOf(MageError)
        expect(res.error?.code).to.equal(ErrPermissionDenied)
        expect(res.error?.data.subject).to.equal(bannedPrincipal.user)
        expect(res.error?.data.permission).to.equal(ListAllFeeds.name)
        expect(res.error?.data.object).to.be.null

        app.permissionService.grantListFeeds(bannedPrincipal.user)

        res = await app.listFeeds(req)

        expect(res.error).to.be.null
        expect(res.success).to.deep.equal([])
      })

      xit('returns all the feeds grouped under populated service', async function() {
        expect.fail('todo: this would probably be more useful; maybe even all service types, services, feeds, and even cached topic descriptors')
      })
    })
  })

  describe('fetching feed content', function() {

    let serviceType: SubstituteOf<RegisteredFeedServiceType>
    let feed: Feed
    let service: FeedService

    beforeEach(function() {
      serviceType = someServiceTypes[0]
      feed = {
        id: uniqid(),
        service: uniqid(),
        topic: 'crimes',
        title: 'Robberies',
        constantParams: {
          type: 'robbery'
        },
        itemsHaveIdentity: true,
        itemsHaveSpatialDimension: true,
        itemTemporalProperty: 'when',
        itemPrimaryProperty: 'address',
      }
      service = {
        id: feed.service,
        serviceType: serviceType.id,
        title: 'Test Service',
        summary: 'For testing',
        config: {
          url: 'https://mage.test/service/' + uniqid()
        }
      }
      app.registerServiceTypes(serviceType)
      app.registerServices(service)
      app.registerFeeds(feed)
      app.permissionService.grantFetchFeedContent(adminPrincipal.user, feed.id)
    })

    it('fetches content from the feed topic', async function() {

      const expectedContent: FeedContent = {
        feed: feed.id,
        topic: feed.topic,
        variableParams: {
          bbox: [ -120, 40, -119, 41 ],
          maxAgeInDays: 3
        },
        items: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [ -119.67, 40.25 ]
              },
              properties: {
                when: Date.now() - 1000 * 60 * 60 * 13,
                address: '123 Test Ave. Testington, Wadata 56789'
              }
            }
          ]
        }
      }
      const mergedParams = Object.assign({ ...expectedContent.variableParams }, feed.constantParams )
      const conn = Sub.for<FeedServiceConnection>()
      serviceType.createConnection(Arg.deepEquals(service.config)).resolves(conn)
      conn.fetchTopicContent(feed.topic, mergedParams).resolves(expectedContent)
      const req: FetchFeedContentRequest = requestBy(adminPrincipal, {
        feed: feed.id,
        variableParams: expectedContent.variableParams
      })
      const res = await app.fetchFeedContent(req)

      expect(res.error).to.be.null
      expect(res.success).to.deep.equal(expectedContent)
    })

    it('validates the parameters', async function() {
      expect.fail('todo')
    })

    it('checks permission to fetch feed content', async function() {

      const req: FetchFeedContentRequest = requestBy(bannedPrincipal, { feed: feed.id })
      let res = await app.fetchFeedContent(req)

      expect(res.success).to.be.null
      expect(res.error).to.be.instanceOf(MageError)
      expect(res.error?.code).to.equal(ErrPermissionDenied)
      const data = res.error?.data as PermissionDeniedErrorData
      expect(data.permission).to.equal(FetchFeedContent.name)
      expect(data.subject).to.equal(bannedPrincipal.user)
      expect(data.object).to.equal(feed.id)

      app.permissionService.grantFetchFeedContent(bannedPrincipal.user, feed.id)
      res = await app.fetchFeedContent(req)

      expect(res.error).to.be.null
      expect(res.success).to.be.an('object')
    })
  })
})

class TestApp {

  readonly serviceTypeRepo = new TestFeedServiceTypeRepository()
  readonly serviceRepo = new TestFeedServiceRepository()
  readonly feedRepo = new TestFeedRepository()
  readonly permissionService = new TestPermissionService()
  readonly jsonSchemaService = Sub.for<JsonSchemaService>()

  readonly listServiceTypes = ListFeedServiceTypes(this.permissionService, this.serviceTypeRepo)
  readonly previewTopics = PreviewTopics(this.permissionService, this.serviceTypeRepo)
  readonly createService = CreateFeedService(this.permissionService, this.serviceTypeRepo, this.serviceRepo)
  readonly listServices = ListFeedServices(this.permissionService, this.serviceTypeRepo, this.serviceRepo)
  readonly listTopics = ListServiceTopics(this.permissionService, this.serviceTypeRepo, this.serviceRepo)
  readonly previewFeed = PreviewFeed(this.permissionService, this.serviceTypeRepo, this.serviceRepo, this.jsonSchemaService)
  readonly createFeed = CreateFeed(this.permissionService, this.serviceTypeRepo, this.serviceRepo, this.feedRepo, this.jsonSchemaService)
  readonly listFeeds = ListAllFeeds(this.permissionService, this.feedRepo)
  readonly getFeed = GetFeed(this.permissionService, this.serviceTypeRepo, this.serviceRepo, this.feedRepo)
  readonly updateFeed = UpdateFeed(this.permissionService, this.serviceTypeRepo, this.serviceRepo, this.feedRepo)
  readonly deleteFeed = DeleteFeed(this.permissionService, this.feedRepo)
  readonly fetchFeedContent = FetchFeedContent(this.permissionService, this.serviceTypeRepo, this.serviceRepo, this.feedRepo, this.jsonSchemaService)

  registerServiceTypes(...types: RegisteredFeedServiceType[]): void {
    for (const type of types) {
      this.serviceTypeRepo.db.set(type.id, type)
    }
  }

  registerServices(...services: FeedService[]): void {
    for (const service of services) {
      this.serviceRepo.db.set(service.id, service)
    }
  }

  registerFeeds(...feeds: Feed[]): void {
    for (const feed of feeds) {
      this.feedRepo.db.set(feed.id, feed)
    }
  }
}

class TestFeedServiceTypeRepository implements FeedServiceTypeRepository {

  readonly db = new Map<string, FeedServiceType>()

  async register(moduleName: string, serviceType: FeedServiceType): Promise<RegisteredFeedServiceType> {
    throw new Error('never')
  }

  async findAll(): Promise<FeedServiceType[]> {
    return Array.from(this.db.values())
  }

  async findById(serviceTypeId: string): Promise<FeedServiceType | null> {
    return this.db.get(serviceTypeId) || null
  }
}

class TestFeedServiceRepository implements FeedServiceRepository {

  readonly db = new Map<string, FeedService>()

  async create(attrs: FeedServiceCreateAttrs): Promise<FeedService> {
    const saved: FeedService = {
      id: `${attrs.serviceType as string}:${this.db.size + 1}`,
      ...attrs
    }
    this.db.set(saved.id, saved)
    return saved
  }

  async findAll(): Promise<FeedService[]> {
    return Array.from(this.db.values())
  }

  async findById(sourceId: string): Promise<FeedService | null> {
    return this.db.get(sourceId) || null
  }
}

class TestFeedRepository implements FeedRepository {

  readonly db = new Map<FeedId, Feed>()

  async create(attrs: FeedCreateAttrs): Promise<Feed> {
    const id = uniqid()
    const saved: Feed = { id, ...attrs }
    this.db.set(id, saved)
    return saved
  }

  async findById(feedId: FeedId): Promise<Feed | null> {
    return this.db.get(feedId) || null
  }

  async findFeedsByIds(...feedIds: FeedId[]): Promise<Feed[]> {
    throw new Error('unimplemented')
  }

  async findAll(): Promise<Feed[]> {
    return Array.from(this.db.values())
  }

  async update(feed: Omit<Feed, 'service' | 'topic'>): Promise<Feed | null> {
    const existing = this.db.get(feed.id)
    if (!existing) {
      return null
    }
    const updated = Object.assign({ ...feed }, { service: existing.service, topic: existing.topic })
    this.db.set(feed.id, updated)
    return updated
  }

  async removeById(feedId: FeedId): Promise<Feed | null> {
    const removed = this.db.get(feedId)
    this.db.delete(feedId)
    if (removed) {
      return removed
    }
    return null
  }
}
class TestPermissionService implements FeedsPermissionService {

  // TODO: add acl for specific services and listing topics
  readonly privleges = {
    [adminPrincipal.user]: {
      [ListFeedServiceTypes.name]: true,
      [CreateFeedService.name]: true,
      [ListFeedServices.name]: true,
      [ListServiceTopics.name]: true,
      [ListAllFeeds.name]: true,
    }
  } as { [user: string]: { [privilege: string]: boolean }}
  readonly serviceAcls = new Map<FeedServiceId, Map<UserId, Set<string>>>()
  readonly feedAcls = new Map<FeedId, Set<UserId>>()

  async ensureListServiceTypesPermissionFor(context: AppRequestContext<TestPrincipal>): Promise<null | PermissionDeniedError> {
    return this.checkPrivilege(context.requestingPrincipal().user, ListFeedServiceTypes.name)
  }

  async ensureCreateServicePermissionFor(context: AppRequestContext<TestPrincipal>): Promise<null | PermissionDeniedError> {
    return this.checkPrivilege(context.requestingPrincipal().user, CreateFeedService.name)
  }

  async ensureListServicesPermissionFor(context: AppRequestContext<TestPrincipal>): Promise<null | PermissionDeniedError> {
    return this.checkPrivilege(context.requestingPrincipal().user, ListFeedServices.name)
  }

  async ensureListTopicsPermissionFor(context: AppRequestContext<TestPrincipal>, service: FeedServiceId): Promise<null | PermissionDeniedError> {
    return this.ensureServicePrivilege(context, service, ListServiceTopics.name)
  }

  async ensureCreateFeedPermissionFor(context: AppRequestContext<TestPrincipal>, service: FeedServiceId): Promise<null | PermissionDeniedError> {
    return this.ensureServicePrivilege(context, service, CreateFeed.name)
  }

  async ensureListAllFeedsPermissionFor(context: AppRequestContext<TestPrincipal>): Promise<null | PermissionDeniedError> {
    return this.checkPrivilege(context.requestingPrincipal().user, ListAllFeeds.name)
  }

  async ensureFetchFeedContentPermissionFor(context: AppRequestContext<TestPrincipal>, feed: FeedId): Promise<null | PermissionDeniedError> {
    const acl = this.feedAcls.get(feed)
    if (acl?.has(context.requestingPrincipal().user)) {
      return null
    }
    return permissionDenied(FetchFeedContent.name, context.requestingPrincipal().user, feed)
  }

  grantCreateService(user: UserId) {
    this.grantPrivilege(user, CreateFeedService.name)
  }

  grantListServices(user: UserId) {
    this.grantPrivilege(user, ListFeedServices.name)
  }

  grantListTopics(user: UserId, service: FeedServiceId) {
    this.grantServicePrivilege(user, service, ListServiceTopics.name)
  }

  grantCreateFeed(user: UserId, service: FeedServiceId) {
    this.grantServicePrivilege(user, service, CreateFeed.name)
  }

  grantListFeeds(user: UserId) {
    this.grantPrivilege(user, ListAllFeeds.name)
  }

  grantFetchFeedContent(user: UserId, feed: FeedId) {
    const acl = this.feedAcls.get(feed) || new Set<UserId>()
    acl.add(user)
    this.feedAcls.set(feed, acl)
  }

  revokeListTopics(user: UserId, service: FeedServiceId) {
    const acl = this.serviceAcls.get(service)
    const servicePermissions = acl?.get(user)
    servicePermissions?.delete(ListServiceTopics.name)
  }

  revokeListFeeds(user: UserId) {
    this.revokePrivilege(user, ListAllFeeds.name)
  }

  checkPrivilege(user: UserId, privilege: string, object?: string): null | PermissionDeniedError {
    if (!this.privleges[user]?.[privilege]) {
      return permissionDenied(privilege, user, object)
    }
    return null
  }

  grantPrivilege(user: UserId, privilege: string): void {
    const privs = this.privleges[user] || {}
    privs[privilege] = true
    this.privleges[user] = privs
  }

  revokePrivilege(user: UserId, privilege: string): void {
    const privs = this.privleges[user] || {}
    privs[privilege] = false
    this.privleges[user] = privs
  }

  grantServicePrivilege(user: UserId, service: FeedServiceId, privilege: string): void {
    let acl = this.serviceAcls.get(service)
    if (!acl) {
      acl = new Map<UserId, Set<string>>()
      this.serviceAcls.set(service, acl)
    }
    let servicePermissions = acl.get(user)
    if (!servicePermissions) {
      servicePermissions = new Set<string>()
      acl.set(user, servicePermissions)
    }
    servicePermissions.add(privilege)
  }

  ensureServicePrivilege(context: AppRequestContext<TestPrincipal>, service: FeedServiceId, privilege: string): null | PermissionDeniedError {
    const acl = this.serviceAcls.get(service)
    const principal = context.requestingPrincipal()
    if (acl?.get(principal.user)?.has(privilege)) {
      return null
    }
    return permissionDenied(privilege, principal.user, service)
  }
}
