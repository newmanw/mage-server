
import mongoose from 'mongoose'
import _ from 'lodash'
import { describe, it, before, beforeEach, after, afterEach } from 'mocha'
import { expect } from 'chai'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BaseMongooseRepository } from '../../../lib/adapters/base/adapters.base.db.mongoose'
import { FeedServiceRepository, FeedServiceTypeUnregistered, InvalidServiceConfigError, FeedServiceConnection, FeedServiceInfo, FeedTopic, FeedTopicId } from '../../../lib/entities/feeds/entities.feeds'
import { FeedServiceTypeIdentityModel, FeedsModels, FeedServiceTypeIdentitySchema, FeedServiceModel, FeedServiceSchema, MongooseFeedServiceTypeRepository, MongooseFeedServiceRepository, FeedServiceTypeIdentity, FeedServiceTypeIdentityDocument } from '../../../lib/adapters/feeds/adapters.feeds.db.mongoose'
import { FeedServiceType } from '../../../lib/entities/feeds/entities.feeds'
import { Json, JsonObject } from '../../../src/entities/entities.global.json'

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
          summary: null,
          constantParamsSchema: {},
          variableParamsSchema: {},
          itemsHaveIdentity: true,
          updateFrequency: { seconds: 60 * 60 * 2 }
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

    it('does what base repository can do', async function() {
      expect(repo).to.be.instanceOf(BaseMongooseRepository)
    })
  })
})
