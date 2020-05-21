import mongoose from 'mongoose'
import { describe, it, before, beforeEach, after, afterEach } from 'mocha'
import { expect } from 'chai'
import { mongoTestAfterAllHook, mongoTestBeforeAllHook, MongoTestContext } from '../../mongo.test'
import { BaseMongooseRepository } from '../../../lib/adapters/base/adapters.base.db.mongoose'


describe('base mongoose repository', async function() {

  interface BaseEntity {
    id: string
    derp: string
    lerp?: string
    squee?: boolean
    noo?: Number
  }
  type BaseDocument = BaseEntity & mongoose.Document
  type BaseModel = mongoose.Model<BaseDocument>

  const collection = 'base'
  const schema = new mongoose.Schema({
    derp: { type: String, required: true },
    lerp: { type: String, required: false },
    squee: { type: Boolean, required: false, default: false },
    noo: { type: Number, required: false, default: -1 },
  }, {
    toJSON: {
      getters: true
    }
  })
  let mongo: MongoTestContext
  let model: mongoose.Model<BaseDocument>
  let repo: BaseMongooseRepository<BaseDocument, BaseModel, BaseEntity>

  before(mongoTestBeforeAllHook())

  before('create model', function() {
    mongo = this.mongo
    model = mongo.conn.model('Base', schema, collection)
    repo = new BaseMongooseRepository(model)
  })

  afterEach('clear db', async function() {
    await model.remove({})
  })

  after(mongoTestAfterAllHook())

  it('creates a record', async function() {

    const seed: Partial<BaseEntity> = {
      derp: 'sloo',
      lerp: 'noich',
      squee: true,
      noo: 37
    }
    const created = await repo.create({
      id: 'ignore',
      ...seed
    })
    const read = await mongo.conn.db.collection(model.collection.name).find().toArray()

    expect(created.id).to.not.be.empty
    expect(created.id).to.not.equal('ignore')
    expect(created).to.deep.include(seed)
    expect(read.length).to.equal(1)
    expect(read[0]).to.deep.include(seed)
  })

  it('reads all records', async function() {

    const seed1: Partial<BaseEntity> = {
      derp: 'bam',
      lerp: 'plop',
      squee: true,
      noo: 11
    }
    const seed2: Partial<BaseEntity> = {
      derp: 'sloo',
      lerp: 'tum',
      squee: false,
      noo: 22
    }
    await Promise.all([
      repo.create(seed1),
      repo.create(seed2)
    ])
    const all = await repo.findAll()

    expect(all.length).to.equal(2)
    expect(all[0]).to.deep.include(seed1)
    expect(all[1]).to.deep.include(seed2)
  })

  it('finds a record by id', async function() {

    const seed1: Partial<BaseEntity> = {
      derp: 'bam',
      lerp: 'plop',
      squee: true,
      noo: 11
    }
    const seed2: Partial<BaseEntity> = {
      derp: 'sloo',
      lerp: 'tum',
      squee: false,
      noo: 22
    }
    const created = await Promise.all([
      repo.create(seed1),
      repo.create(seed2)
    ])
    const found = (await repo.findById(created[1].id))!

    expect(created.length).to.equal(2)
    expect(found).to.deep.include(seed2)
    expect(found.id).to.equal(created[1].id)
    expect(found.id).to.not.equal(created[0].id)
  })

  it('updates a record', async function() {

    const seed: Partial<BaseEntity> = {
      derp: 'spor',
      lerp: 'jeb',
      squee: true,
      noo: 39
    }
    const existing = await repo.create(seed)
    const update = {
      id: existing.id,
      derp: 'sped',
      lerp: 'jebler',
      noo: 42
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

  it('deletes a record', async function() {

    const seed: Partial<BaseEntity> = {
      derp: 'spor',
      lerp: 'jeb',
      squee: true,
      noo: 39
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