import { AdapterDescriptor, SourceDescriptor } from '../../entities/manifold/entities.manifold';
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

export interface AdapterRepository {
  readAll(): Promise<AdapterDescriptor[]>
  /**
   * Resolve null if no adapter descriptor with the given ID exists.
   * @param adapterId
   */
  findById(adapterId: string): Promise<AdapterDescriptor | null>
  /**
   * Reject if there is no adapter descriptor with the given ID.
   * @param attrs the attributes to update on the referenced adapter descriptor
   */
  update(attrs: Partial<AdapterDescriptor> & { id: string }): Promise<AdapterDescriptor>
  removeById(adapterId: string): Promise<void>
}

export interface SourceRepository {
  create(sourceAttrs: Partial<SourceDescriptor>): Promise<SourceDescriptor>
  readAll(): Promise<SourceDescriptor[]>
  findById(sourceId: string): Promise<SourceDescriptor | null>
}

export interface ManifoldAuthorizationService {
  checkCurrentUserListAdapters(): Promise<void>
  checkCurrentUserCreateSource(): Promise<void>
}