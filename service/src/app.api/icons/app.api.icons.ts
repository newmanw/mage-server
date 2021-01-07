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

export interface StaticIconPermissionsService {
  ensureCreateStaticIconPermission(context: AppRequestContext): Promise<null | PermissionDeniedError>
  ensureGetStaticIconContentPermission(context: AppRequestContext): Promise<null | PermissionDeniedError>
}