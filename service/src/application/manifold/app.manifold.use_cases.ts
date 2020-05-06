import { AdapterDescriptor, SourceDescriptor, ManifoldAdapter } from '../../entities/manifold/entities.manifold';
import { MageError, MageErrorCode, EntityNotFoundError } from '../../application/app.global.errors';
import { Json } from '../../entities/entities.global.json';

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

export interface GetSourcePreviewParameters {
  (sourceId: string): Promise<Json>
}
export function GetSourcePreviewParameters(adapterRepo: AdapterRepository, sourceRepo: SourceRepository, authzService: ManifoldAuthorizationService, manager: ManifoldAdapterRegistry): GetSourcePreviewParameters {
  return async function getSourcePreviewParameters(sourceId: string): Promise<Json> {
    const sourceDesc = await sourceRepo.findById(sourceId)
    if (!sourceDesc) {
      throw new EntityNotFoundError('source descriptor', sourceId)
    }
    let adapterId = sourceDesc.adapter
    if (typeof adapterId === 'object') {
      adapterId = adapterId.id
    }
    const adapter = await manager.getAdapterForId(adapterId)
    if (!adapter) {
      throw new Error('adapter not registered: ' + adapterId)
    }
    return await adapter.getPreviewParametersForSource(sourceDesc)
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

export interface ManifoldPlugin {
  initializeAdapter(): Promise<ManifoldAdapter>
}

export interface ManifoldAdapterRegistry {
  getAdapterForId(adapterId: string): Promise<ManifoldAdapter | null>
}