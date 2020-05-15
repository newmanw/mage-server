
import mongoose, { Model, SchemaOptions } from 'mongoose'
import { BaseMongooseRepository } from '../base/adapters.base.db.mongoose'
import { FeedType, Feed } from '../../entities/feeds/entities.feeds'
import { FeedTypeRepository, FeedRepository } from '../../app.impl/feeds/app.impl.feeds'



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
      transform: (entity: AdapterDescriptorDocument, json: any & FeedType, options: SchemaOptions): void => {
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
      transform: (doc: SourceDescriptorDocument, json: any & Feed, options: SchemaOptions): void => {
        delete json._id
        if (!doc.populated('adapter') && doc.feedType as any instanceof mongoose.Types.ObjectId) {
          json.feedType = json.feedType.toHexString()
        }
      }
    }
  })

export type AdapterDescriptorDocument = FeedType & mongoose.Document
export type SourceDescriptorDocument = Feed & mongoose.Document
export type AdapterDescriptorModel = Model<AdapterDescriptorDocument>
export type SourceDescriptorModel = Model<SourceDescriptorDocument>

export class MongooseAdapterRepository extends BaseMongooseRepository<AdapterDescriptorDocument, AdapterDescriptorModel, FeedType> implements FeedTypeRepository{

  constructor(model: AdapterDescriptorModel) {
    super(model)
  }
}


export class MongooseSourceRepository extends BaseMongooseRepository<SourceDescriptorDocument, SourceDescriptorModel, Feed> implements FeedRepository {

  constructor(model: SourceDescriptorModel) {
    super(model)
  }
}
