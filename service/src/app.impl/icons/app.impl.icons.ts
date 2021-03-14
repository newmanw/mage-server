import { URL } from 'url'
import { entityNotFound, invalidInput } from '../../app.api/app.api.errors'
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
        const ref = req.iconRef
        let parsedRef: StaticIconReference
        if (typeof ref.sourceUrl === 'string') {
          try {
            parsedRef = { sourceUrl: new URL(ref.sourceUrl) }
          }
          catch (err) {
            return invalidInput('invalid icon source url', [ `invalid url: ${ref.sourceUrl}`, 'iconRef', 'sourceUrl' ])
          }
        }
        else {
          parsedRef = ref as StaticIconReference
        }
        const icon = await repo.findByReference(parsedRef)
        if (icon) {
          return icon
        }
        if (parsedRef.sourceUrl) {
          return null
        }
        return entityNotFound(parsedRef.id, 'StaticIcon')
      }
    )
  }
}

export function GetStaticIconContent(permissions: StaticIconPermissionsService, repo: StaticIconRepository): GetStaticIconContent {
  return function getStaticIconContent(req: GetStaticIconContentRequest): ReturnType<GetStaticIconContent> {
    return withPermission<NodeJS.ReadableStream, KnownErrorsOf<GetStaticIconContent>>(
      permissions.ensureGetStaticIconPermission(req.context),
      async () => {
        const content = await repo.loadContent(req.iconId)
        if (content) {
          return content
        }
        return entityNotFound(req.iconId, 'StaticIcon')
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