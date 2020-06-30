import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import { Substitute as Sub, SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import { FeedServiceType, FeedTopic, FeedServiceTypeRepository, FeedServiceRepository, FeedServiceId, FeedServiceCreateAttrs, FeedsError, ErrInvalidServiceConfig, FeedService, FeedServiceConnection, RegisteredFeedServiceType, Feed, FeedCreateAttrs, FeedRepository, FeedId, FeedContent } from '../../../lib/entities/feeds/entities.feeds'
import { ListFeedServiceTypes, CreateFeedService, ListServiceTopics, PreviewTopics, ListFeedServices, PreviewFeed } from '../../../lib/app.impl/feeds/app.impl.feeds'
import { MageError, EntityNotFoundError, PermissionDeniedError, ErrPermissionDenied, permissionDenied, ErrInvalidInput, ErrEntityNotFound, InvalidInputError } from '../../../lib/app.api/app.api.global.errors'
import { UserId } from '../../../lib/entities/authn/entities.authn'
import { FeedsPermissionService, ListServiceTopicsRequest, FeedServiceTypeDescriptor, PreviewTopicsRequest } from '../../../lib/app.api/feeds/app.api.feeds'
import uniqid from 'uniqid'
import { AppRequestContext, AppRequest } from '../../../lib/app.api/app.api.global'
import { FeatureCollection } from 'geojson'
import { JsonObject } from '../../../lib/entities/entities.global.json'


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

describe('feeds administration', function() {

  let app: TestApp
  let someServiceTypes: SubstituteOf<RegisteredFeedServiceType>[]

  beforeEach(function() {
    app = new TestApp()
    someServiceTypes = someServiceTypeDescs.map(mockServiceType)
  })

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
      expect(err.data).to.deep.equal(['url'])
      expect(app.serviceRepo.db).to.be.empty
      serviceType.received(1).validateServiceConfig(Arg.deepEquals(invalidConfig))
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
      serviceType.validateServiceConfig(Arg.deepEquals(config)).resolves(null)

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
        id: `${someServiceTypeDescs[0].id}:${uniqid()}`,
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

      const adminReq = requestBy(adminPrincipal)
      const res = await app.listServices(adminReq)

      expect(res.error).to.be.null
      expect(res.success).to.be.instanceOf(Array)
      expect(res.success?.length).to.equal(someServices.length)
      expect(res.success).to.deep.contain(someServices[0])
      expect(res.success).to.deep.contain(someServices[1])
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
      serviceType.createConnection(Arg.any()).returns(conn)

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
      expect(err?.data).to.deep.equal(['invalid'])
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
          updateFrequency: { seconds: 3600 }
        },
        {
          id: 'fire_reports',
          title: 'Fires',
          summary: 'Reports of fires',
          paramsSchema: {
            $ref: 'urn:mage:current_user_location'
          },
          itemsHaveIdentity: true,
          updateFrequency: { seconds: 3600 }
        }
      ]
      const conn = Sub.for<FeedServiceConnection>()
      serviceType.validateServiceConfig(Arg.deepEquals(req.serviceConfig)).resolves(null)
      serviceType.createConnection(Arg.deepEquals(req.serviceConfig)).returns(conn)
      conn.fetchAvailableTopics().resolves(topics)

      const res = await app.previewTopics(req)

      expect(res.error).to.be.null
      expect(res.success).to.deep.equal(topics)
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
      serviceType.createConnection(Arg.deepEquals(serviceDesc.config)).returns(service)
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
      serviceType.createConnection(Arg.deepEquals(serviceDesc.config)).returns(service)
      service.fetchAvailableTopics().resolves(topics)
      const req: ListServiceTopicsRequest = requestBy(adminPrincipal, { service: serviceDesc.id })
      const fetched = await app.listTopics(req).then(res => res.success)

      expect(fetched).to.deep.equal(topics)
    })
  })

  describe.only('creating a feed', function() {

    const service: FeedService = {
      id: uniqid(),
      serviceType: someServiceTypeDescs[0].id,
      title: 'Local Weather WFS',
      summary: 'Data about various local weather events',
      config: {
        url: 'https://weather.local.gov/wfs'
      }
    }
    const topics: FeedTopic[] = [
      {
        id: 'lightning',
        title: 'Lightning Strikes',
        summary: 'Locations of lightning strikes',
        itemsHaveSpatialDimension: true,
      },
      {
        id: 'tornadoes',
        title: 'Tornado Touchdowns',
        summary: 'Locations and severity of tornado touchdowns',
        itemsHaveSpatialDimension: true,
      }
    ]

    let serviceConn: SubstituteOf<FeedServiceConnection>

    beforeEach(function() {
      app.registerServiceTypes(...someServiceTypes)
      app.registerServices(service)
      serviceConn = Sub.for<FeedServiceConnection>()
      someServiceTypes[0].createConnection(Arg.deepEquals(service.config)).returns(serviceConn)
    })

    describe('previewing the feed', function() {

      it('fetches items and creates feed preview with minimal config', async function() {

        const feed: FeedCreateAttrs = {
          service: service.id,
          topic: topics[0].id,
        }
        const previewFeed: Feed = {
          id: 'preview',
          service: service.id,
          topic: topics[0].id,
          title: topics[0].title,
          summary: topics[0].summary,
          constantParams: null,
          variableParamsSchema: {},
          updateFrequency: null,
          itemsHaveIdentity: false,
          itemsHaveSpatialDimension: false,
          itemPrimaryProperty: undefined,
          itemSecondaryProperty: undefined,
          itemTemporalProperty: undefined,
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
          variableParams: null,
          items: previewItems,
        }

        const req = requestBy(adminPrincipal, { feed })
        const res = await app.previewFeed(req)

        expect(res.error).to.be.null
        expect(res.success?.feed).to.deep.equal(previewFeed)
        expect(res.success?.content).to.deep.equal(previewContent)
      })

      it('does not save the preview feed', async function() {

        const feed: FeedCreateAttrs = {
          service: service.id,
          topic: topics[0].id
        }
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
        expect(res.success).to.be.instanceOf(Object)
        expect(app.feedRepo.db).to.be.empty
      })

      it('fails if the service does not exist', async function() {

        const feed: FeedCreateAttrs = {
          service: 'not there',
          topic: topics[0].id
        }

        const req = requestBy(adminPrincipal, { feed })
        const res = await app.previewFeed(req)

        expect(res.success).to.be.null
        const error = res.error as EntityNotFoundError
        expect(error).to.be.instanceOf(MageError)
        expect(error.code).to.equal(ErrEntityNotFound)
        expect(error.data.entityType).to.equal('FeedService')
        expect(error.data.entityId).to.equal('not there')
        serviceConn.didNotReceive().fetchTopicContent(Arg.all())
      })

      it('fails if the topic does not exist', async function() {
        expect.fail('todo')
      })

      it('checks permission for previewing a feed', async function() {
        expect.fail('todo')
      })
    })

    describe('saving the feed', function() {

      it('saves the feed', async function() {
        expect.fail('todo')
      })

      it('saves a feed from a preview', async function() {
        expect.fail('todo')
      })
    })
  })

  xdescribe('previewing feed data', function() {

    // const source1Desc: SourceDescriptor = {
    //   id: 'source1',
    //   adapter: someFeedTypes[0].id,
    //   title: 'Preview 1',
    //   summary: 'Only for 1 previews',
    //   isReadable: true,
    //   isWritable: false,
    //   url: `${someFeedTypes[0].id}://source1`
    // }
    // const source2Desc: Feed = {
    //   id: 'source2',
    //   feedType: someFeedTypes[0].id,
    //   title: 'Preview 2',
    //   summary: 'Only for 2 previews',
    // }
    // let feedType: SubstituteOf<FeedType>

    // beforeEach(async function() {
    //   feedType = Sub.for<FeedType>()
    //   app.registerTypes(someFeedTypes[0])
    //   app.registerSources(source1Desc, source2Desc)
    // })

    describe('presenting the preview parameters', async function() {

      it('presents preview parameters from the source adapter', async function() {

        expect.fail('todo')
        // const params = {
        //   tag: source1Desc.id,
        //   slur: true,
        //   norb: 10,
        //   newerThan: Date.now() - 7 * 24 * 60 * 60 * 1000
        // }
        // feedType.getPreviewParametersForSource(Arg.deepEquals(source1Desc)).resolves(params)
        // const fetchedParams = await app.getPreviewParametersForSource(source1Desc.id)

        // expect(fetchedParams).to.deep.equal(params)
        // feedType.received(1).getPreviewParametersForSource(Arg.deepEquals(source1Desc))
      })

      it('rejects when the source is not found', async function() {

        expect.fail('todo')
        // await expect(app.getPreviewParametersForSource(source1Desc.id + '... not'))
        //   .to.eventually.rejectWith(EntityNotFoundError)
      })

      it('rejects when the adapter is not registered', async function() {

        expect.fail('todo')
        // const orphan: SourceDescriptor = {
        //   id: 'orphan',
        //   adapter: 'wut',
        //   title: 'Orphan',
        //   summary: 'Missing adapter',
        //   isReadable: false,
        //   isWritable: false,
        //   url: 'missing://gone'
        // }
        // app.registerSources(orphan)

        // await expect(app.getPreviewParametersForSource(orphan.id))
        //   .to.eventually.rejectWith(MageError)
        //   .with.property('code', MageErrorCode.InternalError)
      })
    })

    it('fetches preview data', async function() {

      expect.fail('todo')
    })
  })
})

class TestApp {

  readonly serviceTypeRepo = new TestFeedServiceTypeRepository()
  readonly serviceRepo = new TestFeedServiceRepository()
  readonly feedRepo = new TestFeedRepository()
  readonly permissionService = new TestPermissionService()
  readonly listServiceTypes = ListFeedServiceTypes(this.permissionService, this.serviceTypeRepo)
  readonly previewTopics = PreviewTopics(this.permissionService, this.serviceTypeRepo)
  readonly createService = CreateFeedService(this.permissionService, this.serviceTypeRepo, this.serviceRepo)
  readonly listServices = ListFeedServices(this.permissionService, this.serviceRepo)
  readonly listTopics = ListServiceTopics(this.permissionService, this.serviceTypeRepo, this.serviceRepo)
  readonly previewFeed = PreviewFeed(this.permissionService, this.serviceTypeRepo, this.serviceRepo)

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
}
class TestPermissionService implements FeedsPermissionService {

  // TODO: add acl for specific services and listing topics
  readonly privleges = {
    [adminPrincipal.user]: {
      [ListFeedServiceTypes.name]: true,
      [CreateFeedService.name]: true,
      [ListFeedServices.name]: true,
      [ListServiceTopics.name]: true,
    }
  } as { [user: string]: { [privilege: string]: boolean }}
  readonly serviceAcls = new Map<FeedServiceId, Map<UserId, Set<string>>>()

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
    const acl = this.serviceAcls.get(service)
    const principal = context.requestingPrincipal()
    if (acl?.get(principal.user)?.has(ListServiceTopics.name)) {
      return null
    }
    return permissionDenied(ListServiceTopics.name, principal.user)
  }

  grantCreateService(user: UserId) {
    this.grantPrivilege(user, CreateFeedService.name)
  }

  grantListServices(user: UserId) {
    this.grantPrivilege(user, ListFeedServices.name)
  }

  grantListTopics(user: UserId, service: FeedServiceId) {
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
    servicePermissions.add(ListServiceTopics.name)
  }

  revokeListTopics(user: UserId, service: FeedServiceId) {
    const acl = this.serviceAcls.get(service)
    const servicePermissions = acl?.get(user)
    servicePermissions?.delete(ListServiceTopics.name)
  }

  async ensureCreateFeedPermissionFor(context: AppRequestContext<TestPrincipal>): Promise<null | PermissionDeniedError> {
    throw new Error('todo')
  }

  checkPrivilege(user: UserId, privilege: string): null | PermissionDeniedError {
    if (!this.privleges[user]?.[privilege]) {
      return permissionDenied(user, privilege)
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
}
