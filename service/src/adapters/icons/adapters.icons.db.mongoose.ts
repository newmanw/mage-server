
import { URL } from 'url'
import mongoose from 'mongoose'
import mongodb from 'mongodb'
import { EntityIdFactory, pageOf, PageOf, PagingParameters } from '../../entities/entities.global'
import { StaticIcon, StaticIconStub, StaticIconId, StaticIconRepository, LocalStaticIconStub } from '../../entities/icons/entities.icons'
import { BaseMongooseRepository, pageQuery } from '../base/adapters.base.db.mongoose'

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
  }
)
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

  async findOrImportBySourceUrl(stub: StaticIconStub | URL): Promise<StaticIcon> {
    if (!('sourceUrl' in stub)) {
      stub = { sourceUrl: stub }
    }
    else {
      stub = { ...stub }
    }
    if (typeof stub.contentHash === 'string' && typeof stub.contentTimestamp !== 'number') {
      stub.contentTimestamp = Date.now()
    }
    let registered = await this.findDocBySourceUrl(stub.sourceUrl)
    if (registered) {
      registered = await updateRegisteredIconIfChanged.call(this, registered, stub)
    }
    else {
      const _id = await this.idFactory.nextId()
      registered = await this.model.create({ _id, registeredTimestamp: Date.now(), ...stub })
    }
    return registered?.toJSON()
  }

  async createLocal(stub: LocalStaticIconStub, content: NodeJS.ReadableStream): Promise<StaticIcon> {
    throw new Error('Method not implemented.')
  }

  async resolveFromSourceUrl(id: string): Promise<NodeJS.ReadableStream | null> {
    throw new Error('Method not implemented.')
  }

  async resolveFromSourceUrlAndStore(id: string): Promise<StaticIcon | null> {
    throw new Error('Method not implemented.')
  }

  async loadContent(id: StaticIconId): Promise<NodeJS.ReadableStream | null> {
    throw new Error('Method not implemented.')
  }

  async findBySourceUrl(url: URL): Promise<StaticIcon | null> {
    return await this.findDocBySourceUrl(url).then(x => x?.toJSON())
  }

  async find(paging?: PagingParameters): Promise<PageOf<StaticIcon>> {
    paging = paging || { pageSize: 100, pageIndex: 0, includeTotalCount: false }
    const counted = await pageQuery(this.model.find().sort({ sourceUrl: 1 }), paging)
    const items: StaticIcon[] = []
    for await (const doc of counted.query.cursor()) {
      items.push(this.docToEntity(doc))
    }
    return pageOf(items, paging, counted.totalCount)
  }

  private async findDocBySourceUrl(url: URL): Promise<StaticIconDocument | null> {
    return await this.model.findOne({ sourceUrl: url.toString() })
  }
}

async function updateRegisteredIconIfChanged(this: MongooseStaticIconRepository, registered: StaticIconDocument, stub: StaticIconStub): Promise<StaticIconDocument> {
  /*
  TODO: some of this logic could potentially be captured as an entity layer
  function, such as which properties a client is allowed to update when
  registering icon properties.  obviously the bit that builds the $unset
  operator is Mongo-specific.
  */
  if (stub.contentHash === registered.contentHash || typeof stub.contentHash !== 'string') {
    return registered
  }
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
  const updated = await this.model.findByIdAndUpdate(registered.id, update, { new: true })
  return updated!
}