
export interface BasicCrudOperations<E, ID> {

  create(attrs: Partial<E>): Promise<E>
  readAll(): Promise<E[]>
  findById(id: ID): Promise<E | null>
  update(attrs: Partial<E> & { id: ID }): Promise<E>
  remove(id: ID): Promise<void>
}