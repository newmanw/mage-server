import { AdapterDescriptor, SourceDescriptor } from '../entities/manifold.entities';
import { AdapterRepository, SourceRepository } from './manifold.app.contracts';

export interface ListAdaptersFn {
  (): Promise<AdapterDescriptor[]>
}
export function ListAdaptersFn(repo: AdapterRepository): ListAdaptersFn {
  return async function(): ReturnType<ListAdaptersFn> {
    return await repo.readAll()
  }
}

export interface CreateSourceFn {
  (sourceAttrs: Partial<SourceDescriptor>): Promise<SourceDescriptor>
}
export function CreateSourceFn(adapterRepo: AdapterRepository, sourceRepo: SourceRepository): CreateSourceFn {
  return async function createSource(sourceAttrs: Partial<SourceDescriptor>): ReturnType<CreateSourceFn> {
    return await sourceRepo.create(sourceAttrs)
  }
}