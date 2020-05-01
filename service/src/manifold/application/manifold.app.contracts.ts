import { AdapterDescriptor, SourceDescriptor } from "../entities/manifold.entities";

export interface AdapterRepository {
  readAll(): Promise<AdapterDescriptor[]>
  update(attrs: Partial<AdapterDescriptor> & { id: string }): Promise<AdapterDescriptor>
  removeById(adapterId: string): Promise<void>
}

export interface SourceRepository {
  create(sourceAttrs: Partial<SourceDescriptor>): Promise<SourceDescriptor>
  readAll(): Promise<SourceDescriptor[]>
  findById(sourceId: string): Promise<SourceDescriptor | null>
}
