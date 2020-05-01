import { describe, it, beforeEach } from 'mocha'
import chai, { expect } from 'chai'
import asPromised from 'chai-as-promised'
import { Substitute as Sub, Arg } from '@fluffy-spoon/substitute'
import deepEqual from 'deep-equal'
import { AdapterDescriptor, SourceDescriptor } from '../../src/manifold/entities/manifold.entities'
import { ListAdaptersFn, CreateSourceFn } from '../../lib/manifold/application/manifold.app.fn'
import { AdapterRepository, SourceRepository } from '../../src/manifold/application/manifold.app.contracts'
import { AdapterDescriptorSchema } from '../../src/manifold/adapters/manifold.adapters.db.mongoose'

chai.use(asPromised)

describe.only('manifold administration', function() {

  let app: TestApp

  beforeEach(function() {
    app = new TestApp()
  })

  it('fetches the manifold descriptor with all sources and adapters', async function() {

    const adapters: AdapterDescriptor[] = [
      {
        id: 'adapter1',
        title: 'Adapter 1',
        summary: null,
        isReadable: true,
        isWritable: false,
      },
      {
        id: 'adapter2',
        title: 'Adapter 2',
        summary: null,
        isReadable: true,
        isWritable: false,
      }
    ]
    app.regiserAdapters(...adapters)

    const read = await app.listAdapters()

    expect(read).to.have.deep.members(adapters)
  })

  it('creates a source', async function() {

    const adapter: AdapterDescriptor = {
      id: 'a1',
      title: 'Hupna',
      summary: null,
      isReadable: true,
      isWritable: false
    }
    const sourceAttrs: Partial<SourceDescriptor> = {
      adapter: 'a1',
      title: 'Slurm',
      summary: 'Bur wen',
      url: 'https://slurm.io/api'
    }
    app.regiserAdapters(adapter)

    const created = await app.createSource(sourceAttrs)
    const inDb = app.sourceRepo.db.get(created.id)

    expect(created).to.deep.include({
      ...sourceAttrs
    })
    expect(created.id).to.exist
    expect(created).to.deep.equal(inDb)
  })

  it('can preview source data', async function() {
    expect.fail('todo')
  })
})

class TestApp {

  readonly adapterRepo = new TestAdapterRepo()
  readonly sourceRepo = new TestSourceRepo()
  readonly listAdapters = ListAdaptersFn(this.adapterRepo)
  readonly createSource = CreateSourceFn(this.adapterRepo, this.sourceRepo)

  regiserAdapters(... adapters: AdapterDescriptor[]): void {
    for (const desc of adapters) {
      this.adapterRepo.db.set(desc.id, desc)
    }
  }
}

class TestAdapterRepo implements AdapterRepository {

  readonly db = new Map<string, AdapterDescriptor>()

  async readAll(): Promise<AdapterDescriptor[]> {
    return Array.from(this.db.values())
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
