import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import { Substitute as Sub, SubstituteOf, Arg } from '@fluffy-spoon/substitute'
import { AdapterDescriptor, SourceDescriptor, ManifoldAdapter, SourceConnection } from '../../../lib/entities/manifold/entities.manifold'
import { ListAdaptersFn, CreateSourceFn, GetSourcePreviewParameters, AdapterRepository, SourceRepository, ManifoldAuthorizationService, ManifoldAdapterRegistry } from '../../../lib/application/manifold/app.manifold.use_cases'
import { MageErrorCode, MageError, EntityNotFoundError } from '../../../lib/application/app.global.errors'
import deepEqual from 'deep-equal'

const someAdapters: AdapterDescriptor[] = [
  Object.freeze({
    id: 'adapter1',
    title: 'Adapter 1',
    summary: null,
    isReadable: true,
    isWritable: false,
  }),
  Object.freeze({
    id: 'adapter2',
    title: 'Adapter 2',
    summary: null,
    isReadable: true,
    isWritable: false,
  })
]

describe.only('manifold administration', function() {

  let app: TestApp

  beforeEach(function() {
    app = new TestApp()
  })

  describe('listing available adapters', async function() {

    it('returns all the adapter descriptors', async function() {

      app.registerAdapters(...someAdapters)
      const read = await app.listAdapters()
      expect(read).to.have.deep.members(someAdapters)
    })

    it('checks permission for listing adapters', async function() {

      app.denyAllPrivileges()
      await expect(app.listAdapters()).to.eventually.rejectWith(MageErrorCode.PermissionDenied)
    })
  })

  describe('creating a source', function() {

    it('provides the source stub from the adapter', async function() {

      expect.fail('todo')
    })

    it('saves a source descriptor', async function() {

      const sourceAttrs: Partial<SourceDescriptor> = {
        adapter: someAdapters[0].id,
        title: 'Slurm',
        summary: 'Bur wen',
        url: 'https://slurm.io/api'
      }
      app.registerAdapters(...someAdapters)

      const created = await app.createSource(sourceAttrs)
      const inDb = app.sourceRepo.db.get(created.id)

      expect(created).to.deep.include({
        ...sourceAttrs
      })
      expect(created.id).to.exist
      expect(created).to.deep.equal(inDb)
    })

    it('checks permission for creating a source', async function() {

      const sourceAttrs: Partial<SourceDescriptor> = {
        adapter: someAdapters[0].id,
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

      sourceAttrs.adapter = someAdapters[0].id + '.invalid'

      await expect(app.createSource(sourceAttrs), 'with invalid adapter id')
        .to.eventually.rejectWith(MageErrorCode.InvalidInput)
    })
  })

  describe('previewing source data', function() {

    const source1Desc: SourceDescriptor = {
      id: 'source1',
      adapter: someAdapters[0].id,
      title: 'Preview 1',
      summary: 'Only for 1 previews',
      isReadable: true,
      isWritable: false,
      url: `${someAdapters[0].id}://source1`
    }
    const source2Desc: SourceDescriptor = {
      id: 'source2',
      adapter: someAdapters[0].id,
      title: 'Preview 2',
      summary: 'Only for 2 previews',
      isReadable: true,
      isWritable: false,
      url: `${someAdapters[0].id}://source2`
    }
    let adapter: SubstituteOf<ManifoldAdapter>

    beforeEach(async function() {
      adapter = Sub.for<ManifoldAdapter>()
      app.registerAdapters([ someAdapters[0], adapter ], someAdapters[1])
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
        adapter.getPreviewParametersForSource(Arg.deepEquals(source1Desc)).resolves(params)
        const fetchedParams = await app.getPreviewParametersForSource(source1Desc.id)

        expect(fetchedParams).to.deep.equal(params)
        adapter.received(1).getPreviewParametersForSource(Arg.deepEquals(source1Desc))
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

  readonly adapterRepo = new TestAdapterRepo()
  readonly sourceRepo = new TestSourceRepo()
  readonly authzService = new TestAuthzService()
  readonly adapterRegistry = new TestAdapterRegistry()
  readonly listAdapters = ListAdaptersFn(this.adapterRepo, this.authzService)
  readonly createSource = CreateSourceFn(this.adapterRepo, this.sourceRepo, this.authzService)
  readonly getPreviewParametersForSource = GetSourcePreviewParameters(this.adapterRepo, this.sourceRepo, this.authzService, this.adapterRegistry)

  registerAdapters(... adapters: (AdapterDescriptor | [AdapterDescriptor, ManifoldAdapter])[]): void {
    for (let desc of adapters) {
      if (Array.isArray(desc)) {
        const adapter = desc[1]
        desc = desc[0]
        this.adapterRegistry.set(desc.id, adapter)
      }
      this.adapterRepo.db.set(desc.id, desc)
    }
  }

  registerSources(...sources: SourceDescriptor[]): void {
    for (const source of sources) {
      this.sourceRepo.db.set(source.id, source)
    }
  }

  allowAllPrivileges() {
    this.authzService.allowAll()
  }

  denyAllPrivileges() {
    this.authzService.denyAll()
  }
}

class TestAdapterRepo implements AdapterRepository {

  readonly db = new Map<string, AdapterDescriptor>()

  async readAll(): Promise<AdapterDescriptor[]> {
    return Array.from(this.db.values())
  }

  async findById(adapterId: string): Promise<AdapterDescriptor | null> {
    return this.db.get(adapterId) ?? null
  }

  update(attrs: Partial<AdapterDescriptor> & { id: string }): Promise<AdapterDescriptor> {
    throw new Error('Method not implemented.')
  }

  removeById(adapterId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

class TestSourceRepo implements SourceRepository {

  readonly db = new Map<string, SourceDescriptor>()

  async create(attrs: Partial<SourceDescriptor>): Promise<SourceDescriptor> {
    const saved: SourceDescriptor = {
      ...<SourceDescriptor>attrs,
      id: `${attrs.adapter!}:${this.db.size + 1}`
    }
    this.db.set(saved.id, saved)
    return saved
  }

  async readAll(): Promise<SourceDescriptor[]> {
    return Array.from(this.db.values())
  }

  async findById(sourceId: string): Promise<SourceDescriptor | null> {
    return this.db.get(sourceId) || null
  }
}

class TestAuthzService implements ManifoldAuthorizationService {

  readonly privleges = {
    [ListAdaptersFn.name]: true,
    [CreateSourceFn.name]: true,
  }

  async checkCurrentUserListAdapters(): Promise<void> {
    this.checkPrivilege(ListAdaptersFn.name)
  }

  async checkCurrentUserCreateSource(): Promise<void> {
    this.checkPrivilege(CreateSourceFn.name)
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

class TestAdapterRegistry extends Map<string, ManifoldAdapter> implements ManifoldAdapterRegistry {

  async getAdapterForId(adapterId: string): Promise<ManifoldAdapter | null> {
    return this.get(adapterId) || null
  }
}
