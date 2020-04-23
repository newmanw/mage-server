
import mongoose from 'mongoose'
import { describe, it, before, beforeEach, after, afterEach } from 'mocha'
import { expect } from 'chai'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BaseMongooseRepository } from '../../../lib/architecture/adapters/base.adapters.db.mongoose'
import { AdapterRepository, SourceRepository } from '../../../lib/manifold/application/manifold.app.contracts'
import { AdapterDescriptorModel, ManifoldModels, AdapterDescriptorSchema, SourceDescriptorModel, SourceDescriptorSchema, MongooseAdapterRepository, MongooseSourceRepository } from '../../../lib/manifold/adapters/manifold.adapters.db.mongoose'
import { AdapterDescriptor } from '../../../src/manifold/entities/manifold.entities'

describe('manifold repositories', function() {

  let mongo: MongoMemoryServer
  let uri: string
  let conn: mongoose.Connection

  before(async function() {
    mongo = new MongoMemoryServer()
    uri = await mongo.getUri()
  })

  beforeEach(async function() {
    conn = await mongoose.createConnection(uri, {
      useMongoClient: true,
      promiseLibrary: Promise
    })
  })

  afterEach(async function() {
    await conn.close()
  })

  after(async function() {
    await mongoose.disconnect()
    await mongo.stop()
  })


  describe('adapter repository', function() {

    const collection = 'adapters'
    let model: AdapterDescriptorModel
    let repo: MongooseAdapterRepository

    beforeEach(async function() {
      model = conn.model(ManifoldModels.AdapterDescriptor, AdapterDescriptorSchema, collection)
      repo = new MongooseAdapterRepository(model)
    })

    afterEach(async function() {
      await model.remove({})
    })

    it('does what base repository can do', function() {
      expect(repo).to.be.instanceOf(BaseMongooseRepository)
    })

    it('creates an adatper descriptor record', async function() {

      const seed: Partial<AdapterDescriptor> = {
        title: 'Xyz Adapter',
        summary: 'Adapting Xyz services',
        isReadable: true,
        isWritable: true,
      }
      const created = await repo.create({
        id: 'ignore',
        ...seed
      })
      const read = await conn.db.collection(model.collection.name).find().toArray()

      expect(created.id).to.not.be.empty
      expect(created.id).to.not.equal('ignore')
      expect(created).to.deep.include(seed)
      expect(read.length).to.equal(1)
      expect(read[0]).to.deep.include(seed)
    })

    it('reads all adapter descriptor records', async function() {

      const seed1: Partial<AdapterDescriptor> = {
        title: 'Abc Adapter',
        summary: 'Adapting Abc services',
        isReadable: true,
        isWritable: false,
      }
      const seed2: Partial<AdapterDescriptor> = {
        title: 'Xyz Adapter',
        summary: 'Adapting Xyz services',
        isReadable: true,
        isWritable: false,
      }
      await Promise.all([
        repo.create(seed1),
        repo.create(seed2)])
      const read = await repo.readAll()

      expect(read.length).to.equal(2)
      expect(read[0]).to.deep.include(seed1)
      expect(read[1]).to.deep.include(seed2)
    })

    it('updates an adapter descriptor record', async function() {

      const seed: Partial<AdapterDescriptor> = {
        title: 'Adapter 123',
        summary: 'Needs an update',
        isReadable: true,
        isWritable: true,
      }
      const existing = await repo.create(seed)
      const update = {
        id: existing.id,
        title: 'Updated Adapter 123',
        description: 'Not writable now',
        isWritable: false
      }
      const beforeUpdate = await repo.readAll()
      const updated = await repo.update(update)
      const afterUpdate = await repo.readAll()

      expect(updated).to.deep.include(update)
      expect(beforeUpdate.length).to.equal(1)
      expect(afterUpdate.length).to.equal(1)
      expect(beforeUpdate[0]).to.deep.include(seed)
      expect(afterUpdate[0]).to.deep.include(update)
      expect(beforeUpdate[0]).to.not.deep.include(update)
      expect(afterUpdate[0]).to.not.deep.include(seed)
    })

    it('deletes an adapter descriptor record', async function() {

      const seed: Partial<AdapterDescriptor> = {
        title: 'Doomed',
        summary: 'Marked for delete',
        isReadable: true,
        isWritable: false,
      }
      const created = await repo.create(seed)
      const beforeDelete = await repo.readAll()
      await repo.removeById(created.id)
      const afterDelete = await repo.readAll()

      expect(beforeDelete.length).to.equal(1)
      expect(beforeDelete[0]).to.deep.include(seed)
      expect(afterDelete.length).to.equal(0)
    })
  })

  describe('source repository', function() {

    const collection = 'test_source_descriptors'
    let model: SourceDescriptorModel
    let repo: SourceRepository

    beforeEach(function() {
      model = conn.model(ManifoldModels.SourceDescriptor, SourceDescriptorSchema, collection)
      repo = new MongooseSourceRepository(model)
    })

    it('does what base repository can do', async function() {
      expect(repo).to.be.instanceOf(BaseMongooseRepository)
    })
  })
})
