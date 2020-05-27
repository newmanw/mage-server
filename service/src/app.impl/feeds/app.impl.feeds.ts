import { FeedServiceTypeRepository, FeedServiceRepository, FeedServiceDescriptor, FeedTopic } from '../../entities/feeds/entities.feeds';
import * as api from '../../app.api/feeds/app.api.feeds'
import { UserId } from '../../entities/authn/entities.authn';
import { AuthenticatedRequest, KnownErrorsOf, withPermission, AppResponse } from '../../app.api/app.api.global';
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError, entityNotFound, invalidInput } from '../../app.api/app.api.global.errors';


export function ListFeedServiceTypes(permissionService: FeedsPermissionService, repo: FeedServiceTypeRepository): api.ListFeedServiceTypes {
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

export function CreateFeedService(permissionService: FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository): api.CreateFeedService {
  return function createFeedService(req: api.CreateFeedServiceRequest): ReturnType<api.CreateFeedService> {
    return withPermission<FeedServiceDescriptor, KnownErrorsOf<api.CreateFeedService>>(
      permissionService.ensureCreateServicePermissionFor(req.user),
      async (): Promise<FeedServiceDescriptor | EntityNotFoundError | InvalidInputError> => {
        const serviceType = await serviceTypeRepo.findById(req.serviceType)
        if (!serviceType) {
          return entityNotFound(req.serviceType, 'FeedServiceType')
        }
        const invalid = await serviceType.validateServiceConfig(req.config)
        if (invalid) {
          return invalidInput(...(invalid.data?.invalidKeys || []))
        }
        return await serviceRepo.create({
          serviceType: req.serviceType,
          title: req.title,
          description: req.description || null,
          config: req.config
        })
      }
    )
  }
}

export function ListTopics(permissionService: FeedsPermissionService, serviceRepo: FeedServiceRepository): api.ListTopics {
  return async function listTopics(req: api.ListTopicsRequest): ReturnType<api.ListTopics> {
    const service = await serviceRepo.findById(req.service)
    if (service == null) {
      return AppResponse.error<FeedTopic[], EntityNotFoundError>(entityNotFound(req.service, 'FeedServiceDescriptor'))
    }
    withPermission(
      permissionService.ensureListTopicsPermissionFor(req.user, service),
      async (): Promise<FeedTopic[]> => {
        throw new Error('todo')
      }
    )
    throw new Error('todo')
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
  ensureListTopicsPermissionFor(user: UserId, service: FeedServiceDescriptor): Promise<PermissionDeniedError | null>
  ensureCreateFeedPermissionFor(user: UserId): Promise<PermissionDeniedError | null>
}