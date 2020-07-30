import { describe, it } from 'mocha'
import { expect } from 'chai'
import uniqid from 'uniqid'
import { AppRequestContext } from '../../lib/app.api/app.api.global'
import { FeedServiceId, FeedId } from '../../lib/entities/feeds/entities.feeds'
import { MageError, ErrPermissionDenied } from '../../lib/app.api/app.api.global.errors'
import { EventFeedsPermissionService, EventRequestContext } from '../../lib/permissions/permissions.events'
import { Substitute as Sub, SubstituteOf } from '@fluffy-spoon/substitute'
import { MageEventRepository } from '../../lib/entities/events/entities.events'

describe('event feeds permission service', function() {

  let permissions: EventFeedsPermissionService
  let context: EventRequestContext
  let service: FeedServiceId
  let eventRepo: SubstituteOf<MageEventRepository>

  beforeEach(function() {
    eventRepo = Sub.for<MageEventRepository>()
    permissions = new EventFeedsPermissionService(eventRepo)
    service = uniqid()
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