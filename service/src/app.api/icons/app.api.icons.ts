import { PagingParameters } from '../../entities/entities.global'
import { LocalStaticIconStub, StaticIcon, StaticIconId } from '../../entities/icons/entities.icons'
import { EntityNotFoundError, InvalidInputError, PermissionDeniedError } from '../app.api.errors'
import { AppRequest, AppRequestContext, AppResponse } from '../app.api.global'

export interface CreateLocalStaticIconRequest extends AppRequest {
  iconInfo: LocalStaticIconStub
  iconContent: NodeJS.ReadableStream
}

export interface CreateLocalStaticIcon {
  (req: CreateLocalStaticIconRequest): Promise<AppResponse<StaticIcon, PermissionDeniedError | InvalidInputError>>
}

export interface GetStaticIconContentRequest extends AppRequest {
  iconId: StaticIconId
}

export interface GetStaticIconContent {
  (req: GetStaticIconContentRequest): Promise<AppResponse<NodeJS.ReadableStream, PermissionDeniedError | EntityNotFoundError>>
}

export interface StaticIconPage {
  paging: PagingParameters
  icons: StaticIcon[]
}

export interface FindStaticIconsRequest extends AppRequest {
  // TODO: full-text search on title, file name, tag, etc.
  paging?: PagingParameters
}

export interface FindStaticIcons {
  (req: FindStaticIconsRequest): Promise<AppResponse<StaticIconPage, PermissionDeniedError>>
}

export interface StaticIconPermissionsService {
  ensureCreateStaticIconPermission(context: AppRequestContext): Promise<null | PermissionDeniedError>
  ensureGetStaticIconContentPermission(context: AppRequestContext): Promise<null | PermissionDeniedError>
}