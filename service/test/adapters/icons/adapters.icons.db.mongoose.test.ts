import { URL } from 'url'
import { expect } from 'chai'
import _ from 'lodash'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import uniqid from 'uniqid'
import { StaticIconStub, StaticIconRepository, UnregisteredStaticIcon } from '../../../lib/entities/icons/entities.icons'
import { MongooseStaticIconRepository, StaticIconDocument, StaticIconModel } from '../../../lib/adapters/icons/adapters.icons.db.mongoose'
import { Substitute as Sub, SubstituteOf } from '@fluffy-spoon/substitute'
import { EntityIdFactory } from '../../../lib/entities/entities.global'


describe('static icon mongoose repository', function() {

  let mongo: MongoMemoryServer
  let uri: string
  let conn: mongoose.Connection
  let model: mongoose.Model<StaticIconDocument>
  let idFactory: SubstituteOf<EntityIdFactory>
  let repo: MongooseStaticIconRepository

  before(async function() {
    mongo = new MongoMemoryServer()
    uri = await mongo.getUri()
  })

  beforeEach(async function() {
    conn = await mongoose.createConnection(uri, {
      useMongoClient: true,
      promiseLibrary: Promise
    })
    model = StaticIconModel(conn, 'test_static_icons')
    idFactory = Sub.for<EntityIdFactory>()
    repo = new MongooseStaticIconRepository(model, idFactory)
    model.findOne({})
  })

  afterEach(async function() {
    await model.remove({})
    await conn.close()
  })

  after(async function() {
    await mongoose.disconnect()
    await mongo.stop()
  })

  describe('registering by source url', function() {

    it('registers a new static icon', async function() {

      const sourceUrl = new URL('mage:///test/icons/new.png')
      const stub: Required<StaticIconStub> = {
        sourceUrl,
        imageType: 'raster',
        sizeBytes: 100,
        sizePixels: { width: 200, height: 200 },
        contentHash: uniqid(),
        mediaType: 'image/png',
        tags: [ 'test' ],
        fileName: 'new.png',
        title: 'Test Icon',
        summary: 'unregistered'
      }
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const registered = await repo.registerBySourceUrl(stub)
      const found = await model.find({})

      expect(found).to.have.length(1)
      const foundJson = found[0].toJSON()
      expect(_.omit(foundJson, 'contentTimestamp')).to.deep.equal({ id, ...stub })
      expect(foundJson.contentTimestamp).to.be.closeTo(Date.now(), 100)
      expect(registered).to.deep.equal(found[0].toJSON())
    })

    it('replaces icon properties for an existing source url when the content hash changes', async function() {

      const sourceUrl = new URL('mage:///test/replace.png')
      const origAttrs: Required<StaticIconStub> = {
        sourceUrl,
        imageType: 'raster',
        sizeBytes: 1000,
        sizePixels: { width: 120, height: 120 },
        contentHash: uniqid(),
        mediaType: 'image/png',
        tags: [],
        fileName: 'orig.png',
        title: 'Original',
        summary: 'replace me'
      }
      const updatedAttrs: Required<StaticIconStub> = {
        sourceUrl,
        imageType: 'vector',
        sizeBytes: 1100,
        sizePixels: { width: 220, height: 220 },
        contentHash: uniqid(),
        mediaType: 'svg',
        tags: [ 'test' ],
        fileName: 'updated.png',
        title: 'Updated',
        summary: 'replaced'
      }
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const orig = await repo.registerBySourceUrl(origAttrs)
      const origFound = await model.find({})

      expect(orig).to.deep.include({ id, ...origAttrs })
      expect(orig.contentTimestamp).to.be.closeTo(Date.now(), 100)

      await new Promise(resolve => setTimeout(resolve, 20))
      const updated = await repo.registerBySourceUrl(updatedAttrs)
      const updatedFound = await model.find({})

      expect(updated).to.deep.include({ id, ...updatedAttrs })
      expect(updated.contentTimestamp).to.be.greaterThan(orig.contentTimestamp + 20)
      expect(origFound).to.have.length(1)
      expect(updatedFound).to.have.length(1)
      expect(_.omit(origFound[0].toJSON(), 'contentTimestamp')).to.deep.equal({ id, ...origAttrs })
      expect(_.omit(updatedFound[0].toJSON(), 'contentTimestamp')).to.deep.equal({ id, ...updatedAttrs })
      idFactory.received(1).nextId()
    })

    it('removes properties not defined in updated icon', async function() {

      const sourceUrl = new URL('mage:///test/replace.png')
      const origAttrs: Required<StaticIconStub> = {
        sourceUrl,
        imageType: 'raster',
        sizeBytes: 1000,
        sizePixels: { width: 120, height: 120 },
        contentHash: uniqid(),
        mediaType: 'image/png',
        tags: [],
        fileName: 'orig.png',
        title: 'Original',
        summary: 'replace me'
      }
      const updatedAttrs: StaticIconStub = {
        sourceUrl,
        imageType: 'vector',
        sizeBytes: 1100,
        sizePixels: { width: 220, height: 220 },
        contentHash: uniqid(),
        mediaType: 'svg',
        tags: [ 'test' ],
      }
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const orig = await repo.registerBySourceUrl(origAttrs)
      const origFound = await model.find({})
      const updated = await repo.registerBySourceUrl(updatedAttrs)
      const updatedFound = await model.find({})

      expect(_.omit(orig, 'contentTimestamp')).to.deep.equal({ id, ...origAttrs })
      expect(_.omit(updated, 'contentTimestamp')).to.deep.equal({ id, ...updatedAttrs })
      expect(origFound).to.have.length(1)
      expect(updatedFound).to.have.length(1)
      expect(_.omit(origFound[0].toJSON(), 'contentTimestamp')).to.deep.equal({ id, ...origAttrs })
      expect(_.omit(updatedFound[0].toJSON(), 'contentTimestamp')).to.deep.equal({ id, ...updatedAttrs })
      idFactory.received(1).nextId()
    })

    it('adds properties not defined in existing icon', async function() {

      const sourceUrl = new URL('mage:///test/replace.png')
      const origAttrs: StaticIconStub = {
        sourceUrl,
        imageType: 'raster',
        sizeBytes: 1000,
        sizePixels: { width: 120, height: 120 },
        contentHash: uniqid(),
        mediaType: 'image/png',
        tags: [],
      }
      const updatedAttrs: StaticIconStub = {
        sourceUrl,
        imageType: 'vector',
        sizeBytes: 1100,
        sizePixels: { width: 220, height: 220 },
        contentHash: uniqid(),
        mediaType: 'svg',
        tags: [ 'test' ],
        fileName: 'updated.png',
        title: 'Updated',
        summary: 'replaced'
      }
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const orig = await repo.registerBySourceUrl(origAttrs)
      const origFound = await model.find({})
      const updated = await repo.registerBySourceUrl(updatedAttrs)
      const updatedFound = await model.find({})

      expect(_.omit(orig, 'contentTimestamp')).to.deep.equal({ id, ...origAttrs })
      expect(_.omit(updated, 'contentTimestamp')).to.deep.equal({ id, ...updatedAttrs })
      expect(origFound).to.have.length(1)
      expect(updatedFound).to.have.length(1)
      expect(_.omit(origFound[0].toJSON(), 'contentTimestamp')).to.deep.equal({ id, ...origAttrs })
      expect(_.omit(updatedFound[0].toJSON(), 'contentTimestamp')).to.deep.equal({ id, ...updatedAttrs })
      idFactory.received(1).nextId()
    })

    it('does not update the icon properties when the content hash did not change', async function() {

      const stub: StaticIconStub = {
        sourceUrl: new URL('test:///icons/nochange.png'),
        contentHash: 'nochange',
        imageType: 'raster',
        mediaType: 'image/png',
        sizeBytes: 1024,
        sizePixels: { width: 100, height: 100 },
        tags: []
      }
      const sameHashStub: StaticIconStub = {
        sourceUrl: stub.sourceUrl,
        contentHash: stub.contentHash,
        imageType: 'vector',
        mediaType: 'image/svg+xml',
        sizeBytes: 2048,
        sizePixels: { width: 0, height: 0 },
        tags: [ 'same' ],
        title: 'No Change',
        summary: 'Should not update',
        fileName: 'nochange.png'
      }
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const registered = await repo.registerBySourceUrl(stub)

      expect(registered).to.deep.include({ id,  ...stub })
      expect(registered.contentTimestamp).to.be.closeTo(Date.now(), 100)

      const sameHashRegistered = await repo.registerBySourceUrl(sameHashStub)

      expect(sameHashRegistered).to.deep.equal(registered)
    })
  })

  it('enforces unique source url', async function() {

    const sourceUrl = new URL('must:///be/unique')
    const attrs: Required<StaticIconStub> = Object.freeze({
      sourceUrl,
      contentHash: '1',
      fileName: 'unique.png',
      imageType: 'raster',
      mediaType: 'image/png',
      sizeBytes: 1000,
      sizePixels: { width: 120, height: 100 },
      summary: 'there can be only one',
      tags: [ 'test' ],
      title: 'no dups'
    })
    const nextId = uniqid()
    idFactory.nextId().resolves(nextId)
    const created = await repo.create(attrs)

    expect(created).to.deep.include({ id: nextId, ...attrs })
    await expect(repo.create(attrs)).to.eventually.be.rejected

    const all = await model.find({})

    expect(all).to.have.length(1)
  })
})