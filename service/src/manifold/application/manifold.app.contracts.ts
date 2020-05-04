import { AdapterDescriptor, SourceDescriptor } from "../entities/manifold.entities";

export interface AdapterRepository {
  readAll(): Promise<AdapterDescriptor[]>
  /**
   *
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
