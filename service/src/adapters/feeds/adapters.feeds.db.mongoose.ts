
import mongoose, { Model, SchemaOptions } from 'mongoose'
import { BaseMongooseRepository } from '../base/adapters.base.db.mongoose'
import { FeedServiceType, FeedService, FeedServiceTypeId } from '../../entities/feeds/entities.feeds'
import { FeedServiceTypeRepository, FeedServiceRepository } from '../../entities/feeds/entities.feeds'
import { FeedServiceDescriptor } from '../../app.api/feeds/app.api.feeds'



export const FeedsModels = {
  FeedServiceTypeIdentity: 'FeedServiceTypeIdentity',
  FeedService: 'FeedService'
}

export type FeedServiceTypeIdentity = Pick<FeedServiceType, 'pluginServiceTypeId'> & {
  id: string
  moduleName: string
}
export const FeedServiceTypeIdentitySchema = new mongoose.Schema({
  pluginServiceTypeId: { type: String, required: true },
  moduleName: { type: String, required: true }
})
export type FeedServiceTypeIdentityDocument = FeedServiceType & mongoose.Document
export type FeedServiceTypeIdentityModel = Model<FeedServiceTypeIdentityDocument>
export function FeedServiceTypeIdentityModel(conn: mongoose.Connection): FeedServiceTypeIdentityModel {
  return conn.model(FeedsModels.FeedServiceTypeIdentity, FeedServiceTypeIdentitySchema, 'feed_service_types')
}

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
export type FeedServiceDocument = FeedServiceDescriptor & mongoose.Document
export type FeedServiceModel = Model<FeedServiceDocument>

export class MongooseFeedServiceTypeRepository implements FeedServiceTypeRepository {

  readonly registeredServiceTypes = new Map<string, FeedServiceType>()

  constructor(readonly model: FeedServiceTypeIdentityModel) {}

  async register(moduleName: string, serviceType: FeedServiceType): Promise<FeedServiceType> {
    let identity = await this.model.findOne({ moduleName, pluginServiceTypeId: serviceType.pluginServiceTypeId })
    if (!identity) {
      identity = await this.model.create({
        moduleName,
        pluginServiceTypeId: serviceType.pluginServiceTypeId
      })
    }
    const identified = Object.create(serviceType, {
      id: {
        value: identity.id,
        writable: false
      }
    }) as FeedServiceType
    this.registeredServiceTypes.set(identity.id, identified)
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
