import { FeedType, Feed, FeedId, FeedContent, FeedServiceTypeRepository, FeedService, FeedRepository } from '../../entities/feeds/entities.feeds';
import * as api from '../../app.api/feeds/app.api.feeds'
import { MageError, MageErrorCode } from '../../app.api/app.api.global.errors';
import { UserId } from '../../entities/authn/entities.authn';
import { AuthenticatedRequest } from '../../app.api/app.api.global';


export function ListFeedServiceTypes(repo: FeedServiceTypeRepository, permissionService: FeedsPermissionService): api.ListFeedServiceTypes {
  return async function listFeedServiceTypes(req: AuthenticatedRequest): ReturnType<api.ListFeedServiceTypes> {
    await permissionService.ensureListServiceTypesPermissionFor(req.user)
    return await repo.findAll()
  }
}

export function CreateFeedService(): api.CreateFeedService {
  return async function createFeedService(req: api.CreateFeedServiceRequest): Promise<FeedService> {
    throw new Error('todo')
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
  ensureListServiceTypesPermissionFor(user: UserId): Promise<void>
  ensureCreateFeedPermissionFor(user: UserId): Promise<void>
}