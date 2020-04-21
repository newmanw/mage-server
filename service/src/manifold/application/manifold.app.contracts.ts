import { AdapterDescriptor, SourceDescriptor } from "../entities/manifold.entities";

export interface AdapterRepository {
  readAll(): Promise<AdapterDescriptor[]>
}

export interface SourceRepository {
  readAll(): Promise<SourceDescriptor[]>
  findById(sourceId: string): Promise<SourceDescriptor | null>
}
