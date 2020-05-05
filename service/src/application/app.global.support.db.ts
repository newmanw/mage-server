
export type EntityReference = { id: string | number }

export interface Repository<E extends object> {

  create(attrs: Partial<E>): Promise<E>
  readAll(): Promise<E[]>
  findById(id: any): Promise<E | null>
  update(attrs: Partial<E> & EntityReference): Promise<E>
  removeById(id: any): Promise<void>
}
