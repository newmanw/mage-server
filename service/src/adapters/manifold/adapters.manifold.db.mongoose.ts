
import mongoose, { Model, SchemaOptions } from 'mongoose'
import { BaseMongooseRepository } from '../base/adapters.base.db.mongoose'
import { AdapterDescriptor, SourceDescriptor } from '../../entities/feeds/entities.feeds'
import { RegisteredFeedTypeRepository, SourceRepository } from '../../application/manifold/app.manifold.use_cases'



export const ManifoldModels = {
  AdapterDescriptor: 'AdapterDescriptor',
  SourceDescriptor: 'SourceDescriptor'
}

export const AdapterDescriptorSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    isReadable: { type: Boolean, required: false, default: true },
    isWritable: { type: Boolean, required: false, default: false },
    modulePath: { type: String, required: true }
  },
  {
    toJSON: {
      getters: true,
      transform: (entity: AdapterDescriptorDocument, json: any & AdapterDescriptor, options: SchemaOptions): void => {
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
      transform: (entity: SourceDescriptorDocument, json: any & SourceDescriptor, options: SchemaOptions): void => {
        delete json._id
        if (!entity.populated('adapter') && entity.adapter instanceof mongoose.Types.ObjectId) {
          json.adapter = json.adapter.toHexString()
        }
      }
    }
  })

export type AdapterDescriptorDocument = AdapterDescriptor & mongoose.Document
export type SourceDescriptorDocument = SourceDescriptor & mongoose.Document
export type AdapterDescriptorModel = Model<AdapterDescriptorDocument>
export type SourceDescriptorModel = Model<SourceDescriptorDocument>

export class MongooseAdapterRepository extends BaseMongooseRepository<AdapterDescriptorDocument, AdapterDescriptorModel, AdapterDescriptor> implements RegisteredFeedTypeRepository{

  constructor(model: AdapterDescriptorModel) {
    super(model)
  }
}


export class MongooseSourceRepository extends BaseMongooseRepository<SourceDescriptorDocument, SourceDescriptorModel, SourceDescriptor> implements SourceRepository {

  constructor(model: SourceDescriptorModel) {
    super(model)
  }
}
