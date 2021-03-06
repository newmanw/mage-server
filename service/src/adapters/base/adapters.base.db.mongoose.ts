import mongoose from 'mongoose'
import { pageOf, PageOf, PagingParameters } from '../../entities/entities.global'

type EntityReference = { id: string | number }

type DocumentMapping<D extends mongoose.Document, E extends object> = (doc: D) => E

function createDefaultDocMapping<D extends mongoose.Document, E extends object>(): DocumentMapping<D, E> {
  return (d): any => d.toJSON()
}

export async function waitForMongooseConnection(): Promise<mongoose.Connection> {
  throw new Error('unimplemented')
}

export class BaseMongooseRepository<D extends mongoose.Document, M extends mongoose.Model<D>, E extends object> {

  readonly model: M
  readonly docToEntity: DocumentMapping<D, E>

  constructor(model: M, docToEntity?: DocumentMapping<D, E>) {
    this.model = model
    this.docToEntity = docToEntity || createDefaultDocMapping()
  }

  async create(attrs: Partial<E>): Promise<E> {
    const created = await this.model.create(attrs)
    return this.docToEntity(created)
  }

  async findAll(): Promise<E[]> {
    const docs = await this.model.find().cursor()
    const entities: E[] = []
    for await (const doc of docs) {
      entities.push(this.docToEntity(doc))
    }
    return entities
  }

  async findById(id: any): Promise<E | null> {
    const doc = await this.model.findById(id)
    return doc ? this.docToEntity(doc) : null
  }

  async update(attrs: Partial<E> & EntityReference): Promise<E | null> {
    let doc = (await this.model.findById(attrs.id))
    if (!doc) {
      throw new Error(`document not found for id: ${attrs.id}`)
    }
    doc.set(attrs)
    doc = await doc.save()
    return this.docToEntity(doc)
  }

  async removeById(id: any): Promise<E | null> {
    const doc = await this.model.findByIdAndRemove(id)
    if (doc) {
      return this.docToEntity(doc)
    }
    return null
  }
}

export const pageQuery = <T>(query: mongoose.Query<T>, paging: PagingParameters): Promise<{ totalCount: number | null, query: mongoose.Query<T> }> => {
  const BaseQuery = query.toConstructor()
  const pageQuery = new BaseQuery().limit(paging.pageSize).skip(paging.pageIndex * paging.pageSize) as mongoose.Query<T>
  const includeTotalCount = typeof paging.includeTotalCount === 'boolean' ? paging.includeTotalCount : paging.pageIndex === 0
  if (includeTotalCount) {
    const countQuery = new BaseQuery().count()
    return countQuery.then(totalCount => {
      return { totalCount, query: pageQuery }
    })
  }
  return Promise.resolve({
    totalCount: null,
    query: pageQuery
  })
}