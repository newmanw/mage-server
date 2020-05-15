import { FeedType, Feed, FeedId, FeedContent } from '../../entities/feeds/entities.feeds';
import * as api from '../../app.api/feeds/app.api.feeds'
import { MageError, MageErrorCode } from '../../application/app.global.errors';
import { UserId } from '../../entities/authn/entities.authn';
import { AuthenticatedRequest } from '../../app.api/app.api.global';


export function ListFeedTypes(repo: FeedTypeRepository, permissionService: FeedsPermissionService): api.ListFeedTypes {
  return async function(req: AuthenticatedRequest): ReturnType<api.ListFeedTypes> {
    await permissionService.ensureListTypesPermissionFor(req.user)
    return await repo.readAll()
  }
}

export function CreateFeed(feedTypeRepo: FeedTypeRepository, feedRepo: FeedRepository, permissionService: FeedsPermissionService): api.CreateFeed {
  return async function createSource(req: api.CreateFeedRequest): ReturnType<api.CreateFeed> {
    await permissionService.ensureCreateFeedPermissionFor(req.user)
    if (!req.feedType) {
      throw new MageError(MageErrorCode.InvalidInput)
    }
    const feedType = await feedTypeRepo.findById(req.feedType)
    if (!feedType) {
      throw new MageError(MageErrorCode.InvalidInput)
    }
    const feedAttrs = { ...req }
    delete feedAttrs.user
    return await feedRepo.create(req)
  }
}

export function PreviewFeedContent(repo: FeedTypeRepository, permissionService: FeedsPermissionService): api.PreviewFeedContent {
  return async function previewFeedContent(req: api.PreviewFeedContentRequest): Promise<FeedContent> {
    throw new Error('todo')
  }
}

export interface FeedTypeRepository {
  readAll(): Promise<FeedType[]>
  /**
   * Resolve null if no adapter descriptor with the given ID exists.
   * @param adapterId
   */
  findById(adapterId: string): Promise<FeedType | null>
  removeById(adapterId: string): Promise<void>
}

export interface FeedRepository {
  create(feedAttrs: Partial<Feed>): Promise<Feed>
  readAll(): Promise<Feed[]>
  findById(feedId: FeedId): Promise<FeedId | null>
}

export interface FeedsPermissionService {
  ensureListTypesPermissionFor(user: UserId): Promise<void>
  ensureCreateFeedPermissionFor(user: UserId): Promise<void>
}