
import { URL } from 'url'
import mongoose from 'mongoose'
import mongodb from 'mongodb'
import { EntityIdFactory } from '../../entities/entities.global'
import { StaticIcon, StaticIconStub, StaticIconId, StaticIconRepository } from '../../entities/icons/entities.icons'
import { BaseMongooseRepository } from '../base/adapters.base.db.mongoose'

export type StaticIconDocument = Omit<StaticIcon, 'sourceUrl'> & mongoose.Document & {
  sourceUrl: string
}
export type StaticIconModel = mongoose.Model<StaticIconDocument>
export const StaticIconModelName = 'StaticIcon'
export const StaticIconSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    sourceUrl: { type: String, required: true, unique: true },
    registeredTimestamp: { type: Number, required: true },
    resolvedTimestamp: { type: Number, required: false },
    contentHash: { type: String, required: false },
    contentTimestamp: { type: Number, required: false },
    imageType: { type: String, required: false },
    mediaType: { type: String, required: false },
    sizePixels: {
      type: {
        width: { type: Number, required: true },
        height: { type: Number, required: true }
      },
      required: false
    },
    sizeBytes: { type: Number, required: false },
    tags: [ String ],
    title: { type: String, required: false },
    summary: { type: String, required: false },
    fileName: { type: String, required: false },
  },
  {
    toJSON: {
      getters: true,
      versionKey: false,
      transform: (doc: StaticIconDocument, json: any & StaticIcon, options: mongoose.SchemaOptions): void => {
        delete json._id
        json.sourceUrl = new URL(doc.sourceUrl)
      }
    }
  })
export function StaticIconModel(conn: mongoose.Connection, collection?: string): StaticIconModel {
  return conn.model(StaticIconModelName, StaticIconSchema, collection || 'static_icons')
}

export class MongooseStaticIconRepository extends BaseMongooseRepository<StaticIconDocument, StaticIconModel, StaticIcon> implements StaticIconRepository {

  constructor(readonly model: StaticIconModel, private readonly idFactory: EntityIdFactory) {
    super(model)
  }

  async create(attrs: StaticIconStub & { sourceUrl: URL }): Promise<StaticIcon> {
    const _id = await this.idFactory.nextId()
    const withId = { _id, registeredTimestamp: Date.now(), ...attrs }
    return super.create(withId)
  }

  async registerBySourceUrl(stub: StaticIconStub | URL): Promise<StaticIcon> {
    const writableKeys: { [valid in keyof StaticIconStub]: boolean } = {
      sourceUrl: false,
      contentHash: false,
      contentTimestamp: false,
      fileName: true,
      imageType: true,
      mediaType: true,
      sizeBytes: true,
      sizePixels: true,
      summary: true,
      tags: true,
      title: true
    }
    if (!('sourceUrl' in stub)) {
      stub = { sourceUrl: stub }
    }
    let registered = await this.findDocBySourceUrl(stub.sourceUrl)
    if (registered && typeof stub.contentHash === 'string' && registered.contentHash !== stub.contentHash) {
      const update: Partial<StaticIcon> & mongodb.UpdateQuery<StaticIcon> = {}
      const $unset: { [key in keyof StaticIcon]?: true } = {}
      for (const key of Object.keys(writableKeys) as (keyof StaticIconStub)[]) {
        if (key in stub && stub[key] && writableKeys[key]) {
          update[key] = stub[key] as any
        }
        else if (writableKeys[key]) {
          $unset[key] = true
        }
      }
      if (Object.keys($unset).length > 0) {
        update.$unset = $unset as mongodb.UpdateQuery<StaticIcon>['$unset']
      }
      update.contentHash = stub.contentHash
      update.contentTimestamp = Date.now()
      if (stub.contentTimestamp) {
        if (!registered.contentTimestamp || stub.contentTimestamp > Number(registered.contentTimestamp)) {
          update.contentTimestamp = stub.contentTimestamp
        }
      }
      registered = await this.model.findByIdAndUpdate(registered.id, update, { new: true })
    }
    else if (!registered) {
      const _id = await this.idFactory.nextId()
      registered = await this.model.create({ _id, registeredTimestamp: Date.now(), ...stub })
    }
    return registered?.toJSON()
  }

  saveContent(id: StaticIconId, content: NodeJS.ReadableStream): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  loadContent(id: StaticIconId): Promise<NodeJS.ReadableStream | null> {
    throw new Error('Method not implemented.')
  }

  async findBySourceUrl(url: URL): Promise<StaticIcon | null> {
    return await this.findDocBySourceUrl(url).then(x => x?.toJSON())
  }

  private async findDocBySourceUrl(url: URL): Promise<StaticIconDocument | null> {
    return await this.model.findOne({ sourceUrl: url.toString() })
  }
}