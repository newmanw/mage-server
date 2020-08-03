import { describe, it, before } from 'mocha'
import { expect } from 'chai'
import mongoose from 'mongoose'
import uniqid from 'uniqid'
import _ from 'lodash'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongooseMageEventRepository, MageEventModel } from '../../../lib/adapters/events/adapters.events.db.mongoose'
import * as legacy from '../../../lib/models/event'
import { MageEventDocument } from '../../../src/models/event'
import TeamModelModule = require('../../../lib/models/team')
import { Team } from '../../../lib/entities/teams/entities.teams'

const TeamModel = TeamModelModule.TeamModel

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
  let eventDoc: legacy.MageEventDocument

  beforeEach('initialize model', async function() {
    model = legacy.Model
    repo = new MongooseMageEventRepository(model)
    eventDoc = await new Promise<legacy.MageEventDocument>((resolve) => {
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
    eventDoc = await model.findById(eventDoc._id) as MageEventDocument
    expect(eventDoc._id).to.be.a('number')
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

      const fetched = await repo.findById(eventDoc._id)
      expect(fetched).to.deep.equal(eventDoc.toJSON())
    })
  })

  describe('adding feeds to events', function() {

    it('adds a feed id to when the feeds list does not exist', async function() {

      const repo = new MongooseMageEventRepository(model)
      const feedId = uniqid()
      const updated = await repo.addFeedsToEvent(eventDoc?._id, feedId)
      const fetched = await repo.findById(eventDoc?._id)

      expect(updated?.feedIds).to.deep.equal([ feedId ])
      expect(fetched).to.deep.equal(updated)
    })

    it('adds a feed id to a non-empty feeds list', async function() {

      const repo = new MongooseMageEventRepository(model)
      const feedIds = [ uniqid(), uniqid() ]
      let updated = await repo.addFeedsToEvent(eventDoc?._id, feedIds[0])
      let fetched = await repo.findById(eventDoc?._id)

      expect(updated?.feedIds).to.deep.equal([ feedIds[0] ])
      expect(fetched).to.deep.equal(updated)

      updated = await repo.addFeedsToEvent(eventDoc?._id, feedIds[1])
      fetched = await repo.findById(eventDoc?._id)

      expect(updated?.feedIds).to.deep.equal(feedIds)
      expect(fetched).to.deep.equal(updated)
    })

    it('adds multiple feed ids to the feeds list', async function() {

      const repo = new MongooseMageEventRepository(model)
      const feedIds = [ uniqid(), uniqid() ]
      let updated = await repo.addFeedsToEvent(eventDoc?._id, ...feedIds)
      let fetched = await repo.findById(eventDoc?._id)

      expect(updated?.feedIds).to.deep.equal(feedIds)
      expect(fetched).to.deep.equal(updated)
    })

    it('does not add duplicate feed ids', async function() {

      const repo = new MongooseMageEventRepository(model)
      const feedIds = [ uniqid(), uniqid() ]
      let updated = await repo.addFeedsToEvent(eventDoc?._id, ...feedIds)
      let fetched = await repo.findById(eventDoc?._id)

      expect(updated?.feedIds).to.deep.equal(feedIds)
      expect(fetched).to.deep.equal(updated)

      updated = await repo.addFeedsToEvent(eventDoc?._id, feedIds[0])
      fetched = await repo.findById(eventDoc?._id)

      expect(updated?.feedIds).to.deep.equal(feedIds)
      expect(fetched).to.deep.equal(updated)
    })
  })

  describe('getting teams in an event', function() {

    it('gets the teams', async function() {

      const user = mongoose.Types.ObjectId().toHexString()
      const teams: Partial<Team>[] = [
        {
          id: mongoose.Types.ObjectId().toHexString(),
          name: 'Team 1',
          acl: {
            [user]: {
              role: 'OWNER',
              permissions: [ 'read', 'update', 'delete' ]
            }
          },
          userIds: [ user, mongoose.Types.ObjectId().toHexString(), mongoose.Types.ObjectId().toHexString() ]
        },
        {
          id: mongoose.Types.ObjectId().toHexString(),
          name: 'Team 2',
          acl: {
            [user]: {
              role: 'GUEST',
              permissions: [ 'read' ]
            }
          },
          userIds: [ user, mongoose.Types.ObjectId().toHexString() ]
        }
      ]
      const teamDocs = await Promise.all(teams.map(async (x) => {
        return await TeamModel.create(Object.assign({ ...x },
          {
            _id: mongoose.Types.ObjectId(x.id),
            acl: _.mapValues(x.acl, x => x.role)
          }))
      }))
      eventDoc.teamIds = teamDocs.map(x => x._id)
      eventDoc = await eventDoc.save()
      const fetchedTeams = await repo.findTeamsInEvent(eventDoc.id)

      expect(fetchedTeams).to.deep.equal(teams)
    })

    it('returns null when the event does not exist', async function() {
      const oops = await repo.findTeamsInEvent(eventDoc.id - 1)
      expect(oops).to.be.null
    })
  })

  it('does not allow creating events', async function() {
    await expect(repo.create()).to.eventually.rejectWith(Error)
  })

  it('does not allow updating events', async function() {
    await expect(repo.update({ id: eventDoc._id, feedIds: [ 'not_allowed' ] })).to.eventually.rejectWith(Error)
  })
})