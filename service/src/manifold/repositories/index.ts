
import { SourceDescriptor, SourceDescriptorModel, AdapterDescriptorModel, AdapterDescriptor, SourceDescriptorDocument, AdapterDescriptorDocument } from '../models'
import { BaseMongoRepository } from '../../architecture/adapters/base.adapters.db.mongoose'


export type EntityReference = {
  id: any
}


export class AdapterRepository extends BaseMongoRepository<AdapterDescriptorDocument, AdapterDescriptorModel, AdapterDescriptor> {

  constructor(model: AdapterDescriptorModel) {
    super(model)
  }
}


export class SourceRepository extends BaseMongoRepository<SourceDescriptorDocument, SourceDescriptorModel, SourceDescriptor> {

  constructor(model: SourceDescriptorModel) {
    super(model)
  }
}
