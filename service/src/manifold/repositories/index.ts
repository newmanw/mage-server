
import { SourceDescriptor, SourceDescriptorModel, AdapterDescriptorModel, AdapterDescriptor, SourceDescriptorDocument, AdapterDescriptorDocument } from '../models'
import { BaseMongooseRepository } from '../../architecture/adapters/base.adapters.db.mongoose'


export type EntityReference = {
  id: any
}


export class AdapterRepository extends BaseMongooseRepository<AdapterDescriptorDocument, AdapterDescriptorModel, AdapterDescriptor> {

  constructor(model: AdapterDescriptorModel) {
    super(model)
  }
}


export class SourceRepository extends BaseMongooseRepository<SourceDescriptorDocument, SourceDescriptorModel, SourceDescriptor> {

  constructor(model: SourceDescriptorModel) {
    super(model)
  }
}
