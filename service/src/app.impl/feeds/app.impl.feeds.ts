import { FeedServiceTypeRepository, FeedServiceRepository, FeedTopic, FeedService, InvalidServiceConfigError, FeedContent, Feed, FeedTopicId, FeedServiceConnection, FeedRepository, FeedCreateAttrs } from '../../entities/feeds/entities.feeds';
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

type PreviewOrCreateFeedResult = ReturnType<api.CreateFeed> | ReturnType<api.PreviewFeed>
type AfterCreateFeedPreconditions = <R extends PreviewOrCreateFeedResult>(feed: Feed, service: FeedService, serviceConn: FeedServiceConnection) => R

// async function ensureCreateFeedPreconditions(
//   permissionService: api.FeedsPermissionService,
//   serviceTypeRepo: FeedServiceTypeRepository,
//   serviceRepo: FeedServiceRepository,
//   req: api.CreateFeedRequest):
//   { then: () => Promise<Feed | EntityNotFoundError> } {
//   const reqFeed = req.feed
//   return {
//     then<R>(after: AfterCreateFeedPreconditions): () => Promise<R | EntityNotFoundError> {
//       return async () => {
//         return await after(feed, service, serviceConn)
//       }
//     }
//   }
// }

export function PreviewFeed(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository): api.PreviewFeed {
  return async function previewFeed(req: api.PreviewFeedRequest): ReturnType<api.PreviewFeed> {
    const reqFeed = req.feed
    return await withPermission<api.FeedPreview, KnownErrorsOf<api.PreviewFeed>>(
      permissionService.ensureCreateFeedPermissionFor(req.context, reqFeed.service),
      async (): Promise<api.FeedPreview | EntityNotFoundError> => {
        const service = await serviceRepo.findById(reqFeed.service)
        if (!service) {
          return entityNotFound(reqFeed.service, 'FeedService')
        }
        const serviceType = await serviceTypeRepo.findById(service.serviceType)
        if (!serviceType) {
          return entityNotFound(service.serviceType, 'FeedServiceType')
        }
        const conn = serviceType.createConnection(service.config)
        const topics =  await conn.fetchAvailableTopics()
        const topic = topics.find(x => x.id === reqFeed.topic)
        if (!topic) {
          return entityNotFound(reqFeed.topic, 'FeedTopic')
        }
        const constantParams = reqFeed.constantParams || null
        const variableParams = req.variableParams || {}
        const mergedParams = Object.assign({}, variableParams, constantParams)
        const topicContent = await conn.fetchTopicContent(reqFeed.topic, mergedParams)
        const previewFeed: Feed & { id: 'preview' } = {
          id: 'preview',
          service: reqFeed.service,
          topic: topic.id,
          title: reqFeed.title || topic.title,
          summary: reqFeed.summary || topic.summary,
          constantParams,
          variableParamsSchema: reqFeed.variableParamsSchema || {},
          itemsHaveIdentity: reqFeed.itemsHaveIdentity || false,
          itemsHaveSpatialDimension: reqFeed.itemsHaveSpatialDimension || false,
          itemPrimaryProperty: reqFeed.itemPrimaryProperty,
          itemSecondaryProperty: reqFeed.itemSecondaryProperty,
          itemTemporalProperty: reqFeed.itemTemporalProperty,
          updateFrequency: reqFeed.updateFrequency || null
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
        return feedPreview
      }
    )
  }
}

export function CreateFeed(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository, feedRepo: FeedRepository): api.CreateFeed {
  return async function createFeed(req: api.CreateFeedRequest): ReturnType<api.CreateFeed> {
    const reqFeed = req.feed
    return await withPermission<Feed, KnownErrorsOf<api.CreateFeed>>(
      permissionService.ensureCreateFeedPermissionFor(req.context, reqFeed.service),
      async (): Promise<Feed | EntityNotFoundError> => {
        const service = await serviceRepo.findById(reqFeed.service)
        if (!service) {
          return entityNotFound(reqFeed.service, 'FeedService')
        }
        const serviceType = await serviceTypeRepo.findById(service.serviceType)
        if (!serviceType) {
          return entityNotFound(service.serviceType, 'FeedServiceType')
        }
        const conn = serviceType.createConnection(service.config)
        const topics =  await conn.fetchAvailableTopics()
        const topic = topics.find(x => x.id === reqFeed.topic)
        if (!topic) {
          return entityNotFound(reqFeed.topic, 'FeedTopic')
        }
        const constantParams = reqFeed.constantParams || null
        const previewFeed: FeedCreateAttrs = {
          service: reqFeed.service,
          topic: topic.id,
          title: reqFeed.title || topic.title,
          summary: reqFeed.summary || topic.summary,
          constantParams,
          variableParamsSchema: reqFeed.variableParamsSchema || {},
          itemsHaveIdentity: reqFeed.itemsHaveIdentity || false,
          itemsHaveSpatialDimension: reqFeed.itemsHaveSpatialDimension || false,
          itemPrimaryProperty: reqFeed.itemPrimaryProperty,
          itemSecondaryProperty: reqFeed.itemSecondaryProperty,
          itemTemporalProperty: reqFeed.itemTemporalProperty,
          updateFrequency: reqFeed.updateFrequency || null
        }
        const feed = await feedRepo.create(previewFeed)
        return feed
      }
    )
  }
}

function invalidInputServiceConfig(err: InvalidServiceConfigError): InvalidInputError {
  const problems = err.data?.invalidKeys || [ 'invalid service config' ]
  return invalidInput(...problems)
}