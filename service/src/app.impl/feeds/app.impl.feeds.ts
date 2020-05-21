import { FeedServiceTypeRepository, FeedService, FeedRepository } from '../../entities/feeds/entities.feeds';
import * as api from '../../app.api/feeds/app.api.feeds'
import { UserId } from '../../entities/authn/entities.authn';
import { AuthenticatedRequest, AppResponse, withPermission } from '../../app.api/app.api.global';
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError } from '../../app.api/app.api.global.errors';


export const ListFeedServiceTypesPermission = 'feeds.listServiceTypes'
export const CreateFeedServicePermission = 'feeds.createService'

export function ListFeedServiceTypes(repo: FeedServiceTypeRepository, permissionService: FeedsPermissionService): api.ListFeedServiceTypes {
  return function listFeedServiceTypes(req: AuthenticatedRequest): ReturnType<api.ListFeedServiceTypes> {
    return withPermission(permissionService.ensureListServiceTypesPermissionFor(req.user))
      .perform(() => repo.findAll())
  }
}

export function CreateFeedService(permissionService: FeedsPermissionService): api.CreateFeedService {
  return function createFeedService(req: api.CreateFeedServiceRequest): Promise<AppResponse<FeedService,
    PermissionDeniedError | EntityNotFoundError | InvalidInputError>> {
    return withPermission(permissionService.ensureCreateServicePermissionFor(req.user))
      .perform(async (): Promise<FeedService> => {
        throw new Error('todo')
      })
  }
}

export function CreateFeed(feedTypeRepo: FeedServiceTypeRepository, feedRepo: FeedRepository, permissionService: FeedsPermissionService): api.CreateFeed {
  return async function createSource(req: api.CreateFeedRequest): ReturnType<api.CreateFeed> {
    throw new Error('todo')
    // await permissionService.ensureCreateFeedPermissionFor(req.user)
    // if (!req.feedType) {
    //   throw new MageError(MageErrorCode.InvalidInput)
    // }
    // const feedType = await feedTypeRepo.findById(req.feedType)
    // if (!feedType) {
    //   throw new MageError(MageErrorCode.InvalidInput)
    // }
    // const feedAttrs = { ...req }
    // delete feedAttrs.user
    // return await feedRepo.create(req)
  }
}

export interface FeedsPermissionService {
  ensureListServiceTypesPermissionFor(user: UserId): Promise<PermissionDeniedError | null>
  ensureCreateServicePermissionFor(user: UserId): Promise<PermissionDeniedError | null>
  ensureCreateFeedPermissionFor(user: UserId): Promise<PermissionDeniedError | null>
}