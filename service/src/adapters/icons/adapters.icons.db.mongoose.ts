
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
    contentHash: { type: String, required: true },
    contentTimestamp: { type: Number, required: true, default: Date.now },
    imageType: { type: String, required: true },
    mediaType: { type: String, required: true },
    sizePixels: {
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    sizeBytes: { type: Number, required: true },
    tags: [{ type: String, required: true }],
    title: { type: String, required: false },
    summary: { type: String, required: false },
    fileName: { type: String, required: false },
  },
  {
    timestamps: {
      createdAt: false,
      updatedAt: 'contentTimestamp'
    },
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

  async create(stub: StaticIconStub): Promise<StaticIcon> {
    const _id = await this.idFactory.nextId()
    const withId = Object.assign({ ...stub }, { _id })
    return super.create(withId)
  }

  async registerBySourceUrl(stub: StaticIconStub): Promise<StaticIcon> {
    const validKeys: { [valid in keyof StaticIconStub]: true } = {
      contentHash: true,
      fileName: true,
      imageType: true,
      mediaType: true,
      sizeBytes: true,
      sizePixels: true,
      sourceUrl: true,
      summary: true,
      tags: true,
      title: true
    }
    let registered = await this.findDocBySourceUrl(stub.sourceUrl)
    if (registered && registered.contentHash !== stub.contentHash) {
      const update: Partial<StaticIcon> & mongodb.UpdateQuery<StaticIcon> = {}
      const $unset: { [key in keyof StaticIcon]?: true } = {}
      for (const key of Object.keys(validKeys) as (keyof StaticIconStub)[]) {
        if (key in stub && stub[key]) {
          update[key] = stub[key] as any
        }
        else {
          $unset[key] = true
        }
      }
      if (Object.keys($unset).length > 0) {
        update.$unset = $unset as mongodb.UpdateQuery<StaticIcon>['$unset']
      }
      update.contentTimestamp = Date.now()
      registered = await this.model.findByIdAndUpdate(registered.id, update, { new: true })
    }
    else if (!registered) {
      const _id = await this.idFactory.nextId()
      registered = await this.model.create({ _id, ...stub })
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