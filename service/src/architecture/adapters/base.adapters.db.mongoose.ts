import mongoose from 'mongoose';
import { EntityReference } from '../entities/base.entities';
import { Repository } from './base.adapters.db';


type DocumentMapping<D extends mongoose.Document, E extends object> = (doc: D) => E;

function createDefaultDocMapping<D extends mongoose.Document, E extends object>(): DocumentMapping<D, E> {
  return (d): any => d.toJSON();
}

export class BaseMongooseRepository<D extends mongoose.Document, M extends mongoose.Model<D>, E extends object> implements Repository<E> {

  readonly model: M
  /**
   * Maybe this becomes public later.
   */
  private readonly docToEntity: DocumentMapping<D, E>;

  constructor(model: M) {
    this.model = model;
    this.docToEntity = createDefaultDocMapping();
  }

  async create(attrs: Partial<E>): Promise<E> {
    const created = await this.model.create(attrs);
    return this.docToEntity(created);
  }

  async readAll(): Promise<E[]> {
    const docs = await this.model.find();
    return docs.map(this.docToEntity);
  }

  async findById(id: any): Promise<E | null> {
    const doc = await this.model.findById(id);
    return doc ? this.docToEntity(doc) : null;
  }

  async update(attrs: Partial<E> & EntityReference): Promise<E> {
    let doc = (await this.model.findById(attrs.id!))!;
    doc.set(attrs);
    doc = await doc.save();
    return this.docToEntity(doc);
  }

  async deleteById(id: any): Promise<void> {
    await this.model.findByIdAndRemove(id)
  }
}