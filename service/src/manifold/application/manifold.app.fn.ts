import { AdapterDescriptor, SourceDescriptor } from '../entities/manifold.entities';
import { AdapterRepository, SourceRepository, ManifoldAuthorizationService } from './manifold.app.contracts';
import { MageError, MageErrorCode } from '../../application/app.global.errors';

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
    if (typeof sourceAttrs.adapter !== 'string') {
      throw new MageError(MageErrorCode.InvalidInput)
    }
    const adapterDesc = await adapterRepo.findById(sourceAttrs.adapter)
    if (!adapterDesc) {
      throw new MageError(MageErrorCode.InvalidInput)
    }
    return await sourceRepo.create(sourceAttrs)
  }
}