import { AdapterDescriptor, SourceDescriptor } from '../entities/manifold.entities';
import { AdapterRepository, SourceRepository, ManifoldAuthorizationService } from './manifold.app.contracts';

export interface ListAdaptersFn {
  (): Promise<AdapterDescriptor[]>
}
export function ListAdaptersFn(repo: AdapterRepository, authzService: ManifoldAuthorizationService): ListAdaptersFn {
  return async function(): ReturnType<ListAdaptersFn> {
    await authzService.checkCurrentUserListAdapters()
    return await repo.readAll()
  }
}

export interface CreateSourceFn {
  (sourceAttrs: Partial<SourceDescriptor>): Promise<SourceDescriptor>
}
export function CreateSourceFn(adapterRepo: AdapterRepository, sourceRepo: SourceRepository, authzService: ManifoldAuthorizationService): CreateSourceFn {
  return async function createSource(sourceAttrs: Partial<SourceDescriptor>): ReturnType<CreateSourceFn> {
    await authzService.checkCurrentUserCreateSource()
    return await sourceRepo.create(sourceAttrs)
  }
}