import { Application } from 'express'
import mongoose from 'mongoose'
import { AdapterDescriptorModel, ManifoldModels, AdapterDescriptorSchema, SourceDescriptorModel, SourceDescriptorSchema, MongooseAdapterRepository, MongooseSourceRepository } from './adapters/manifold.adapters.db.mongoose'
import { createRouter } from './adapters/manifold.adapters.controllers.web'
import { ManifoldManager } from './entities/manifold.entities'


export default function initialize(app: Application, callback: (err?: Error | null) => void): void {
  const adapterDescriptorModel: AdapterDescriptorModel = mongoose.model(ManifoldModels.AdapterDescriptor, AdapterDescriptorSchema)
  const sourceDescriptorModel: SourceDescriptorModel = mongoose.model(ManifoldModels.SourceDescriptor, SourceDescriptorSchema)
  const adapterRepo = new MongooseAdapterRepository(adapterDescriptorModel)
  const sourceRepo = new MongooseSourceRepository(sourceDescriptorModel)
  const manager = new ManifoldManager()
  const injection = { adapterRepo, sourceRepo }
  // TODO: instead make plugins return a Router that the app can mount
  const router = createRouter(injection)
  app.use('/plugins/manifold', router)
  setImmediate(() => callback())
}