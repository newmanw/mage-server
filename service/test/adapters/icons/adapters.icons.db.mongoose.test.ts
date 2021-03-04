import { URL } from 'url'
import { expect } from 'chai'
import _ from 'lodash'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import uniqid from 'uniqid'
import { IconUrlScheme, StaticIconStub } from '../../../lib/entities/icons/entities.icons'
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
  let resolvers: IconUrlScheme[]

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
    resolvers = []
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
        contentTimestamp: Date.now(),
        mediaType: 'image/png',
        tags: [ 'test' ],
        fileName: 'new.png',
        title: 'Test Icon',
        summary: 'unregistered'
      }
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const registered = await repo.findOrImportBySourceUrl(stub)
      const found = await model.find({})

      expect(found).to.have.length(1)
      const foundJson = found[0].toJSON()
      expect(_.omit(foundJson, 'registeredTimestamp')).to.deep.equal({ id, ...stub })
      expect(foundJson.registeredTimestamp).to.be.closeTo(Date.now(), 100)
      expect(registered).to.deep.equal(found[0].toJSON())
    })

    it('registers a new source url', async function() {

      const sourceUrl = new URL('mage:///test/icons/bare.png')
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const reg = await repo.findOrImportBySourceUrl(sourceUrl)
      const allDocs = await model.find({})
      expect(allDocs).to.have.length(1)
      const regDoc = allDocs[0]
      const registered = regDoc.registeredTimestamp
      expect(registered).to.be.closeTo(Date.now(), 100)
      expect(reg).to.deep.equal({
        id,
        sourceUrl,
        registeredTimestamp: registered,
        tags: []
      })
      idFactory.received(1).nextId()
    })

    it('sets the content timestamp when content hash is present', async function() {

      const sourceUrl = new URL('mage:///test/timestamp.png')
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const attrs: StaticIconStub = {
        sourceUrl,
        contentHash: uniqid()
      }
      const reg = await repo.findOrImportBySourceUrl(attrs)

      expect(reg.contentTimestamp).to.be.closeTo(Date.now(), 100)
    })

    it('replaces icon properties for an existing source url when the content hash changes', async function() {

      const sourceUrl = new URL('mage:///test/replace.png')
      const origAttrs: Required<StaticIconStub> = {
        sourceUrl,
        imageType: 'raster',
        sizeBytes: 1000,
        sizePixels: { width: 120, height: 120 },
        contentHash: uniqid(),
        contentTimestamp: Date.now() - 10000,
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
        contentTimestamp: Date.now(),
        mediaType: 'svg',
        tags: [ 'test' ],
        fileName: 'updated.png',
        title: 'Updated',
        summary: 'replaced'
      }
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const orig = await repo.findOrImportBySourceUrl(origAttrs)
      const origFound = await model.find({})

      expect(orig).to.deep.include({ id, ...origAttrs })

      const updated = await repo.findOrImportBySourceUrl(updatedAttrs)
      const updatedFound = await model.find({})

      expect(updated).to.deep.include({ id, ...updatedAttrs })
      expect(origFound).to.have.length(1)
      expect(updatedFound).to.have.length(1)
      expect(origFound[0].toJSON()).to.deep.equal({ id, registeredTimestamp: origFound[0].registeredTimestamp, ...origAttrs })
      expect(updatedFound[0].toJSON()).to.deep.equal({ id, registeredTimestamp: updatedFound[0].registeredTimestamp, ...updatedAttrs })
      idFactory.received(1).nextId()
    })

    it('removes properties not defined in updated icon when the content hash changes', async function() {

      const sourceUrl = new URL('mage:///test/replace.png')
      const origAttrs: Required<StaticIconStub> = Object.freeze({
        sourceUrl,
        imageType: 'raster',
        sizeBytes: 1000,
        sizePixels: { width: 120, height: 120 },
        contentHash: uniqid(),
        contentTimestamp: Date.now() - 10000,
        mediaType: 'image/png',
        tags: [],
        fileName: 'orig.png',
        title: 'Original',
        summary: 'replace me'
      })
      const updatedAttrs: StaticIconStub = Object.freeze({
        sourceUrl,
        imageType: 'vector',
        sizeBytes: 1100,
        sizePixels: { width: 220, height: 220 },
        contentHash: uniqid(),
        mediaType: 'svg',
        tags: [ 'test' ],
      })
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const orig = await repo.findOrImportBySourceUrl(origAttrs)
      const origFound = await model.find({})
      const updated = await repo.findOrImportBySourceUrl(updatedAttrs)
      const updatedFound = await model.find({})

      expect(origFound).to.have.length(1)
      expect(updatedFound).to.have.length(1)
      const registeredTimestamp = origFound[0].registeredTimestamp
      expect(registeredTimestamp).to.be.closeTo(Date.now(), 150)
      expect(updatedFound[0].contentTimestamp).to.be.closeTo(Date.now(), 150)
      expect(_.omit(origFound[0].toJSON(), 'registeredTimestamp')).to.deep.equal({ id, ...origAttrs })
      expect(_.omit(updatedFound[0].toJSON(), 'contentTimestamp')).to.deep.equal({ id, registeredTimestamp, ...updatedAttrs })
      expect(orig).to.deep.equal({ id, registeredTimestamp, ...origAttrs })
      expect(updated).to.deep.equal({ id, registeredTimestamp, contentTimestamp: updatedFound[0].contentTimestamp, ...updatedAttrs })
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
      const orig = await repo.findOrImportBySourceUrl(origAttrs)
      const origFound = await model.find({})
      const updated = await repo.findOrImportBySourceUrl(updatedAttrs)
      const updatedFound = await model.find({})

      expect(origFound).to.have.length(1)
      expect(updatedFound).to.have.length(1)
      const registeredTimestamp = origFound[0].registeredTimestamp
      expect(_.omit(orig, 'contentTimestamp')).to.deep.equal({ id, registeredTimestamp, ...origAttrs })
      expect(_.omit(updated, 'contentTimestamp')).to.deep.equal({ id, registeredTimestamp, ...updatedAttrs })
      expect(_.omit(origFound[0].toJSON())).to.deep.equal({ id, registeredTimestamp, contentTimestamp: origFound[0].contentTimestamp, ...origAttrs })
      expect(_.omit(updatedFound[0].toJSON())).to.deep.equal({ id, registeredTimestamp, contentTimestamp: updatedFound[0].contentTimestamp, ...updatedAttrs })
      idFactory.received(1).nextId()
    })

    it('does not update the icon properties when the content hash did not change', async function() {

      const sourceUrl = new URL('test:///icons/nochange.png')
      const stub: StaticIconStub = {
        sourceUrl,
        contentHash: 'nochange',
        imageType: 'raster',
        mediaType: 'image/png',
        sizeBytes: 1024,
        sizePixels: { width: 100, height: 100 },
        tags: []
      }
      const sameHashStub: StaticIconStub = {
        sourceUrl,
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
      const registered = await repo.findOrImportBySourceUrl(stub)

      expect(registered).to.deep.include({ id,  ...stub })
      expect(registered.contentTimestamp).to.be.closeTo(Date.now(), 100)

      const sameHashRegistered = await repo.findOrImportBySourceUrl(sameHashStub)

      expect(sameHashRegistered).to.deep.equal(registered)
    })

    it('does not update the icon properties if the stub has no content hash', async function() {

      const sourceUrl = new URL('mage:///test/replace.png')
      const origAttrs: Required<StaticIconStub> = Object.freeze({
        sourceUrl,
        imageType: 'raster',
        sizeBytes: 1000,
        sizePixels: { width: 120, height: 120 },
        contentHash: uniqid(),
        contentTimestamp: Date.now() - 10000,
        mediaType: 'image/png',
        tags: [],
        fileName: 'orig.png',
        title: 'Original',
        summary: 'replace me'
      })
      const updatedAttrs: StaticIconStub = Object.freeze({
        contentHash: undefined,
        sourceUrl,
        imageType: 'vector',
        sizeBytes: 1100,
        sizePixels: { width: 220, height: 220 },
        contentTimestamp: Date.now(),
        mediaType: 'svg',
        tags: [ 'test' ],
        fileName: 'updated.png',
        title: 'Updated',
        summary: 'replaced'
      })
      const id = uniqid()
      idFactory.nextId().resolves(id)
      const orig = await repo.findOrImportBySourceUrl(origAttrs)
      const origFound = await model.find({})
      const updated = await repo.findOrImportBySourceUrl(updatedAttrs)
      const updatedFound = await model.find({})

      expect(orig).to.deep.equal({ id, registeredTimestamp: origFound[0].registeredTimestamp, ...origAttrs })
      expect(updated).to.deep.equal(orig)
      expect(origFound).to.have.length(1)
      expect(updatedFound).to.have.length(1)
      expect(origFound[0].toJSON()).to.deep.equal({ id, registeredTimestamp: origFound[0].registeredTimestamp, ...origAttrs })
      expect(updatedFound[0].toJSON()).to.deep.equal(origFound[0].toJSON())
      idFactory.received(1).nextId()
    })
  })

  it('enforces unique source url', async function() {

    const sourceUrl = new URL('must:///be/unique')
    const attrs: Required<StaticIconStub> & { sourceUrl: URL } = Object.freeze({
      sourceUrl,
      contentHash: '1',
      contentTimestamp: Date.now(),
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

  describe('loading icon content', function() {

    let resolverA = Sub.for<IconUrlScheme>()
    let resolverB = Sub.for<IconUrlScheme>()

    beforeEach(function() {
      resolverA = Sub.for<IconUrlScheme>()
      resolverB = Sub.for<IconUrlScheme>()
      resolvers = [ resolverA, resolverB ]
    })

  })
})