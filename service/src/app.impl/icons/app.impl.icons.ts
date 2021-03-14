import { URL } from 'url'
import { invalidInput } from '../../app.api/app.api.errors'
import { KnownErrorsOf, withPermission } from '../../app.api/app.api.global'
import { CreateLocalStaticIcon, CreateLocalStaticIconRequest, ListStaticIcons, ListStaticIconsRequest, GetStaticIcon, GetStaticIconContent, GetStaticIconContentRequest, GetStaticIconRequest, StaticIconPermissionsService } from '../../app.api/icons/app.api.icons'
import { StaticIcon, StaticIconReference, StaticIconRepository } from '../../entities/icons/entities.icons'


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

export function GetStaticIcon(permissions: StaticIconPermissionsService, repo: StaticIconRepository): GetStaticIcon {
  return function getStaticIcon(req: GetStaticIconRequest): ReturnType<GetStaticIcon> {
    return withPermission<StaticIcon | null, KnownErrorsOf<GetStaticIcon>>(
      permissions.ensureGetStaticIconPermission(req.context),
      async () => {
        let ref = req.iconRef
        if (typeof ref.sourceUrl === 'string') {
          try {
            ref = { sourceUrl: new URL(ref.sourceUrl) }
          }
          catch (err) {
            return invalidInput('invalid icon source url', [ `invalid url: ${ref.sourceUrl}`, 'iconRef', 'sourceUrl' ])
          }
        }
        return await repo.findByReference(ref as StaticIconReference)
      }
    )
  }
}

export function GetStaticIconContent(permissions: StaticIconPermissionsService): GetStaticIconContent {
  return function getStaticIconContent(req: GetStaticIconContentRequest): ReturnType<GetStaticIconContent> {
    return withPermission(
      permissions.ensureGetStaticIconPermission(req.context),
      () => {
        throw new Error('todo')
      }
    )
  }
}

export function FindStaticIcons(permissions: StaticIconPermissionsService): ListStaticIcons {
  return function findStaticIcons(req: ListStaticIconsRequest): ReturnType<ListStaticIcons> {
    return withPermission(
      permissions.ensureGetStaticIconPermission(req.context),
      () => {
        throw new Error('todo')
      }
    )
  }
}