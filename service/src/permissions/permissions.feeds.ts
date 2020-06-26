import { FeedsPermissionService } from '../app.api/feeds/app.api.feeds'
import { PermissionDeniedError, permissionDenied } from '../app.api/app.api.global.errors'
import { AppRequestContext } from '../app.api/app.api.global'
import { UserDocument } from '../models/user'
import { RoleDocument } from '../models/role'
import { AnyPermission } from '../models/permission'
import { FeedServiceId } from '../entities/feeds/entities.feeds'


export type UserWithRole = UserDocument & {
  roleId: RoleDocument
}

/**
 * This permission service relies on the user and role that the I/O adapter
 * layer has previously fetched from the database.
 */
export class PreFetchedUserRoleFeedsPermissionService implements FeedsPermissionService {

  async ensureListServiceTypesPermissionFor(context: AppRequestContext<UserWithRole>): Promise<PermissionDeniedError | null> {
    return ensureContextUserHasPermission(context, 'FEEDS_LIST_SERVICE_TYPES')
  }

  async ensureCreateServicePermissionFor(context: AppRequestContext<UserWithRole>): Promise<PermissionDeniedError | null> {
    return ensureContextUserHasPermission(context, 'FEEDS_CREATE_SERVICE')
  }

  async ensureListServicesPermissionFor(context: AppRequestContext<UserWithRole>): Promise<PermissionDeniedError | null> {
    return ensureContextUserHasPermission(context, 'FEEDS_LIST_SERVICES')
  }

  async ensureListTopicsPermissionFor(context: AppRequestContext<unknown>, service: FeedServiceId): Promise<PermissionDeniedError | null> {
    throw new Error('unimplemented')
  }

  async ensureCreateFeedPermissionFor(context: AppRequestContext<UserWithRole>): Promise<PermissionDeniedError | null> {
    throw new Error('unimplemented');
  }
}

function ensureContextUserHasPermission(context: AppRequestContext<UserWithRole>, permission: AnyPermission): null | PermissionDeniedError {
  const user = context.requestingPrincipal()
  const role = user.roleId
  if (role.permissions.includes(permission)) {
    return null
  }
  return permissionDenied(permission, user.username)
}