import { describe, it, before } from 'mocha'
import mongoose from 'mongoose'
import uniqid from 'uniqid'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongooseMageEventRepository, MageEventModel, MageEventModelName, MageEventSchema } from '../../../lib/adapters/events/adapters.events.db.mongoose'
import * as legacy from '../../../lib/models/event'

describe.only('event mongoose repository', function() {

  let mongo: MongoMemoryServer
  let uri: string
  let conn: mongoose.Connection

  before(async function() {
    mongo = new MongoMemoryServer()
    uri = await mongo.getUri()
  })

  beforeEach('initialize connection', async function() {
    conn = await mongoose.createConnection(uri, {
      useMongoClient: true,
      promiseLibrary: Promise
    })
  })

  const collection = 'test_events'
  let model: MageEventModel
  let repo: MongooseMageEventRepository
  let event: legacy.MageEventDocument

  beforeEach('initialize model', async function() {
    model = conn.model(MageEventModelName, MageEventSchema, collection)
    repo = new MongooseMageEventRepository(model)
    event = await new Promise<legacy.MageEventDocument>((resolve, reject) => {
      legacy.create(
        {
          name: 'Test Event',
          description: 'For testing'
        },
        { _id: mongoose.Types.ObjectId() },
        (err: any | null, event?: legacy.MageEventDocument) => {
          resolve(event!)
        })
    })
  })

  afterEach(async function() {
    await model.remove({})
    await conn.close()
  })

  after(async function() {
    await mongoose.disconnect()
    await mongo.stop()
  })

  it('adds a feed id to the feeds list', async function() {
    const repo = new MongooseMageEventRepository(model)
    const updated = await repo.addFeedToEvent(event?.id, uniqid())
  })
})