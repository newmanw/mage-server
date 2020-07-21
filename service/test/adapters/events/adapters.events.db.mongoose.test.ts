import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import mongoose from 'mongoose'
import uniqid from 'uniqid'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongooseMageEventRepository, MageEventModel } from '../../../lib/adapters/events/adapters.events.db.mongoose'
import * as legacy from '../../../lib/models/event'
import { MageEventDocument } from '../../../src/models/event'

describe('event mongoose repository', function() {

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

  let model: MageEventModel
  let repo: MongooseMageEventRepository
  let event: legacy.MageEventDocument

  beforeEach('initialize model', async function() {
    model = legacy.Model
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
    // fetch again, because the create method does return the event with the
    // implicitly created team id in the teamIds list
    // TODO: fix the above
    event = await model.findById(event._id) as MageEventDocument
    expect(event._id).to.be.a('number')
  })

  afterEach(async function() {
    await model.remove({})
    await conn.close()
  })

  after(async function() {
    await mongoose.disconnect()
    await mongo.stop()
  })

  describe('fetching events by id', function() {

    it('looks up a feed by id', async function() {

      const fetched = await repo.findById(event._id)
      expect(fetched).to.deep.equal(event.toJSON())
    })
  })

  describe('adding feeds to events', function() {

    it('adds a feed id to when the feeds list does not exist', async function() {

      const repo = new MongooseMageEventRepository(model)
      const feedId = uniqid()
      const updated = await repo.addFeedsToEvent(event?._id, feedId)
      const fetched = await repo.findById(event?._id)

      expect(updated?.feedIds).to.deep.equal([ feedId ])
      expect(fetched).to.deep.equal(updated)
    })

    it('adds a feed id to a non-empty feeds list', async function() {

      const repo = new MongooseMageEventRepository(model)
      const feedIds = [ uniqid(), uniqid() ]
      let updated = await repo.addFeedsToEvent(event?._id, feedIds[0])
      let fetched = await repo.findById(event?._id)

      expect(updated?.feedIds).to.deep.equal([ feedIds[0] ])
      expect(fetched).to.deep.equal(updated)

      updated = await repo.addFeedsToEvent(event?._id, feedIds[1])
      fetched = await repo.findById(event?._id)

      expect(updated?.feedIds).to.deep.equal(feedIds)
      expect(fetched).to.deep.equal(updated)
    })

    it('adds multiple feed ids to the feeds list', async function() {

      const repo = new MongooseMageEventRepository(model)
      const feedIds = [ uniqid(), uniqid() ]
      let updated = await repo.addFeedsToEvent(event?._id, ...feedIds)
      let fetched = await repo.findById(event?._id)

      expect(updated?.feedIds).to.deep.equal(feedIds)
      expect(fetched).to.deep.equal(updated)
    })

    it('does not add duplicate feed ids', async function() {

      const repo = new MongooseMageEventRepository(model)
      const feedIds = [ uniqid(), uniqid() ]
      let updated = await repo.addFeedsToEvent(event?._id, ...feedIds)
      let fetched = await repo.findById(event?._id)

      expect(updated?.feedIds).to.deep.equal(feedIds)
      expect(fetched).to.deep.equal(updated)

      updated = await repo.addFeedsToEvent(event?._id, feedIds[0])
      fetched = await repo.findById(event?._id)

      expect(updated?.feedIds).to.deep.equal(feedIds)
      expect(fetched).to.deep.equal(updated)
    })
  })


  it('does not allow creating events', async function() {
    await expect(repo.create()).to.eventually.rejectWith(Error)
  })

  it('does not allow updating events', async function() {
    await expect(repo.update({ id: event._id, feedIds: [ 'not_allowed' ] })).to.eventually.rejectWith(Error)
  })
})