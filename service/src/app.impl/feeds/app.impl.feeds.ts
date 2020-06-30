import { FeedServiceTypeRepository, FeedServiceRepository, FeedTopic, FeedService, InvalidServiceConfigError, FeedContent, Feed, FeedTopicId } from '../../entities/feeds/entities.feeds';
import * as api from '../../app.api/feeds/app.api.feeds'
import { AppRequest, KnownErrorsOf, withPermission, AppResponse } from '../../app.api/app.api.global'
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError, entityNotFound, invalidInput } from '../../app.api/app.api.global.errors'
import { FeedServiceTypeDescriptor } from '../../app.api/feeds/app.api.feeds'


export function ListFeedServiceTypes(permissionService: api.FeedsPermissionService, repo: FeedServiceTypeRepository): api.ListFeedServiceTypes {
  return function listFeedServiceTypes(req: AppRequest): ReturnType<api.ListFeedServiceTypes> {
    return withPermission(
      permissionService.ensureListServiceTypesPermissionFor(req.context),
      async () => {
        const all = await repo.findAll()
        return all.map(x => FeedServiceTypeDescriptor(x))
      }
    )
  }
}

export function PreviewTopics(permissionService: api.FeedsPermissionService, repo: FeedServiceTypeRepository): api.PreviewTopics {
  return function previewTopics(req: api.PreviewTopicsRequest): ReturnType<api.PreviewTopics> {
    return withPermission<FeedTopic[], KnownErrorsOf<api.PreviewTopics>>(
      permissionService.ensureCreateServicePermissionFor(req.context),
      async (): Promise<FeedTopic[] | PermissionDeniedError | EntityNotFoundError | InvalidInputError> => {
        const serviceType = await repo.findById(req.serviceType)
        if (!serviceType) {
          return entityNotFound(req.serviceType, 'FeedServiceType')
        }
        const invalid = await serviceType.validateServiceConfig(req.serviceConfig)
        if (invalid) {
          return invalidInputServiceConfig(invalid)
        }
        const conn = serviceType.createConnection(req.serviceConfig)
        return await conn.fetchAvailableTopics()
      }
    )
  }
}

export function CreateFeedService(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository): api.CreateFeedService {
  return function createFeedService(req: api.CreateFeedServiceRequest): ReturnType<api.CreateFeedService> {
    return withPermission<FeedService, KnownErrorsOf<api.CreateFeedService>>(
      permissionService.ensureCreateServicePermissionFor(req.context),
      async (): Promise<FeedService | EntityNotFoundError | InvalidInputError> => {
        const serviceType = await serviceTypeRepo.findById(req.serviceType)
        if (!serviceType) {
          return entityNotFound(req.serviceType, 'FeedServiceType')
        }
        const invalid = await serviceType.validateServiceConfig(req.config)
        if (invalid) {
          return invalidInputServiceConfig(invalid)
        }
        return await serviceRepo.create({
          serviceType: req.serviceType,
          title: req.title,
          summary: req.summary || null,
          config: req.config
        })
      }
    )
  }
}

export function ListFeedServices(permissionService: api.FeedsPermissionService, serviceRepo: FeedServiceRepository): api.ListFeedServices {
  return function listFeedServices(req: AppRequest): ReturnType<api.ListFeedServices> {
    return withPermission<FeedService[], KnownErrorsOf<api.ListFeedServices>>(
      permissionService.ensureListServicesPermissionFor(req.context),
      async (): Promise<FeedService[]> => {
        return await serviceRepo.findAll()
      }
    )
  }
}

export function ListServiceTopics(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository): api.ListServiceTopics {
  return async function listTopics(req: api.ListServiceTopicsRequest): ReturnType<api.ListServiceTopics> {
    const service = await serviceRepo.findById(req.service)
    if (!service) {
      return AppResponse.error<FeedTopic[], EntityNotFoundError>(entityNotFound(req.service, 'FeedService'))
    }
    const serviceType = await serviceTypeRepo.findById(service.serviceType)
    if (!serviceType) {
      return AppResponse.error<FeedTopic[], EntityNotFoundError>(entityNotFound(service.serviceType, 'FeedServiceType'))
    }
    return await withPermission<FeedTopic[], KnownErrorsOf<api.ListServiceTopics>>(
      permissionService.ensureListTopicsPermissionFor(req.context, service.id),
      async (): Promise<FeedTopic[] | EntityNotFoundError> => {
        const conn = serviceType.createConnection(service.config)
        return await conn.fetchAvailableTopics()
      }
    )
  }
}

export function PreviewFeed(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository): api.PreviewFeed {
  return async function previewFeed(req: api.PreviewFeedRequest): ReturnType<api.PreviewFeed> {
    const feed = req.feed
    const service = await serviceRepo.findById(feed.service)
    if (!service) {
      return AppResponse.error<api.FeedPreview, EntityNotFoundError>(entityNotFound(feed.service, 'FeedService'))
    }
    const serviceType = await serviceTypeRepo.findById(service.serviceType)
    if (!serviceType) {
      return AppResponse.error<api.FeedPreview, EntityNotFoundError>(entityNotFound(service.serviceType, 'FeedServiceType'))
    }
    const conn = serviceType.createConnection(service.config)
    const topics =  await conn.fetchAvailableTopics()
    const topic = topics.find(x => x.id === feed.topic)
    if (!topic) {
      return AppResponse.error<api.FeedPreview, EntityNotFoundError>(entityNotFound(feed.topic, 'FeedTopic'))
    }
    const constantParams = feed.constantParams || null
    const variableParams = req.variableParams || {}
    const mergedParams = Object.assign({}, variableParams, constantParams)
    const topicContent = await conn.fetchTopicContent(feed.topic, mergedParams)
    const previewFeed: Feed & { id: 'preview' } = {
      id: 'preview',
      service: feed.service,
      topic: topic.id,
      title: feed.title || topic.title,
      summary: feed.summary || topic.summary,
      constantParams,
      variableParamsSchema: feed.variableParamsSchema || {},
      itemsHaveIdentity: feed.itemsHaveIdentity || false,
      itemsHaveSpatialDimension: feed.itemsHaveSpatialDimension || false,
      itemPrimaryProperty: feed.itemPrimaryProperty,
      itemSecondaryProperty: feed.itemSecondaryProperty,
      itemTemporalProperty: feed.itemTemporalProperty,
      updateFrequency: feed.updateFrequency || null
    }
    const previewContent: FeedContent & { feed: 'preview' } = {
      feed: 'preview',
      topic: topicContent.topic,
      variableParams: req.variableParams || null,
      items: topicContent.items,
    }
    if (topicContent.pageCursor) {
      previewContent.pageCursor = topicContent.pageCursor
    }
    const feedPreview: api.FeedPreview = {
      feed: previewFeed,
      content: previewContent,
    }
    return AppResponse.success<api.FeedPreview, unknown>(feedPreview)
  }
}

export function CreateFeed(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository): api.CreateFeed {
  return async function createFeed(req: api.CreateFeedRequest): ReturnType<api.CreateFeed> {
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

function invalidInputServiceConfig(err: InvalidServiceConfigError): InvalidInputError {
  const problems = err.data?.invalidKeys || [ 'invalid service config' ]
  return invalidInput(...problems)
}