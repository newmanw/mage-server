import { FeedServiceTypeRepository, FeedService, FeedServiceRepository, FeedsError, ErrInvalidServiceConfig, FeedServiceDescriptor } from '../../entities/feeds/entities.feeds';
import * as api from '../../app.api/feeds/app.api.feeds'
import { UserId } from '../../entities/authn/entities.authn';
import { AuthenticatedRequest, KnownErrorsOf, withPermission } from '../../app.api/app.api.global';
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError, entityNotFound, invalidInput, InvalidInputErrorData, MageError } from '../../app.api/app.api.global.errors';


export const ListFeedServiceTypesPermission = 'feeds.listServiceTypes'
export const CreateFeedServicePermission = 'feeds.createService'

export function ListFeedServiceTypes(repo: FeedServiceTypeRepository, permissionService: FeedsPermissionService): api.ListFeedServiceTypes {
  return function listFeedServiceTypes(req: AuthenticatedRequest): ReturnType<api.ListFeedServiceTypes> {
    return withPermission(
      permissionService.ensureListServiceTypesPermissionFor(req.user),
      async () => {
        const all = await repo.findAll()
        return all.map(x => api.FeedServiceTypeDescriptor(x))
      }
    )
  }
}

export function CreateFeedService(serviceTypeRepo: FeedServiceTypeRepository, permissionService: FeedsPermissionService): api.CreateFeedService {
  return function createFeedService(req: api.CreateFeedServiceRequest): ReturnType<api.CreateFeedService> {
    return withPermission<FeedServiceDescriptor, KnownErrorsOf<api.CreateFeedService>>(
      permissionService.ensureCreateServicePermissionFor(req.user),
      async (): Promise<FeedServiceDescriptor | EntityNotFoundError | InvalidInputError> => {
        const serviceType = await serviceTypeRepo.findById(req.serviceType)
        if (!serviceType) {
          return entityNotFound(req.serviceType, 'FeedServiceType')
        }
        const service = await serviceType.instantiateService(req.config)
        if (service instanceof FeedsError && service.code === ErrInvalidServiceConfig) {
          return invalidInput(...(service.data?.invalidKeys || []))
        }
        throw new Error()
      }
    )
  }
}

export function CreateFeed(feedTypeRepo: FeedServiceTypeRepository, feedRepo: FeedServiceRepository, permissionService: FeedsPermissionService): api.CreateFeed {
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