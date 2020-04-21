
import mongoose, { Model, SchemaOptions } from 'mongoose'



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
      transform: (entity: AdapterDescriptorDocument, json: any & AdapterDescriptor, options: SchemaOptions) => {
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
      transform: (entity: SourceDescriptorDocument, json: any & SourceDescriptor, options: SchemaOptions) => {
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
