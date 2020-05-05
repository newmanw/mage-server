
import { EntityReference } from '../entities/base.entities'


export interface Repository<E extends object> {

  create(attrs: Partial<E>): Promise<E>

  readAll(): Promise<E[]>

  findById(id: any): Promise<E | null>

  update(attrs: Partial<E> & EntityReference): Promise<E>

  removeById(id: any): Promise<void>
}