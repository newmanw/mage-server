import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import { Substitute as Sub, SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import '../../utils'
import { FeedServiceType, FeedTopic, FeedService, FeedParams, FeedContent, FeedServiceTypeRepository, InvalidServiceConfigError, InvalidServiceConfigErrorData, FeedServiceRepository, FeedServiceId, FeedServiceCreateAttrs, FeedsError, ErrInvalidServiceConfig, FeedServiceDescriptor } from '../../../lib/entities/feeds/entities.feeds'
import { CreateFeed, FeedsPermissionService, ListFeedServiceTypes, CreateFeedService, ListFeedServiceTypesPermission, CreateFeedServicePermission } from '../../../lib/app.impl/feeds/app.impl.feeds'
import { MageError, EntityNotFoundError, PermissionDeniedError, ErrPermissionDenied, permissionDenied, ErrInvalidInput, ErrEntityNotFound, InvalidInputError } from '../../../lib/app.api/app.api.global.errors'
import { UserId } from '../../../lib/entities/authn/entities.authn'
import { FeedDescriptor, FeedTypeGuid, FeedServiceTypeDescriptor } from '../../../lib/app.api/feeds/app.api.feeds'
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

  describe.only('listing available feed service types', async function() {

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

  describe.only('creating a feed service', async function() {

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

  describe('listing available feed types', async function() {

    it('returns all the feed types', async function() {

      expect.fail('todo')
      // app.registerTypes(...someFeedTypes)
      // const read = await app.listFeedTypes(adminPrincipal)
      // expect(read).to.have.deep.members(someFeedTypes)
    })

    it('checks permission for listing feed types', async function() {

      expect.fail('todo')
      // app.denyAllPrivileges()
      // await expect(app.listFeedTypes(adminPrincipal)).to.eventually.rejectWith(MageErrorCode.PermissionDenied)
    })
  })

  describe('creating a source', function() {

    it('provides the source stub from the adapter', async function() {

      expect.fail('todo')
    })

    it('saves a source descriptor', async function() {

      expect.fail('todo')
      // const feedAttrs: Partial<Feed> = {
      //   feedType: someFeedTypes[0].id,
      //   title: 'Slurm Alerts',
      //   summary: 'The latest on when and where slurm happens',
      //   constantParams: {
      //     url: 'https://slurm.io/api'
      //   },
      //   variableParams: {
      //     maxItems: 25,
      //     maxItemAgeInDays: 7
      //   }
      // }
      // app.registerTypes(...someFeedTypes)

      // const created = await app.createSource(feedAttrs)
      // const inDb = app.feedRepo.db.get(created.id)

      // expect(created).to.deep.include({
      //   ...feedAttrs
      // })
      // expect(created.id).to.exist
      // expect(created).to.deep.equal(inDb)
    })

    it('checks permission for creating a source', async function() {

      expect.fail('todo')
      // const sourceAttrs: Partial<SourceDescriptor> = {
      //   adapter: someFeedTypes[0].id,
      //   title: 'Boor Lum',
      //   summary: 'Lem do sot',
      //   url: 'socket://boor-lum.ner'
      // }
      // app.denyAllPrivileges()

      // await expect(app.createSource(sourceAttrs)).to.eventually.rejectWith(MageErrorCode.PermissionDenied)
    })

    it('validates the source has a valid adapter', async function() {

      expect.fail('todo')
      // const sourceAttrs: Partial<SourceDescriptor> = {
      //   title: 'Boor Lum',
      //   summary: 'Lem do sot',
      //   url: 'socket://boor-lum.ner'
      // }

      // await expect(app.createSource(sourceAttrs), 'without adapter id')
      //   .to.eventually.rejectWith(MageErrorCode.InvalidInput)

      // sourceAttrs.adapter = someFeedTypes[0].id + '.invalid'

      // await expect(app.createSource(sourceAttrs), 'with invalid adapter id')
      //   .to.eventually.rejectWith(MageErrorCode.InvalidInput)
    })
  })

  describe('previewing source data', function() {

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
  readonly listServiceTypes = ListFeedServiceTypes(this.serviceTypeRepo, this.permissionService)
  readonly createService = CreateFeedService(this.permissionService, this.serviceTypeRepo, this.serviceRepo)

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

  readonly privleges = {
    [adminPrincipal.user]: {
      [ListFeedServiceTypesPermission]: true,
      [CreateFeedServicePermission]: true,
    }
  } as { [user: string]: { [privilege: string]: boolean }}

  async ensureListServiceTypesPermissionFor(user: UserId): Promise<null | PermissionDeniedError> {
    return this.checkPrivilege(user, ListFeedServiceTypesPermission)
  }

  async ensureCreateServicePermissionFor(user: UserId): Promise<null | PermissionDeniedError> {
    return this.checkPrivilege(user, CreateFeedServicePermission)
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
