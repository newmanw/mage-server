import mongoose from 'mongoose'
import { BaseMongooseRepository } from 'src/architecture/adapters/base.adapters.db.mongoose'
import { PluginDescriptor } from '../entities/plugins.entities'
import { PluginRepository } from '../application/plugins.app.contracts'


const PluginDescriptorSchema = new mongoose.Schema({
  version: { type: Number, required: false, default: 0 },
  title: { type: String, required: true },
  summary: { type: String, required: false, default: null },
  providesMigrations: { type: Boolean, required: false, default: false },
  enabled: { type: Boolean, required: false, default: false }
})

export type PluginDescriptorDocument = mongoose.Document & PluginDescriptor
export type PluginDescriptorModel = mongoose.Model<PluginDescriptorDocument>
export const MODEL_NAME = 'PluginDescriptor'
export const PluginDescriptorModel = mongoose.model<PluginDescriptorDocument>(MODEL_NAME, PluginDescriptorSchema)

export class MongoosePluginRepository extends BaseMongooseRepository<PluginDescriptorDocument, PluginDescriptorModel, PluginDescriptor> implements PluginRepository {
  constructor() {
    super(PluginDescriptorModel)
  }
}