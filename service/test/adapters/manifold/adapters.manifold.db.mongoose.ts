
import mongoose from 'mongoose'
import { describe, it, before, beforeEach, after, afterEach } from 'mocha'
import { expect } from 'chai'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BaseMongooseRepository } from '../../../lib/adapters/base/adapters.base.db.mongoose'
import { FeedRepository } from '../../../lib/entities/feeds/entities.feeds'
import { AdapterDescriptorModel, ManifoldModels, AdapterDescriptorSchema, SourceDescriptorModel, SourceDescriptorSchema, MongooseAdapterRepository, MongooseSourceRepository } from '../../../lib/adapters/feeds/adapters.feeds.db.mongoose'
import { FeedServiceType } from '../../../lib/entities/feeds/entities.feeds'
import { FeedDescriptor } from '../../../src/app.api/feeds/app.api.feeds'

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

      const seed: Partial<FeedDescriptor> = {
        title: 'Xyz Adapter',
        summary: 'Adapting Xyz services',
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

      const seed1: Partial<FeedServiceType> = {
        title: 'Abc Adapter',
        description: 'Adapting Abc services',
      }
      const seed2: Partial<FeedServiceType> = {
        title: 'Xyz Adapter',
        description: 'Adapting Xyz services',
      }
      await Promise.all([
        repo.create(seed1),
        repo.create(seed2)])
      const read = await repo.findAll()

      expect(read.length).to.equal(2)
      expect(read[0]).to.deep.include(seed1)
      expect(read[1]).to.deep.include(seed2)
    })

    it('updates an adapter descriptor record', async function() {

      const seed: Partial<FeedServiceType> = {
        title: 'Adapter 123',
        description: 'Needs an update',
      }
      const existing = await repo.create(seed)
      const update = {
        id: existing.id,
        title: 'Updated Adapter 123',
        description: 'Not writable now',
        isWritable: false
      }
      const beforeUpdate = await repo.findAll()
      const updated = await repo.update(update)
      const afterUpdate = await repo.findAll()

      expect(updated).to.deep.include(update)
      expect(beforeUpdate.length).to.equal(1)
      expect(afterUpdate.length).to.equal(1)
      expect(beforeUpdate[0]).to.deep.include(seed)
      expect(afterUpdate[0]).to.deep.include(update)
      expect(beforeUpdate[0]).to.not.deep.include(update)
      expect(afterUpdate[0]).to.not.deep.include(seed)
    })

    it('deletes an adapter descriptor record', async function() {

      const seed: Partial<FeedServiceType> = {
        title: 'Doomed',
        description: 'Marked for delete',
      }
      const created = await repo.create(seed)
      const beforeDelete = await repo.findAll()
      await repo.removeById(created.id)
      const afterDelete = await repo.findAll()

      expect(beforeDelete.length).to.equal(1)
      expect(beforeDelete[0]).to.deep.include(seed)
      expect(afterDelete.length).to.equal(0)
    })
  })

  describe('source repository', function() {

    const collection = 'test_source_descriptors'
    let model: SourceDescriptorModel
    let repo: FeedRepository

    beforeEach(function() {
      model = conn.model(ManifoldModels.SourceDescriptor, SourceDescriptorSchema, collection)
      repo = new MongooseSourceRepository(model)
    })

    it('does what base repository can do', async function() {
      expect(repo).to.be.instanceOf(BaseMongooseRepository)
    })
  })
})
