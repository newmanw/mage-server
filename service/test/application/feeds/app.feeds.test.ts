import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import { Substitute as Sub, SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import { FeedType, Feed, FeedParams, FeedContent } from '../../../lib/entities/feeds/entities.feeds'
import { ListFeedTypes, CreateFeed, FeedsPermissionService, PreviewFeedContent } from '../../../lib/application/manifold/app.manifold.use_cases'
import { MageErrorCode, MageError, EntityNotFoundError } from '../../../lib/application/app.global.errors'
import { UserId } from '../../../lib/entities/authn/entities.authn'
import { FeedTypeDescriptor, FeedDescriptor, FeedTypeId } from '../../../lib/app.api/feeds/app.api.feeds'

const someTypes: FeedType[] = [
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

describe.only('feeds administration', function() {

  let app: TestApp

  beforeEach(function() {
    app = new TestApp()
  })

  describe('listing available feed types', async function() {

    it('returns all the feed types', async function() {

      app.registerTypes(...someTypes)
      const read = await app.listFeedTypes(adminPrincipal)
      expect(read).to.have.deep.members(someTypes)
    })

    it('checks permission for listing feed types', async function() {

      app.denyAllPrivileges()
      await expect(app.listFeedTypes(adminPrincipal)).to.eventually.rejectWith(MageErrorCode.PermissionDenied)
    })
  })

  describe('creating a source', function() {

    it('provides the source stub from the adapter', async function() {

      expect.fail('todo')
    })

    it('saves a source descriptor', async function() {

      const sourceAttrs: Partial<SourceDescriptor> = {
        adapter: someTypes[0].id,
        title: 'Slurm',
        summary: 'Bur wen',
        url: 'https://slurm.io/api'
      }
      app.registerTypes(...someTypes)

      const created = await app.createSource(sourceAttrs)
      const inDb = app.feedRepo.db.get(created.id)

      expect(created).to.deep.include({
        ...sourceAttrs
      })
      expect(created.id).to.exist
      expect(created).to.deep.equal(inDb)
    })

    it('checks permission for creating a source', async function() {

      const sourceAttrs: Partial<SourceDescriptor> = {
        adapter: someTypes[0].id,
        title: 'Boor Lum',
        summary: 'Lem do sot',
        url: 'socket://boor-lum.ner'
      }
      app.denyAllPrivileges()

      await expect(app.createSource(sourceAttrs)).to.eventually.rejectWith(MageErrorCode.PermissionDenied)
    })

    it('validates the source has a valid adapter', async function() {

      const sourceAttrs: Partial<SourceDescriptor> = {
        title: 'Boor Lum',
        summary: 'Lem do sot',
        url: 'socket://boor-lum.ner'
      }

      await expect(app.createSource(sourceAttrs), 'without adapter id')
        .to.eventually.rejectWith(MageErrorCode.InvalidInput)

      sourceAttrs.adapter = someTypes[0].id + '.invalid'

      await expect(app.createSource(sourceAttrs), 'with invalid adapter id')
        .to.eventually.rejectWith(MageErrorCode.InvalidInput)
    })
  })

  describe('previewing source data', function() {

    const source1Desc: SourceDescriptor = {
      id: 'source1',
      adapter: someTypes[0].id,
      title: 'Preview 1',
      summary: 'Only for 1 previews',
      isReadable: true,
      isWritable: false,
      url: `${someTypes[0].id}://source1`
    }
    const source2Desc: Feed = {
      id: 'source2',
      feedType: someTypes[0].id,
      title: 'Preview 2',
      summary: 'Only for 2 previews',
    }
    let feedType: SubstituteOf<FeedType>

    beforeEach(async function() {
      feedType = Sub.for<FeedType>()
      app.registerTypes(someTypes[0])
      app.registerSources(source1Desc, source2Desc)
    })

    describe('presenting the preview parameters', async function() {

      it('presents preview parameters from the source adapter', async function() {

        const params = {
          tag: source1Desc.id,
          slur: true,
          norb: 10,
          newerThan: Date.now() - 7 * 24 * 60 * 60 * 1000
        }
        feedType.getPreviewParametersForSource(Arg.deepEquals(source1Desc)).resolves(params)
        const fetchedParams = await app.getPreviewParametersForSource(source1Desc.id)

        expect(fetchedParams).to.deep.equal(params)
        feedType.received(1).getPreviewParametersForSource(Arg.deepEquals(source1Desc))
      })

      it('rejects when the source is not found', async function() {

        await expect(app.getPreviewParametersForSource(source1Desc.id + '... not'))
          .to.eventually.rejectWith(EntityNotFoundError)
      })

      it('rejects when the adapter is not registered', async function() {

        const orphan: SourceDescriptor = {
          id: 'orphan',
          adapter: 'wut',
          title: 'Orphan',
          summary: 'Missing adapter',
          isReadable: false,
          isWritable: false,
          url: 'missing://gone'
        }
        app.registerSources(orphan)

        await expect(app.getPreviewParametersForSource(orphan.id))
          .to.eventually.rejectWith(MageError)
          .with.property('code', MageErrorCode.InternalError)
      })
    })

    it('fetches preview data', async function() {

      expect.fail('todo')
    })
  })
})

class TestApp {

  readonly feedTypeRepo = new TestFeedTypeRepository()
  readonly feedRepo = new TestFeedRepository()
  readonly permissionService = new TestPermissionService()
  readonly listFeedTypes = ListFeedTypes(this.feedTypeRepo, this.permissionService)
  readonly createSource = CreateFeed(this.feedTypeRepo, this.feedRepo, this.permissionService)
  readonly previewFeedContent = PreviewFeedContent(this.feedTypeRepo, this.permissionService)

  registerTypes(... types: FeedType[]): void {
    for (let type of types) {
      this.feedTypeRepo.db.set(type.id, type)
    }
  }

  registerSources(...feeds: Feed[]): void {
    for (const feed of feeds) {
      this.feedRepo.db.set(feed.id, feed)
    }
  }

  allowAllPrivileges() {
    this.permissionService.allowAll()
  }

  denyAllPrivileges() {
    this.permissionService.denyAll()
  }
}

class TestFeedTypeRepository implements feedsImpl.FeedTypeRepository {

  readonly db = new Map<string, FeedType>()

  async readAll(): Promise<FeedType[]> {
    return Array.from(this.db.values())
  }

  async findById(adapterId: string): Promise<FeedType | null> {
    return this.db.get(adapterId) ?? null
  }

  update(attrs: Partial<FeedType> & { id: string }): Promise<FeedType> {
    throw new Error('Method not implemented.')
  }

  removeById(adapterId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

class TestFeedRepository implements SourceRepository {

  readonly db = new Map<string, Feed>()

  async create(attrs: Required<{ feedType: FeedTypeId }> & Partial<FeedDescriptor>): Promise<Feed> {
    const saved: Feed = {
      feedType: attrs.feedType,
      ...(attrs as FeedDescriptor),
      id: `${attrs.feedType}:${this.db.size + 1}`
    }
    this.db.set(saved.id, saved)
    return saved
  }

  async readAll(): Promise<Feed[]> {
    return Array.from(this.db.values())
  }

  async findById(sourceId: string): Promise<Feed | null> {
    return this.db.get(sourceId) || null
  }
}

class TestPermissionService implements FeedsPermissionService {

  readonly privleges = {
    [ListFeedTypes.name]: true,
    [CreateFeed.name]: true,
  }

  async ensureListTypesPermissionFor(user: UserId): Promise<void> {
    this.checkPrivilege(ListFeedTypes.name)
  }

  async ensureCreateFeedPermissionFor(user: UserId): Promise<void> {
    this.checkPrivilege(CreateFeed.name)
  }

  checkPrivilege(privilege: string) {
    if (!this.privleges[privilege]) {
      throw new MageError(MageErrorCode.PermissionDenied)
    }
  }

  allowAll() {
    Object.keys(this.privleges).forEach(priv => {
      this.privleges[priv] = true
    })
  }

  denyAll() {
    Object.keys(this.privleges).forEach(priv => {
      this.privleges[priv] = false
    })
  }
}
