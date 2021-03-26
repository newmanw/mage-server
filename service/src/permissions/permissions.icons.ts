import { permissionDenied, PermissionDeniedError } from '../app.api/app.api.errors'
import { AppRequestContext } from '../app.api/app.api.global'
import { StaticIconPermissionService } from '../app.api/icons/app.api.icons'
import { StaticIconPermission } from '../models/permission'
import { RoleDocument } from '../models/role'
import { UserDocument } from '../models/user'

export type UserWithRole = UserDocument & {
  roleId: RoleDocument
}

export class RoleBasedStaticIconPermissionService implements StaticIconPermissionService {

  async ensureCreateStaticIconPermission(ctx: AppRequestContext<UserWithRole>): Promise<null | PermissionDeniedError> {
    const user = ctx.requestingPrincipal()
    const role = user.roleId
    if (role.permissions.includes(StaticIconPermission.STATIC_ICON_WRITE)) {
      return null
    }
    return permissionDenied(StaticIconPermission.STATIC_ICON_WRITE, user.username)
  }

  async ensureGetStaticIconPermission(ctx: AppRequestContext<UserWithRole>): Promise<null | PermissionDeniedError> {
    return null
  }
}