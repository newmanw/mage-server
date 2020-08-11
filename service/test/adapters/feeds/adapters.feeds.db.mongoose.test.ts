
import mongoose from 'mongoose'
import _ from 'lodash'
import uniqid from 'uniqid'
import { describe, it, before, beforeEach, after, afterEach } from 'mocha'
import { expect } from 'chai'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Substitute as Sub, SubstituteOf } from '@fluffy-spoon/substitute'
import { BaseMongooseRepository } from '../../../lib/adapters/base/adapters.base.db.mongoose'
import { FeedServiceRepository, FeedServiceTypeUnregistered, InvalidServiceConfigError, FeedServiceConnection, FeedServiceInfo, FeedTopic, FeedTopicId, FeedRepository, Feed, FeedServiceCreateAttrs, FeedCreateAttrs } from '../../../lib/entities/feeds/entities.feeds'
import { FeedServiceTypeIdentityModel, FeedsModels, FeedServiceTypeIdentitySchema, FeedServiceModel, FeedServiceSchema, MongooseFeedServiceTypeRepository, MongooseFeedServiceRepository, FeedServiceTypeIdentity, FeedServiceTypeIdentityDocument, FeedModel, FeedSchema, MongooseFeedRepository, FeedServiceDocument, FeedDocument } from '../../../lib/adapters/feeds/adapters.feeds.db.mongoose'
import { FeedServiceType } from '../../../lib/entities/feeds/entities.feeds'
import { Json, JsonObject } from '../../../src/entities/entities.json_types'
import { EntityIdFactory } from '../../../lib/entities/entities.global'

describe('feeds repositories', function() {

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

  describe('service type repository', function() {

    const collection = 'feed_service_types'
    let model: FeedServiceTypeIdentityModel
    let repo: MongooseFeedServiceTypeRepository

    beforeEach(async function() {
      model = conn.model(FeedsModels.FeedServiceTypeIdentity, FeedServiceTypeIdentitySchema, collection)
      repo = new MongooseFeedServiceTypeRepository(model)
    })

    afterEach(async function() {
      await model.remove({})
    })

    const serviceType: FeedServiceType & {
      topics: FeedTopic[],
      serviceInfo: FeedServiceInfo,
      moduleName: string
    } =
    {
      id: FeedServiceTypeUnregistered,
      pluginServiceTypeId: 'volcanoes',
      title: 'Volcanoes Service Type',
      summary: null,
      configSchema: null,
      async validateServiceConfig(config: Json): Promise<null | InvalidServiceConfigError> {
        return null
      },
      createConnection(config: Json): FeedServiceConnection {
        const topics = this.topics
        const serviceInfo = this.serviceInfo
        return {
          async fetchServiceInfo(): Promise<FeedServiceInfo> {
            return serviceInfo
          },
          async fetchAvailableTopics(): Promise<FeedTopic[]> {
            return topics
          },
          async fetchTopicContent(topic: FeedTopicId, params: JsonObject) {
            throw new Error('unimplemented')
          }
        }
      },
      moduleName: '@ngageoint/mage.feeds/volcanoes',
      serviceInfo: {
        title: 'Volcano Hot Spots',
        summary: 'Provide updates on volcano hot spot activity'
      },
      topics: [
        {
          id: 'volcanoes',
          title: 'Volcano Activity',
          paramsSchema: {},
          itemsHaveIdentity: true,
          updateFrequencySeconds: 60 * 60 * 2
        }
      ]
    }

    it('assigns a persistent id to a plugin feed service type', async function() {

      const registered = await repo.register(serviceType.moduleName, serviceType)
      const read = await model.find()

      expect(registered.id).to.be.a('string')
      expect(read.length).to.equal(1)
      expect(read[0]).to.deep.include({
        _id: mongoose.Types.ObjectId(registered.id),
        id: registered.id,
        pluginServiceTypeId: serviceType.pluginServiceTypeId,
        moduleName: serviceType.moduleName
      })
    })

    it('finds all service types', async function() {

      const anotherServiceType: FeedServiceType = {
        id: FeedServiceTypeUnregistered,
        pluginServiceTypeId: 'another_service_type',
        title: 'Another Service Type',
        summary: 'Gotta test multiple service types',
        configSchema: null,
        createConnection() {
          throw new Error('never')
        },
        validateServiceConfig(config: Json) {
          throw new Error('never')
        }
      }
      const registered = await repo.register(serviceType.moduleName, serviceType)
      const anotherRegistered = await repo.register('@org/another_service_type', anotherServiceType)
      const fromRepo = _.keyBy(await repo.findAll(), x => x.id)
      const fromDb = _.keyBy(await model.find(), x => x.id)

      expect(Object.entries(fromRepo).length).to.equal(2)
      expect(fromRepo[registered.id]).to.deep.include(_.omit(serviceType, 'id'))
      expect(fromRepo[anotherRegistered.id]).to.deep.include(_.omit(anotherServiceType, 'id'))
      expect(fromDb[registered.id]).to.deep.include({
        id: registered.id,
        moduleName: serviceType.moduleName,
        pluginServiceTypeId: serviceType.pluginServiceTypeId
      })
      expect(fromDb[anotherRegistered.id]).to.deep.include({
        id: anotherRegistered.id,
        moduleName: '@org/another_service_type',
        pluginServiceTypeId: anotherServiceType.pluginServiceTypeId
      })
    })

    it('retains rich behaviors of persisted service types', async function() {

      const registered = await repo.register(serviceType.moduleName, serviceType)
      const found = await repo.findById(registered.id)
      const conn = found?.createConnection(null)
      const info = await conn?.fetchServiceInfo()
      const topics = await conn?.fetchAvailableTopics()

      expect(info).to.deep.equal(serviceType.serviceInfo)
      expect(topics).to.deep.equal(serviceType.topics)
    })

    it('registers service types idempotently', async function() {

      const first = await repo.register(serviceType.moduleName, serviceType)
      const second = await repo.register(serviceType.moduleName, serviceType)

      expect(second).to.equal(first)
    })

    it('assigns persistent ids consistently across restarts', async function() {

      const previouslyRegisteredIdentity = await model.create({
        moduleName: serviceType.moduleName,
        pluginServiceTypeId: serviceType.pluginServiceTypeId
      })

      const notYetRegistered = await repo.findById(previouslyRegisteredIdentity.id)

      expect(notYetRegistered).to.be.null

      const registered = await repo.register(serviceType.moduleName, serviceType)
      const found = await repo.findById(previouslyRegisteredIdentity.id)

      expect(registered.id).to.equal(previouslyRegisteredIdentity.id)
      expect(found).to.equal(registered)
    })
  })


  describe('feed service repository', function() {

    const collection = 'test_feed_services'
    let model: FeedServiceModel
    let repo: FeedServiceRepository

    beforeEach(function() {
      model = conn.model(FeedsModels.FeedService, FeedServiceSchema, collection)
      repo = new MongooseFeedServiceRepository(model)
    })

    afterEach(async function() {
      await model.remove({})
    })

    it('does what base repository can do', async function() {
      expect(repo).to.be.instanceOf(BaseMongooseRepository)
    })

    it('returns service type id as string', async function() {
      const stub: FeedServiceCreateAttrs = {
        serviceType: mongoose.Types.ObjectId().toHexString(),
        title: 'No Object IDs',
        summary: 'Testing',
        config: { url: 'https://some.api.com' }
      }
      const created = await repo.create(stub)
      const fetched = await repo.findById(created.id)
      const rawFetched = await model.findOne({ _id: created.id }) as FeedServiceDocument

      expect(rawFetched.serviceType).to.be.instanceOf(mongoose.Types.ObjectId)
      expect(created.serviceType).to.be.a('string')
      expect(fetched?.serviceType).to.be.a('string')
      expect(created.serviceType).to.equal(rawFetched.serviceType.toHexString())
      expect(fetched?.serviceType).to.equal(created.serviceType)
    })

    it('omits version key from json', async function() {

      const stub: FeedServiceCreateAttrs = {
        serviceType: mongoose.Types.ObjectId().toHexString(),
        title: 'No Version Keys',
        summary: 'Testing',
        config: { url: 'https://some.api.com' }
      }
      const created = await repo.create(stub)
      const fetched = await repo.findById(created.id)
      const rawFetched = await model.findOne({ _id: created.id }) as FeedServiceDocument

      expect(created).to.not.have.property('__v')
      expect(fetched).to.not.have.property('__v')
      expect(rawFetched).to.have.property('__v')
    })
  })

  describe('feed repository', function() {

    const collection = 'test_feeds'
    let model: FeedModel
    let repo: FeedRepository
    let idFactory: SubstituteOf<EntityIdFactory>

    beforeEach(function() {
      model = conn.model(FeedsModels.Feed, FeedSchema, collection)
      idFactory = Sub.for<EntityIdFactory>()
      repo = new MongooseFeedRepository(model, idFactory)
    })

    afterEach(async function() {
      await model.remove({})
    })

    describe('creating a feed', function() {

      it('saves the feed', async function() {

        const nextId = `feed:test:${Date.now()}`
        idFactory.nextId().resolves(nextId)
        const createAttrs = Object.freeze({
          id: 'not this one',
          service: mongoose.Types.ObjectId().toHexString(),
          topic: uniqid(),
          title: uniqid(),
          itemsHaveIdentity: true,
          itemsHaveSpatialDimension: true,
          updateFrequencySeconds: 60
        })
        const expectedFeed: Omit<Feed, 'id'> = _.omit(createAttrs, 'id')
        const created = await repo.create({ ...createAttrs })
        const fetched = await model.findById(nextId)

        expect(created.id).to.equal(nextId)
        expect(fetched).to.not.be.null
        expect(created).to.deep.include(Object.assign({ ...expectedFeed }, { id: nextId }))
        expect(created).to.deep.equal(fetched?.toJSON())
        idFactory.received(1).nextId()
      })
    })

    describe('finding feeds for ids', function() {

      it('returns all the feeds for the given ids', async function() {

        const feeds: Feed[] = []
        idFactory.nextId().resolves('0', '1', '2')
        feeds.push(await repo.create({
          service: mongoose.Types.ObjectId().toHexString(),
          topic: 'topic0',
          title: 'Feed 0',
          itemsHaveIdentity: true,
          itemsHaveSpatialDimension: true,
        }))
        feeds.push(await repo.create({
          service: mongoose.Types.ObjectId().toHexString(),
          topic: 'topic1',
          title: 'Feed 1',
          itemsHaveIdentity: true,
          itemsHaveSpatialDimension: true,
        }))
        feeds.push(await repo.create({
          service: mongoose.Types.ObjectId().toHexString(),
          topic: 'topic2',
          title: 'Feed 2',
          itemsHaveIdentity: true,
          itemsHaveSpatialDimension: true,
        }))
        const fetched = await repo.findFeedsByIds('0', '2')

        expect(fetched).to.have.length(2)
        expect(fetched).to.include.deep.members([ feeds[0], feeds[2] ])
      })
    })

    it('returns feed with object ids as strings', async function() {

      const stub: FeedCreateAttrs = {
        service: mongoose.Types.ObjectId().toHexString(),
        topic: uniqid(),
        title: 'No Object IDs',
        summary: 'Testing',
        itemsHaveIdentity: true,
        itemsHaveSpatialDimension: true
      }
      const created = await repo.create(stub)
      const fetched = await repo.findById(created.id)
      const rawFetched = await model.findOne({ _id: created.id }) as FeedDocument

      expect(rawFetched.service).to.be.instanceOf(mongoose.Types.ObjectId)
      expect(created.service).to.be.a('string')
      expect(fetched?.service).to.be.a('string')
      expect(created.service).to.equal(rawFetched.service.toHexString())
      expect(fetched?.service).to.equal(created.service)
    })

    it('omits version key from json', async function() {

      const stub: FeedCreateAttrs = {
        service: mongoose.Types.ObjectId().toHexString(),
        topic: uniqid(),
        title: 'No Version Keys',
        summary: 'Testing',
        itemsHaveIdentity: true,
        itemsHaveSpatialDimension: true
      }
      const created = await repo.create(stub)
      const fetched = await repo.findById(created.id)
      const rawFetched = await model.findOne({ _id: created.id }) as FeedDocument

      expect(created).to.not.have.property('__v')
      expect(fetched).to.not.have.property('__v')
      expect(rawFetched).to.have.property('__v')
    })
  })
})