
import mongoose, { Model, SchemaOptions } from 'mongoose'
import { BaseMongooseRepository } from '../base/adapters.base.db.mongoose'
import { FeedServiceType, FeedService, FeedServiceTypeId, RegisteredFeedServiceType, FeedRepository, Feed, FeedId } from '../../entities/feeds/entities.feeds'
import { FeedServiceTypeRepository, FeedServiceRepository } from '../../entities/feeds/entities.feeds'
import { FeedServiceDescriptor } from '../../app.api/feeds/app.api.feeds'
import { EntityIdFactory } from '../../entities/entities.global'



export const FeedsModels = {
  FeedServiceTypeIdentity: 'FeedServiceTypeIdentity',
  FeedService: 'FeedService',
  Feed: 'Feed',
}

export type FeedServiceTypeIdentity = Pick<FeedServiceType, 'pluginServiceTypeId'> & {
  id: string
  moduleName: string
}
export type FeedServiceTypeIdentityDocument = FeedServiceTypeIdentity & mongoose.Document
export type FeedServiceTypeIdentityModel = Model<FeedServiceTypeIdentityDocument>
export const FeedServiceTypeIdentitySchema = new mongoose.Schema({
  pluginServiceTypeId: { type: String, required: true },
  moduleName: { type: String, required: true }
})
export function FeedServiceTypeIdentityModel(conn: mongoose.Connection): FeedServiceTypeIdentityModel {
  return conn.model(FeedsModels.FeedServiceTypeIdentity, FeedServiceTypeIdentitySchema, 'feed_service_types')
}

export type FeedServiceDocument = FeedServiceDescriptor & mongoose.Document
export type FeedServiceModel = Model<FeedServiceDocument>
export const FeedServiceSchema = new mongoose.Schema(
  {
    serviceType: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: FeedsModels.FeedServiceTypeIdentity },
    title: { type: String, required: true },
    summary: { type: String, required: false },
    config: { type: Object, required: false },
  },
  {
    toJSON: {
      getters: true,
      transform: (doc: FeedServiceDocument, json: any & FeedService, options: SchemaOptions): void => {
        delete json._id
      }
    }
  })
export function FeedServiceModel(conn: mongoose.Connection): FeedServiceModel {
  return conn.model(FeedsModels.FeedService, FeedServiceSchema, 'feed_services')
}

export type FeedDocument = Feed & mongoose.Document
export type FeedModel = Model<FeedDocument>
export const FeedSchema = new mongoose.Schema(
  {
    service: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: FeedsModels.FeedService },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, required: false },
    constantParams: { type: mongoose.Schema.Types.Mixed, required: false },
    variableParamsSchema: { type: mongoose.Schema.Types.Mixed, required: false },
    updateFrequency: { type: Number, require: false },
    itemsHaveIdentity: { type: Boolean, required: true },
    itemsHaveSpatialDimension: { type: Boolean, required: true },
    itemTemporalProperty: { type: String, required: false },
    itemPrimaryProperty: { type: String, required: false },
    itemSecondaryProperty: { type: String, required: false },
  },
  {
    toJSON: {
      getters: true,
      transform: (doc: FeedDocument, json: any & Feed, options: SchemaOptions): void => {
        delete json._id
      }
    }
  })
export function FeedModel(conn: mongoose.Connection): FeedModel {
  return conn.model(FeedsModels.Feed, FeedSchema, 'feeds')
}

export class MongooseFeedServiceTypeRepository implements FeedServiceTypeRepository {

  readonly registeredServiceTypes = new Map<string, RegisteredFeedServiceType>()

  constructor(readonly model: FeedServiceTypeIdentityModel) {}

  async register(moduleName: string, serviceType: FeedServiceType): Promise<RegisteredFeedServiceType> {
    let identity = await this.model.findOne({ moduleName, pluginServiceTypeId: serviceType.pluginServiceTypeId })
    if (!identity) {
      identity = await this.model.create({
        moduleName,
        pluginServiceTypeId: serviceType.pluginServiceTypeId
      })
    }
    let identified = this.registeredServiceTypes.get(identity.id)
    if (!identified) {
      identified = Object.create(serviceType, {
        id: {
          value: identity.id,
          writable: false
        }
      }) as RegisteredFeedServiceType
      this.registeredServiceTypes.set(identity.id, identified)
    }
    return identified
  }

  async findById(id: FeedServiceTypeId): Promise<FeedServiceType | null> {
    if (typeof id !== 'string') {
      return null
    }
    return this.registeredServiceTypes.get(id) || null
  }

  async findAll(): Promise<FeedServiceType[]> {
    return Array.from(this.registeredServiceTypes.values())
  }
}

export class MongooseFeedServiceRepository extends BaseMongooseRepository<FeedServiceDocument, FeedServiceModel, FeedService> implements FeedServiceRepository {
  constructor(model: FeedServiceModel) {
    super(model)
  }
}

export class MongooseFeedRepository extends BaseMongooseRepository<FeedDocument, FeedModel, Feed> implements FeedRepository {
  constructor(model: FeedModel, private readonly idFactory: EntityIdFactory) {
    super(model)
  }

  async create(attrs: Partial<Feed>): Promise<Feed> {
    const id = await this.idFactory.nextId()
    const seed = Object.assign(attrs, { id })
    return await super.create(seed)
  }

  async findFeedsByIds(...feedIds: FeedId[]): Promise<Feed[]> {
    throw new Error('id')
  }
}
