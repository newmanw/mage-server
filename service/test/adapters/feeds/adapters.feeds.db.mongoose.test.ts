
import mongoose from 'mongoose'
import _ from 'lodash'
import { describe, it, before, beforeEach, after, afterEach } from 'mocha'
import { expect } from 'chai'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BaseMongooseRepository } from '../../../lib/adapters/base/adapters.base.db.mongoose'
import { FeedServiceRepository, FeedServiceTypeUnregistered, InvalidServiceConfigError, FeedServiceConnection, FeedServiceInfo, FeedTopic } from '../../../lib/entities/feeds/entities.feeds'
import { FeedServiceTypeIdentityModel, FeedsModels, FeedServiceTypeIdentitySchema, FeedServiceModel, FeedServiceSchema, MongooseFeedServiceTypeRepository, MongooseFeedServiceRepository, FeedServiceTypeIdentity, FeedServiceTypeIdentityDocument } from '../../../lib/adapters/feeds/adapters.feeds.db.mongoose'
import { FeedServiceType } from '../../../lib/entities/feeds/entities.feeds'
import { Json } from '../../../src/entities/entities.global.json'

describe.only('feeds repositories', function() {

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

  describe.only('service type repository', function() {

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
      pluginServiceTypeId: 'volcano',
      title: 'Volcano Service Type',
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
          }
        }
      },
      moduleName: '@ngageoint/mage.feeds/wfs',
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

      const registered = await repo.register('@ngageoint/mage.feeds/wfs', serviceType)
      const read = await conn.db.collection(model.collection.name).find().toArray() as [FeedServiceTypeIdentityDocument]

      expect(registered.id).to.be.a('string')
      expect(read.length).to.equal(1)
      expect(read[0]).to.deep.include({
        id: registered.id,
        pluginServiceTypeId: serviceType.pluginServiceTypeId,
        moduleName: serviceType
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
      const fromDb = _.keyBy(await conn.collection(model.collection.name).find().toArray(), x => x.id)

      expect(Object.entries(fromRepo).length).to.equal(2)
      expect(fromRepo[serviceType.id as string]).to.deep.include(_.omit(serviceType, 'id'))
      expect(fromRepo[anotherServiceType.id as string]).to.deep.include(_.omit(anotherServiceType, 'id'))
      expect(fromDb).to.deep.include({
        [registered.id]: {
          _id: registered.id,
          moduleName: serviceType.moduleName,
          pluginServiceTypeId: serviceType.pluginServiceTypeId
        },
        [anotherRegistered.id]: {
          _id: anotherRegistered.id,
          moduleName: '@or/another_service_type',
          pluginServiceTypeId: anotherServiceType.pluginServiceTypeId
        }
      })
      expect(fromDb[registered.id].id).to.equal(registered.id)
      expect(fromDb[anotherRegistered.id].id).to.equal(anotherRegistered.id)
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
