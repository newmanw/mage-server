import { describe, it, beforeEach } from 'mocha'
import chai, { expect } from 'chai'
import asPromised from 'chai-as-promised'
import { Substitute as Sub, Arg } from '@fluffy-spoon/substitute'
import deepEqual from 'deep-equal'
import { AdapterDescriptor } from '../../src/manifold/entities/manifold.entities'
import { ListAdaptersFn } from '../../lib/manifold/application/manifold.app.fn'
import { AdapterRepository } from '../../src/manifold/application/manifold.app.contracts'
import { AdapterDescriptorSchema } from '../../src/manifold/adapters/manifold.adapters.db.mongoose'

chai.use(asPromised)

describe.only('manifold administration', function() {

  let app: TestApp

  beforeEach(function() {
    app = new TestApp()
  })

  it('lists registered adapter plugins', async function() {

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
})

class TestApp {

  readonly adapterRepo = new TestAdapterRepo()
  readonly listAdapters = ListAdaptersFn(this.adapterRepo)

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