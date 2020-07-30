import { describe, it } from 'mocha'
import { expect } from 'chai'
import uniqid from 'uniqid'
import { AppRequestContext } from '../../lib/app.api/app.api.global'
import { FeedServiceId, FeedId } from '../../lib/entities/feeds/entities.feeds'
import { MageError, ErrPermissionDenied } from '../../lib/app.api/app.api.errors'
import { EventFeedsPermissionService, EventRequestContext, EventPermissionServiceImpl } from '../../lib/permissions/permissions.events'
import { Substitute as Sub, SubstituteOf } from '@fluffy-spoon/substitute'
import { MageEventRepository } from '../../lib/entities/events/entities.events'


describe('event permission service', function() {

  describe('enforcing permissions with context event', function() {

    it('ensures event read permission', async function() {
      expect.fail('todo')
    })

    it('ensures event update permission', async function() {
      expect.fail('todo')
    })
  })
})

describe('event feeds permission service', function() {

  let context: EventRequestContext
  let service: FeedServiceId
  let eventPermissions: SubstituteOf<EventPermissionServiceImpl>
  let eventRepo: SubstituteOf<MageEventRepository>
  let permissions: EventFeedsPermissionService

  beforeEach(function() {
    service = uniqid()
    eventRepo = Sub.for<MageEventRepository>()
    eventPermissions = Sub.for<EventPermissionServiceImpl>()
    permissions = new EventFeedsPermissionService(eventRepo, eventPermissions)
  })

  it('denies all except fetch', async function() {

    let denied = await permissions.ensureListServiceTypesPermissionFor(context)
    expect(denied?.code).to.equal(ErrPermissionDenied)
    denied = await permissions.ensureCreateServicePermissionFor(context)
    expect(denied?.code).to.equal(ErrPermissionDenied)
    denied = await permissions.ensureListServicesPermissionFor(context)
    expect(denied?.code).to.equal(ErrPermissionDenied)
    denied = await permissions.ensureListTopicsPermissionFor(context, service)
    expect(denied?.code).to.equal(ErrPermissionDenied)
    denied = await permissions.ensureCreateFeedPermissionFor(context, service)
    expect(denied?.code).to.equal(ErrPermissionDenied)
    denied = await permissions.ensureListAllFeedsPermissionFor(context)
    expect(denied?.code).to.equal(ErrPermissionDenied)

    const feedId: FeedId = uniqid()
    denied = await permissions.ensureFetchFeedContentPermissionFor(context, feedId)
    expect.fail('todo')
  })
})