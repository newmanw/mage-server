import { PageOf, PagingParameters } from '../../entities/entities.global'
import { LocalStaticIconStub, StaticIcon, StaticIconId, StaticIconReference } from '../../entities/icons/entities.icons'
import { EntityNotFoundError, InvalidInputError, PermissionDeniedError } from '../app.api.errors'
import { AppRequest, AppRequestContext, AppResponse } from '../app.api.global'

export interface CreateLocalStaticIconRequest extends AppRequest {
  iconInfo: LocalStaticIconStub
  iconContent: NodeJS.ReadableStream
}

export interface CreateLocalStaticIcon {
  (req: CreateLocalStaticIconRequest): Promise<AppResponse<StaticIcon, PermissionDeniedError | InvalidInputError>>
}

export interface GetStaticIconRequest extends AppRequest {
  iconRef: StaticIconReference
}

export interface GetStaticIcon {
  (req: GetStaticIconRequest): Promise<AppResponse<StaticIcon, PermissionDeniedError | EntityNotFoundError | InvalidInputError>>
}

export interface GetStaticIconContentRequest extends AppRequest {
  iconId: StaticIconId
}

export interface GetStaticIconContent {
  (req: GetStaticIconContentRequest): Promise<AppResponse<NodeJS.ReadableStream, PermissionDeniedError | EntityNotFoundError>>
}
export interface ListStaticIconsRequest extends AppRequest {
  // TODO: full-text search on title, file name, tag, etc.
  searchText?: string
  paging?: Partial<PagingParameters>
}

export interface ListStaticIcons {
  (req: ListStaticIconsRequest): Promise<AppResponse<PageOf<StaticIcon>, PermissionDeniedError>>
}

export interface StaticIconPermissionsService {
  ensureCreateStaticIconPermission(context: AppRequestContext): Promise<null | PermissionDeniedError>
  ensureGetStaticIconContentPermission(context: AppRequestContext): Promise<null | PermissionDeniedError>
}