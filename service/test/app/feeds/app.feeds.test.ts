import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import { Substitute as Sub, SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import '../../utils'
import { FeedServiceType, FeedTopic, FeedService, FeedParams, FeedContent, FeedServiceTypeRepository, InvalidServiceConfigError, InvalidServiceConfigErrorData, FeedServiceRepository, FeedServiceId, FeedServiceCreateAttrs, FeedsError, ErrInvalidServiceConfig, FeedServiceDescriptor } from '../../../lib/entities/feeds/entities.feeds'
import { CreateFeed, FeedsPermissionService, ListFeedServiceTypes, CreateFeedService, ListTopics } from '../../../lib/app.impl/feeds/app.impl.feeds'
import { MageError, EntityNotFoundError, PermissionDeniedError, ErrPermissionDenied, permissionDenied, ErrInvalidInput, ErrEntityNotFound, InvalidInputError } from '../../../lib/app.api/app.api.global.errors'
import { UserId } from '../../../lib/entities/authn/entities.authn'
import { FeedDescriptor, FeedTypeGuid, FeedServiceTypeDescriptor, ListTopicsRequest } from '../../../lib/app.api/feeds/app.api.feeds'
import uniqid from 'uniqid'


function mockServiceType(descriptor: FeedServiceTypeDescriptor): SubstituteOf<FeedServiceType> {
  const mock = Sub.for<FeedServiceType>()
  mock.id.returns!(descriptor.id)
  mock.title.returns!(descriptor.title)
  mock.description.returns!(descriptor.description)
  mock.configSchema.returns!(descriptor.configSchema)
  return mock
}

const someServiceTypeDescs: FeedServiceTypeDescriptor[] = [
  Object.freeze({
    descriptorOf: 'FeedServiceType',
    id: `ogc.wfs-${uniqid()}`,
    title: 'OGC Web Feature Service',
    description: 'An OGC Web Feature Service is a standard interface to query geospatial features.',
    configSchema: {
      type: 'object',
      properties: {
        url: {
          title: 'Service URL',
          description: 'The base URL of the WFS server',
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
    description: 'An OGC API - Features service is a standard interface to query geospatial features.  OAF is the modern evolution of WFS.',
    configSchema: {
      type: 'object',
      properties: {
        url: {
          title: 'Service URL',
          description: 'The base URL of the OAF server',
          type: 'string',
          format: 'uri',
        }
      },
      required: [ 'url' ]
    },
  })
]

const adminPrincipal = {
  user: 'admin'
}

const bannedPrincipal = {
  user: 'schmo'
}

describe.only('feeds administration', function() {

  let app: TestApp
  let someServiceTypes: SubstituteOf<FeedServiceType>[]

  beforeEach(function() {
    app = new TestApp()
    someServiceTypes = someServiceTypeDescs.map(mockServiceType)
  })

  describe('listing available feed service types', async function() {

    beforeEach(function() {
      app.registerServiceTypes(...someServiceTypes)
    })

    it('returns all the feed service types', async function() {

      const serviceTypes = await app.listServiceTypes(adminPrincipal).then(res => res.success)

      expect(serviceTypes).to.deep.equal(someServiceTypeDescs)
    })

    it('checks permission for listing service types', async function() {

      const error = await app.listServiceTypes(bannedPrincipal).then(res => res.error)

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
      const err = await app.createService({ ...bannedPrincipal, serviceType: serviceType.id, title: 'Test Service', config }).then(res => res.error)

      expect(err?.code).to.equal(ErrPermissionDenied)
      expect(app.serviceRepo.db).to.be.empty
      serviceType.didNotReceive().validateServiceConfig(Arg.any())
    })

    it('fails if the feed service config is invalid', async function() {

      const serviceType = someServiceTypes[0]
      const invalidConfig = {
        url: null
      }
      serviceType.validateServiceConfig(Arg.any()).resolves(new FeedsError(ErrInvalidServiceConfig, new InvalidServiceConfigErrorData(['url'])))
      const err = await app.createService({ ...adminPrincipal, serviceType: serviceType.id, title: 'Test Service', config: invalidConfig }).then(res => res.error as InvalidInputError)

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
      const err = await app.createService({ ...adminPrincipal, serviceType: invalidServiceType, title: 'Test Serivce', config: invalidConfig }).then(res => res.error as EntityNotFoundError)

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

      const created = await app.createService({ ...adminPrincipal, serviceType: serviceType.id, title: 'Test Service', config }).then(res => res.success)
      const inDb = created && app.serviceRepo.db.get(created.id)

      expect(created?.id).to.exist
      expect(created).to.deep.include({
        serviceType: serviceType.id,
        title: 'Test Service',
        description: null,
        config: config
      })
      expect(inDb).to.deep.equal(created)
    })
  })

  describe('listing topics', async function() {

    const someServiceDescs: FeedServiceDescriptor[] = [
      {
        descriptorOf: 'FeedService',
        id: `${someServiceTypeDescs[0].id}:${uniqid()}`,
        serviceType: someServiceTypeDescs[0].id,
        title: 'WFS 1',
        description: null,
        config: {
          url: 'https://test.mage/wfs'
        }
      }
    ]

    beforeEach(function() {
      app.registerServices(...someServiceDescs)
    })

    it('checks permission for listing topics', async function() {

      const req: ListTopicsRequest = {
        ...bannedPrincipal,
        service: someServiceDescs[0].id
      }
      const err = await app.listTopics(req).then(res => res.error as PermissionDeniedError)

      expect(err).to.be.instanceOf(MageError)
      expect(err.code).to.equal(ErrPermissionDenied)
      for (const serviceType of someServiceTypes) {
        serviceType.didNotReceive().instantiateService(Arg.any())
      }
    })

    it('returns all the topics for a service', async function() {

      expect.fail('todo')
      // app.registerTypes(...someFeedTypes)
      // const read = await app.listFeedTypes(adminPrincipal)
      // expect(read).to.have.deep.members(someFeedTypes)
    })
  })

  xdescribe('creating a feed', function() {

    it('provides the source stub from the adapter', async function() {

      expect.fail('todo')
    })

    it('saves a source descriptor', async function() {

      expect.fail('todo')
    })

    it('checks permission for creating a source', async function() {

      expect.fail('todo')
    })

    it('validates the source has a valid adapter', async function() {

      expect.fail('todo')
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
  readonly permissionService = new TestPermissionService()
  readonly listServiceTypes = ListFeedServiceTypes(this.permissionService, this.serviceTypeRepo)
  readonly createService = CreateFeedService(this.permissionService, this.serviceTypeRepo, this.serviceRepo)
  readonly listTopics = ListTopics(this.permissionService, this.serviceRepo)

  registerServiceTypes(... types: FeedServiceType[]): void {
    for (const type of types) {
      this.serviceTypeRepo.db.set(type.id, type)
    }
  }

  registerServices(...services: FeedServiceDescriptor[]): void {
    for (const service of services) {
      this.serviceRepo.db.set(service.id, service)
    }
  }
}

class TestFeedServiceTypeRepository implements FeedServiceTypeRepository {

  readonly db = new Map<string, FeedServiceType>()

  async findAll(): Promise<FeedServiceType[]> {
    return Array.from(this.db.values())
  }

  async findById(serviceTypeId: string): Promise<FeedServiceType | null> {
    return this.db.get(serviceTypeId) ?? null
  }
}

class TestFeedServiceRepository implements FeedServiceRepository {

  readonly db = new Map<string, FeedServiceDescriptor>()

  async create(attrs: FeedServiceCreateAttrs): Promise<FeedServiceDescriptor> {
    const saved: FeedServiceDescriptor = {
      id: `${attrs.serviceType}:${this.db.size + 1}`,
      descriptorOf: 'FeedService',
      ...attrs
    }
    this.db.set(saved.id, saved)
    return saved
  }

  async findAll(): Promise<FeedServiceDescriptor[]> {
    return Array.from(this.db.values())
  }

  async findById(sourceId: string): Promise<FeedServiceDescriptor | null> {
    return this.db.get(sourceId) || null
  }
}

class TestPermissionService implements FeedsPermissionService {

  // TODO: add acl for specific services and listing topics
  readonly privleges = {
    [adminPrincipal.user]: {
      [ListFeedServiceTypes.name]: true,
      [CreateFeedService.name]: true,
      [ListTopics.name]: true,
    }
  } as { [user: string]: { [privilege: string]: boolean }}
  readonly serviceAcls = new Map<FeedServiceId, Map<UserId, Set<string>>>()

  async ensureListServiceTypesPermissionFor(user: UserId): Promise<null | PermissionDeniedError> {
    return this.checkPrivilege(user, ListFeedServiceTypes.name)
  }

  async ensureCreateServicePermissionFor(user: UserId): Promise<null | PermissionDeniedError> {
    return this.checkPrivilege(user, CreateFeedService.name)
  }

  async ensureListTopicsPermissionFor(user: UserId, service: FeedServiceDescriptor): Promise<null | PermissionDeniedError> {
    const acl = this.serviceAcls.get(service.id)
    if (acl?.get(user)?.has(ListTopics.name)) {
      return null
    }
    return permissionDenied(ListTopics.name, user)
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
    servicePermissions.add(ListTopics.name)
  }

  revokeListTopics(user: UserId, service: FeedServiceId) {
    let acl = this.serviceAcls.get(service)
    if (!acl) {
      return
    }
    let servicePermissions = acl.get(user)
    if (!servicePermissions) {
      return
    }
    servicePermissions.delete(ListTopics.name)
  }

  async ensureCreateFeedPermissionFor(user: UserId): Promise<null | PermissionDeniedError> {
    throw new Error('todo')
  }

  checkPrivilege(user: UserId, privilege: string): null | PermissionDeniedError {
    if (!this.privleges[user]?.[privilege]) {
      return permissionDenied(user, privilege)
    }
    return null
  }
}
