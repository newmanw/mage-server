import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import { Substitute as Sub, SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import { FeedServiceType, FeedType, Feed, FeedParams, FeedContent, FeedServiceTypeRepository, FeedRepository } from '../../../lib/entities/feeds/entities.feeds'
import { CreateFeed, FeedsPermissionService, ListFeedServiceTypes, CreateFeedService, ListFeedServiceTypesPermission, CreateFeedServicePermission } from '../../../lib/app.impl/feeds/app.impl.feeds'
import { MageError, EntityNotFoundError, PermissionDeniedError, ErrPermissionDenied, permissionDenied, ErrInvalidInput } from '../../../lib/app.api/app.api.global.errors'
import { UserId } from '../../../lib/entities/authn/entities.authn'
import { FeedDescriptor, FeedTypeGuid, FeedServiceTypeDescriptor } from '../../../lib/app.api/feeds/app.api.feeds'
import uniqid from 'uniqid'

const someServiceTypes: FeedServiceType[] = [
  {
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
    }
  },
  {
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
    }
  }
]

const someFeedTypes: FeedType[] = [
  {
    id: 'type1',
    title: 'Feed Type 1',
    summary: null,
    constantParamsSchema: {},
    variableParamsSchema: {},
    async previewContent(params: FeedParams): Promise<FeedContent> {
      throw new Error('todo')
    },
    async fetchContentFromFeed(params: FeedParams): Promise<FeedContent> {
      throw new Error('todo')
    }
  },
  {
    id: 'type2',
    title: 'Feed Type 2',
    summary: null,
    constantParamsSchema: {},
    variableParamsSchema: {},
    async previewContent(params: FeedParams): Promise<FeedContent> {
      throw new Error('todo')
    },
    async fetchContentFromFeed(params: FeedParams): Promise<FeedContent> {
      throw new Error('todo')
    }
  }
]

const adminPrincipal = {
  user: 'admin'
}

const bannedPrincipal = {
  user: 'schmo'
}

describe.only('feeds administration', function() {

  let app: TestApp

  beforeEach(function() {
    app = new TestApp()
  })

  describe.only('listing available feed service types', async function() {

    beforeEach(function() {
      app.registerServiceTypes(...someServiceTypes)
    })

    it('returns all the feed service types', async function() {

      const serviceTypes = await app.listServiceTypes(adminPrincipal).then(res => res.success)

      expect(serviceTypes).to.deep.equal(someServiceTypes)
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

    it('validates the configuration options', async function() {

      const serviceType = someServiceTypes[0]
      const invalidConfig = {
        url: null
      }
      const err = await app.createService({ ...adminPrincipal, serviceType: serviceType.id, config: invalidConfig }).then(res => res.error)

      expect(err).to.be.instanceOf(MageError)
      expect(err?.code).to.equal(ErrInvalidInput)
      expect(app.serviceRepo.db).to.be.empty
    })

    it('saves the service', async function() {

      const serviceType = someServiceTypes[0].id
      const config = { url: 'https://some.service/somewhere' }
      const created = await app.createService({ ...adminPrincipal, serviceType, config }).then(res => res.success)
      const inDb = created && app.serviceRepo.db.get(created.id)

      expect(created?.id).to.exist
      expect(created).to.deep.include({
        config: config
      })
      expect(inDb).to.deep.equal(created)
    })

    it('checks permission for creating a feed service', async function() {

      const serviceType = someServiceTypes[1].id
      const config = { url: 'https://does.not/matter' }
      const err = await app.createService({ ...bannedPrincipal, serviceType, config }).then(res => res.error)

      expect(err?.code).to.equal(ErrPermissionDenied)
      expect(app.serviceRepo.db).to.be.empty
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
  readonly serviceRepo = new TestFeedRepository()
  readonly permissionService = new TestPermissionService()
  readonly listServiceTypes = ListFeedServiceTypes(this.serviceTypeRepo, this.permissionService)
  readonly createService = CreateFeedService(this.permissionService)
  // readonly createSource = CreateFeed(this.serviceTypeRepo, this.feedRepo, this.permissionService)
  // readonly previewFeedContent = PreviewFeedContent(this.serviceTypeRepo, this.permissionService)

  registerServiceTypes(... types: FeedServiceType[]): void {
    for (const type of types) {
      this.serviceTypeRepo.db.set(type.id, type)
    }
  }

  registerSources(...feeds: Feed[]): void {
    for (const feed of feeds) {
      this.serviceRepo.db.set(feed.id, feed)
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

class TestFeedRepository implements FeedRepository {

  readonly db = new Map<string, Feed>()

  async create(attrs: Required<{ feedType: FeedTypeGuid }> & Partial<FeedDescriptor>): Promise<Feed> {
    const saved: Feed = {
      feedType: attrs.feedType,
      ...(attrs as FeedDescriptor),
      id: `${attrs.feedType}:${this.db.size + 1}`
    }
    this.db.set(saved.id, saved)
    return saved
  }

  async findAll(): Promise<Feed[]> {
    return Array.from(this.db.values())
  }

  async findById(sourceId: string): Promise<Feed | null> {
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
