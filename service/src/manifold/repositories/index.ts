
import { SourceDescriptor, SourceDescriptorModel, AdapterDescriptorModel, AdapterDescriptor, SourceDescriptorEntity, AdapterDescriptorEntity } from '../models'
import mongoose from 'mongoose'


export type EntityReference = {
  id: any
}


export class AdapterRepository extends BaseRepository<AdapterDescriptorEntity, AdapterDescriptorModel, AdapterDescriptor> {

  constructor(model: AdapterDescriptorModel) {
    super(model)
  }
}


export class SourceRepository extends BaseRepository<SourceDescriptorEntity, SourceDescriptorModel, SourceDescriptor> {

  constructor(model: SourceDescriptorModel) {
    super(model)
  }
}
