import { describe, it, beforeEach } from 'mocha'
import chai, { expect } from 'chai'
import asPromised from 'chai-as-promised'
import { AdapterDescriptor, SourceDescriptor } from '../../lib/manifold/entities/manifold.entities'
import { ListAdaptersFn, CreateSourceFn } from '../../lib/manifold/application/manifold.app.fn'
import { AdapterRepository, SourceRepository, ManifoldAuthorizationService } from '../../lib/manifold/application/manifold.app.contracts'
import { MageErrorCode, MageError } from '../../lib/application/app.global.errors'

chai.use(asPromised)

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

      app.regiserAdapters(...someAdapters)
      const read = await app.listAdapters()
      expect(read).to.have.deep.members(someAdapters)
    })

    it('checks permission for listing adapters', async function() {

      app.denyAllPrivileges()
      await expect(app.listAdapters()).to.eventually.be.rejectedWith(MageErrorCode.PermissionDenied)
    })
  })

  describe('creating a source', function() {

    it('provides the source stub from the adapter', async function() {


    })

    it('saves a source descriptor', async function() {

      const sourceAttrs: Partial<SourceDescriptor> = {
        adapter: someAdapters[0].id,
        title: 'Slurm',
        summary: 'Bur wen',
        url: 'https://slurm.io/api'
      }
      app.regiserAdapters(...someAdapters)

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

      await expect(app.createSource(sourceAttrs)).to.eventually.be.rejectedWith(MageErrorCode.PermissionDenied)
    })

    it('validates the source has a valid adapter', async function() {

      const sourceAttrs: Partial<SourceDescriptor> = {
        title: 'Boor Lum',
        summary: 'Lem do sot',
        url: 'socket://boor-lum.ner'
      }

      await expect(app.createSource(sourceAttrs), 'without adapter id')
        .to.eventually.be.rejectedWith(MageErrorCode.InvalidInput)

      sourceAttrs.adapter = someAdapters[0].id + '.invalid'

      await expect(app.createSource(sourceAttrs), 'with invalid adapter id')
        .to.eventually.be.rejectedWith(MageErrorCode.InvalidInput)
    })
  })

  describe('previewing source data', function() {

    it('can preview source data', async function() {
      expect.fail('todo')
    })
  })
})

class TestApp {

  readonly adapterRepo = new TestAdapterRepo()
  readonly sourceRepo = new TestSourceRepo()
  readonly authzService = new TestAuthzService()
  readonly listAdapters = ListAdaptersFn(this.adapterRepo, this.authzService)
  readonly createSource = CreateSourceFn(this.adapterRepo, this.sourceRepo, this.authzService)

  regiserAdapters(... adapters: AdapterDescriptor[]): void {
    for (const desc of adapters) {
      this.adapterRepo.db.set(desc.id, desc)
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
    throw new Error('Method not implemented.')
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
