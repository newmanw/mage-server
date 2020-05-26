
import mongoose, { Model, SchemaOptions } from 'mongoose'
import { BaseMongooseRepository } from '../base/adapters.base.db.mongoose'
import { FeedTopic, FeedService, FeedServiceType, FeedServiceDescriptor } from '../../entities/feeds/entities.feeds'
import { FeedServiceTypeRepository, FeedServiceRepository } from '../../entities/feeds/entities.feeds'



export const ManifoldModels = {
  AdapterDescriptor: 'AdapterDescriptor',
  SourceDescriptor: 'SourceDescriptor'
}

export const AdapterDescriptorSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    modulePath: { type: String, required: true }
  },
  {
    toJSON: {
      getters: true,
      transform: (entity: AdapterDescriptorDocument, json: any & FeedTopic, options: SchemaOptions): void => {
        delete json._id
        delete json.modulePath
      }
    }
  })

export const SourceDescriptorSchema = new mongoose.Schema(
  {
    adapter: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: ManifoldModels.AdapterDescriptor },
    title: { type: String, required: true },
    description: { type: String, required: false },
    url: { type: String, required: false },
    isReadable: { type: Boolean, required: false, default: true },
    isWritable: { type: Boolean, required: false, default: false },
  },
  {
    toJSON: {
      getters: true,
      transform: (doc: SourceDescriptorDocument, json: any & FeedService, options: SchemaOptions): void => {
        delete json._id
        if (!doc.populated('adapter') && doc.serviceType as any instanceof mongoose.Types.ObjectId) {
          json.feedType = json.feedType.toHexString()
        }
      }
    }
  })

export type AdapterDescriptorDocument = FeedServiceType & mongoose.Document
export type SourceDescriptorDocument = FeedServiceDescriptor & mongoose.Document
export type AdapterDescriptorModel = Model<AdapterDescriptorDocument>
export type SourceDescriptorModel = Model<SourceDescriptorDocument>

export class MongooseAdapterRepository extends BaseMongooseRepository<AdapterDescriptorDocument, AdapterDescriptorModel, FeedServiceType> implements FeedServiceTypeRepository {

  constructor(model: AdapterDescriptorModel) {
    super(model)
  }
}


export class MongooseSourceRepository extends BaseMongooseRepository<SourceDescriptorDocument, SourceDescriptorModel, FeedServiceDescriptor> implements FeedServiceRepository {

  constructor(model: SourceDescriptorModel) {
    super(model)
  }
}
