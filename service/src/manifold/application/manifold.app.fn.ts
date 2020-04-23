import { AdapterDescriptor } from '../entities/manifold.entities';
import { AdapterRepository } from './manifold.app.contracts';

export interface ListAdaptersFn {
  (): Promise<AdapterDescriptor[]>
}
export function ListAdaptersFn(repo: AdapterRepository): ListAdaptersFn {
  return async function(): ReturnType<ListAdaptersFn> {
    return await repo.readAll()
  }
}