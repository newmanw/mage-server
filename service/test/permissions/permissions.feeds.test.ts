
import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Substitute as Sub, SubstituteOf } from '@fluffy-spoon/substitute'
import uniqid from 'uniqid'
import { PreFetchedUserRoleFeedsPermissionService, UserWithRole } from '../../lib/permissions/permissions.feeds'
import { AppRequestContext } from '../../lib/app.api/app.api.global'
import { RoleDocument } from '../../src/models/role'
import { MageError, ErrPermissionDenied } from '../../lib/app.api/app.api.global.errors'
import { AnyPermission } from '../../lib/models/permission'

describe.only('feeds permission service', function() {

  const permissions = new PreFetchedUserRoleFeedsPermissionService()

  function contextWithPermissions(...perms: AnyPermission[]): AppRequestContext<UserWithRole> {
    const user = Sub.for<UserWithRole>()
    const role = Sub.for<RoleDocument>()
    user.username.returns!(uniqid())
    user.roleId.returns!(role)
    role.permissions.returns!(perms)
    return {
      requestToken: Symbol(),
      requestingPrincipal() {
        return user
      }
    }
  }

  it('ensures list service types permission', async function() {

    let context = contextWithPermissions('FEEDS_LIST_SERVICE_TYPES')
    let denied = await permissions.ensureListServiceTypesPermissionFor(context)

    expect(denied).to.be.null

    context = contextWithPermissions('FEEDS_CREATE_SERVICE')
    denied = await permissions.ensureListServiceTypesPermissionFor(context)

    expect(denied).to.be.instanceOf(MageError)
    expect(denied?.code).to.equal(ErrPermissionDenied)
    expect(denied?.data.permission).to.equal('FEEDS_LIST_SERVICE_TYPES')
    expect(denied?.data.subject).to.equal(context.requestingPrincipal().username)
  })

  it('ensures list services permission', async function() {

    let context = contextWithPermissions('FEEDS_LIST_SERVICES')
    let denied = await permissions.ensureListServicesPermissionFor(context)

    expect(denied).to.be.null

    context = contextWithPermissions('FEEDS_LIST_SERVICE_TYPES')
    denied = await permissions.ensureListServicesPermissionFor(context)

    expect(denied).to.be.instanceOf(MageError)
    expect(denied?.code).to.equal(ErrPermissionDenied)
    expect(denied?.data.permission).to.equal('FEEDS_LIST_SERVICES')
    expect(denied?.data.subject).to.equal(context.requestingPrincipal().username)
  })

  it('ensures create service permission', async function() {

    let context = contextWithPermissions('FEEDS_CREATE_SERVICE')
    let denied = await permissions.ensureCreateServicePermissionFor(context)

    expect(denied).to.be.null

    context = contextWithPermissions()
    denied = await permissions.ensureCreateServicePermissionFor(context)

    expect(denied).to.be.instanceOf(MageError)
    expect(denied?.code).to.equal(ErrPermissionDenied)
    expect(denied?.data.permission).to.equal('FEEDS_CREATE_SERVICE')
    expect(denied?.data.subject).to.equal(context.requestingPrincipal().username)
  })

  it('ensures list topics permission', async function() {

    expect.fail('todo')
  })
})