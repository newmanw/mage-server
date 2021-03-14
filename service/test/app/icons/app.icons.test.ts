import { URL } from 'url'
import uniqid from 'uniqid'
import { expect } from 'chai'
import { Arg, Substitute as Sub, SubstituteOf } from '@fluffy-spoon/substitute'
import * as api from '../../../lib/app.api/icons/app.api.icons'
import * as impl from '../../../lib/app.impl/icons/app.impl.icons'
import { ErrPermissionDenied, InvalidInputError, MageError, permissionDenied } from '../../../lib/app.api/app.api.errors'
import { AppRequest } from '../../../lib/app.api/app.api.global'
import { LocalStaticIconStub, StaticIcon, StaticIconRepository } from '../../../lib/entities/icons/entities.icons'

function requestBy<T extends object>(principal: string, params?: T): AppRequest<string> & T {
  if (!params) {
    params = {} as T
  }
  return {
    ...params,
    context: {
      requestToken: Symbol(),
      requestingPrincipal: () => principal,
    }
  }
}

describe.only('icons use case interactions', function() {

  let permissions: SubstituteOf<api.StaticIconPermissionsService>
  let iconRepo: SubstituteOf<StaticIconRepository>

  beforeEach(function() {
    permissions = Sub.for<api.StaticIconPermissionsService>()
    iconRepo = Sub.for<StaticIconRepository>()
  })

  describe('storing a local icon', function() {

    let createIcon: api.CreateLocalStaticIcon

    beforeEach(function() {
      createIcon = impl.CreateStaticIcon(permissions)
    })

    it('checks permission for creating an icon', async function() {

      const req: api.CreateLocalStaticIconRequest = requestBy('admin', {
        iconContent: Sub.for<NodeJS.ReadableStream>(),
        iconInfo: {
          title: 'Permission Check'
        }
      })
      permissions.ensureCreateStaticIconPermission(Arg.requestTokenMatches(req.context))
        .resolves(permissionDenied('get static icon content', req.context.requestingPrincipal() as string))
      const res = await createIcon(req)

      expect(res.success).to.be.null
      expect(res.error).to.be.instanceOf(MageError)
      expect(res.error?.code).to.equal(ErrPermissionDenied)
      permissions.received(1).ensureCreateStaticIconPermission(Arg.requestTokenMatches(req.context))
      iconRepo.didNotReceive().createLocal(Arg.all())
    })

    it('saves the icon info and content', async function() {

      permissions.ensureCreateStaticIconPermission(Arg.all()).resolves(null)
      const iconInfo: LocalStaticIconStub = {
        title: 'Local Test',
        fileName: 'local.png'
      }
      const iconContent = Sub.for<NodeJS.ReadableStream>()
      const req: api.CreateLocalStaticIconRequest = requestBy('admin', {
        iconInfo,
        iconContent
      })
      const iconId = uniqid()
      const created: StaticIcon = {
        id: iconId,
        sourceUrl: new URL(`mage:///icons/${iconId}`),
        registeredTimestamp: Date.now(),
        ...iconInfo
      }
      iconRepo.createLocal(Arg.deepEquals(iconInfo), Arg.is(x => x === iconContent)).resolves(created)
      const res = await createIcon(req)

      expect(res.error).to.be.null
      expect(res.success).to.deep.equal(created)
      iconRepo.received(1).createLocal(Arg.deepEquals(iconInfo), Arg.is(x => x === iconContent))
    })
  })

  describe('registering a remote icon', async function() {

    describe('fetch behavior', function() {


    })

    it('registers the icon source url', async function() {
      expect.fail('todo')
    })

    it('fetches the content from the source url', async function() {
      expect.fail('todo')
    })
  })

  describe('getting an icon', function() {

    let getIcon: api.GetStaticIcon

    beforeEach(function() {
      getIcon = impl.GetStaticIcon(permissions, iconRepo)
    })

    it('gets an icon by id', async function() {

      const icon: StaticIcon = {
        id: uniqid(),
        sourceUrl: new URL('test://get/me'),
        registeredTimestamp: Date.now()
      }
      const req: api.GetStaticIconRequest = requestBy('user1', {
        iconRef: { id: icon.id }
      })
      permissions.ensureGetStaticIconPermission(Arg.requestTokenMatches(req.context)).resolves(null)
      iconRepo.findByReference(Arg.deepEquals({ id: icon.id })).resolves(icon)
      const res = await getIcon(req)

      expect(res.error).to.be.null
      expect(res.success).to.deep.equal(icon)
    })

    it('gets an icon by source url', async function() {

      const icon: StaticIcon = {
        id: uniqid(),
        sourceUrl: new URL('test://get/me'),
        registeredTimestamp: Date.now()
      }
      const req: api.GetStaticIconRequest = requestBy('user1', {
        iconRef: { sourceUrl: icon.sourceUrl }
      })
      permissions.ensureGetStaticIconPermission(Arg.requestTokenMatches(req.context)).resolves(null)
      iconRepo.findByReference(Arg.deepEquals({ sourceUrl: icon.sourceUrl })).resolves(icon)
      const res = await getIcon(req)

      expect(res.error).to.be.null
      expect(res.success).to.deep.equal(icon)
    })

    it('gets an icon by source url string', async function() {

      const icon: StaticIcon = {
        id: uniqid(),
        sourceUrl: new URL('test://get/me'),
        registeredTimestamp: Date.now()
      }
      const req: api.GetStaticIconRequest = requestBy('user1', {
        iconRef: { sourceUrl: String(icon.sourceUrl) }
      })
      permissions.ensureGetStaticIconPermission(Arg.requestTokenMatches(req.context)).resolves(null)
      iconRepo.findByReference(Arg.deepEquals({ sourceUrl: icon.sourceUrl })).resolves(icon)
      const res = await getIcon(req)

      expect(res.error).to.be.null
      expect(res.success).to.deep.equal(icon)
    })

    it('returns invalid input error if source url string is invalid', async function() {

      const req: api.GetStaticIconRequest = requestBy('user1', {
        iconRef: { sourceUrl: 'bad url' }
      })
      permissions.ensureGetStaticIconPermission(Arg.requestTokenMatches(req.context)).resolves(null)
      const res = await getIcon(req)

      expect(res.success).to.be.null
      const err = res.error as InvalidInputError
      expect(err.message).to.contain('invalid icon source url')
      expect(err.data).to.deep.equal([
        [ 'invalid url: bad url', 'iconRef', 'sourceUrl' ]
      ])
    })
  })

  describe('getting icon content', function() {

    let getIconContent: api.GetStaticIconContent

    beforeEach(function() {
      getIconContent = impl.GetStaticIconContent(permissions)
    })

    it('checks permission for getting an icon', async function() {

      const req: api.GetStaticIconContentRequest = requestBy('admin', { iconId: uniqid() })
      permissions.ensureGetStaticIconPermission(Arg.requestTokenMatches(req.context))
        .resolves(permissionDenied('get static icon content', req.context.requestingPrincipal() as string))
      const res = await getIconContent(req)

      expect(res.success).to.be.null
      expect(res.error).to.be.instanceOf(MageError)
      expect(res.error?.code).to.equal(ErrPermissionDenied)
      permissions.received(1).ensureGetStaticIconPermission(Arg.requestTokenMatches(req.context))
      iconRepo.didNotReceive().loadContent(Arg.all())
    })

    describe('getting resolved icon content', async function() {

      it('returns the stored content', async function() {

        permissions.ensureGetStaticIconPermission(Arg.all()).resolves(null)
        const req: api.GetStaticIconContentRequest = requestBy('admin', { iconId: uniqid() })
        const res = await getIconContent(req)

        expect.fail('todo')
      })
    })
  })
})