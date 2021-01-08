import { withPermission } from '../../app.api/app.api.global'
import { CreateLocalStaticIcon, CreateLocalStaticIconRequest, GetStaticIconContent, GetStaticIconContentRequest, StaticIconPermissionsService } from '../../app.api/icons/app.api.icons'


export function CreateStaticIcon(permissions: StaticIconPermissionsService): CreateLocalStaticIcon {
  return function(req: CreateLocalStaticIconRequest): ReturnType<CreateLocalStaticIcon> {
    return withPermission(
      permissions.ensureCreateStaticIconPermission(req.context),
      () => {
        throw new Error('todo')
      }
    )
  }
}

export function GetStaticIconContent(permissions: StaticIconPermissionsService): GetStaticIconContent {
  return function getStaticIconContent(req: GetStaticIconContentRequest): ReturnType<GetStaticIconContent> {
    return withPermission(
      permissions.ensureGetStaticIconContentPermission(req.context),
      () => {
        throw new Error('todo')
      }
    )
  }
}