import { FeedServiceTypeRepository, FeedServiceRepository, FeedTopic, FeedService, InvalidServiceConfigError, FeedContent, Feed, FeedTopicId, FeedServiceConnection, FeedRepository, normalizeFeedMinimalAttrs, FeedMinimalAttrs, FeedServiceType, FeedServiceId } from '../../entities/feeds/entities.feeds';
import * as api from '../../app.api/feeds/app.api.feeds'
import { AppRequest, KnownErrorsOf, withPermission, AppResponse } from '../../app.api/app.api.global'
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError, entityNotFound, invalidInput, MageError, ErrInvalidInput, KeyPathError } from '../../app.api/app.api.errors'
import { FeedServiceTypeDescriptor } from '../../app.api/feeds/app.api.feeds'
import { JsonSchemaService, JsonValidator, JSONSchema4, JsonObject } from '../../entities/entities.json_types'


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
          return invalidInputServiceConfig(invalid, 'serviceConfig')
        }
        const conn = await serviceType.createConnection(req.serviceConfig)
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
          return invalidInputServiceConfig(invalid, 'config')
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
        const conn = await serviceType.createConnection(service.config)
        return await conn.fetchAvailableTopics()
      }
    )
  }
}

type ContentFetchDependencies = {
  serviceTypeRepo: FeedServiceTypeRepository,
  serviceRepo: FeedServiceRepository,
  jsonSchemaService?: JsonSchemaService,
}

type ContentFetchContext = {
  serviceType: FeedServiceType,
  service: FeedService,
  topic: FeedTopic,
  conn: FeedServiceConnection,
  variableParamsValidator?: JsonValidator,
}

interface WithContentFetchContext<R> {
  then(createFeedOp: (context: ContentFetchContext) => Promise<R>): () => Promise<EntityNotFoundError | InvalidInputError | R>
}

async function buildFetchContext(deps: ContentFetchDependencies, serviceId: FeedServiceId, topicId: FeedTopicId, variableParamsSchema?: JSONSchema4): Promise<ContentFetchContext | EntityNotFoundError | InvalidInputError> {
  const service = await deps.serviceRepo.findById(serviceId)
  if (!service) {
    return entityNotFound(serviceId, 'FeedService')
  }
  const serviceType = await deps.serviceTypeRepo.findById(service.serviceType)
  if (!serviceType) {
    return entityNotFound(service.serviceType, 'FeedServiceType')
  }
  const conn = await serviceType.createConnection(service.config)
  const topics = await conn.fetchAvailableTopics()
  const topic = topics.find(x => x.id === topicId)
  if (!topic) {
    return entityNotFound(topicId, 'FeedTopic')
  }
  let variableParamsValidator: JsonValidator | undefined = undefined
  if (variableParamsSchema && deps.jsonSchemaService) {
    try {
      variableParamsValidator = await deps.jsonSchemaService.validateSchema(variableParamsSchema)
    }
    catch (err) {
      return invalidInput('invalid variable parameters schema', [ err, 'feed', 'variableParamsSchema' ])
    }
  }
  return { serviceType, service, topic, conn, variableParamsValidator }
}

interface FetchContextParams {
  service: FeedServiceId
  topic: FeedTopicId
  variableParamsSchema?: JSONSchema4
}

function withFetchContext<R>(deps: ContentFetchDependencies, { service, topic, variableParamsSchema }: FetchContextParams): WithContentFetchContext<R> {
  return {
    then(operation: (fetchContext: ContentFetchContext) => Promise<R>): () => Promise<EntityNotFoundError | InvalidInputError | R> {
      return async (): Promise<EntityNotFoundError | InvalidInputError | R> => {
        const fetchContext = await buildFetchContext(deps, service, topic, variableParamsSchema)
        if (fetchContext instanceof MageError) {
          return fetchContext
        }
        return await operation(fetchContext)
      }
    }
  }
}

export function PreviewFeed(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository, jsonSchemaService: JsonSchemaService): api.PreviewFeed {
  return async function previewFeed(req: api.PreviewFeedRequest): ReturnType<api.PreviewFeed> {
    const reqFeed = req.feed
    return await withPermission<api.FeedPreview, KnownErrorsOf<api.PreviewFeed>>(
      permissionService.ensureCreateFeedPermissionFor(req.context, reqFeed.service),
      withFetchContext<api.FeedPreview | InvalidInputError>({ serviceTypeRepo, serviceRepo, jsonSchemaService }, reqFeed)
        .then(async (context: ContentFetchContext): Promise<api.FeedPreview | InvalidInputError> => {
          const constantParams = reqFeed.constantParams || null
          const variableParams = req.variableParams || null
          if (variableParams && context.variableParamsValidator) {
            const invalid = await context.variableParamsValidator.validate(variableParams)
            if (invalid) {
              return invalidInput('invalid variable parameters', [ invalid, 'variableParams' ])
            }
          }
          const mergedParams = Object.assign({}, variableParams, constantParams)
          if (context.topic.paramsSchema) {
            const mergedParamsSchema = await jsonSchemaService.validateSchema(context.topic.paramsSchema)
            const invalid = await mergedParamsSchema.validate(mergedParams)
            if (invalid) {
              return invalidInput('invalid parameters',
                [ invalid, 'feed', 'constantParams' ],
                [ invalid, 'variableParams' ])
            }
          }
          const topicContent = await context.conn.fetchTopicContent(reqFeed.topic, mergedParams)
          const previewCreateAttrs = normalizeFeedMinimalAttrs(context.topic, reqFeed)
          const previewContent: FeedContent & { feed: 'preview' } = {
            feed: 'preview',
            topic: topicContent.topic,
            variableParams: req.variableParams,
            items: topicContent.items,
          }
          if (topicContent.pageCursor) {
            previewContent.pageCursor = topicContent.pageCursor
          }
          const feedPreview: api.FeedPreview = {
            feed: previewCreateAttrs,
            content: previewContent,
          }
          return feedPreview
        })
    )
  }
}

export function CreateFeed(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository, feedRepo: FeedRepository, jsonSchemaService: JsonSchemaService): api.CreateFeed {
  return async function createFeed(req: api.CreateFeedRequest): ReturnType<api.CreateFeed> {
    const reqFeed = req.feed
    return await withPermission<Feed, KnownErrorsOf<api.CreateFeed>>(
      permissionService.ensureCreateFeedPermissionFor(req.context, reqFeed.service),
      withFetchContext<Feed>({ serviceRepo, serviceTypeRepo, jsonSchemaService }, reqFeed)
        .then(async (context: ContentFetchContext): Promise<Feed> => {
          const feedAttrs = normalizeFeedMinimalAttrs(context.topic, reqFeed)
          const feed = await feedRepo.create(feedAttrs)
          return feed
        })
    )
  }
}

export function ListAllFeeds(permissionService: api.FeedsPermissionService, feedRepo: FeedRepository): api.ListAllFeeds {
  return async function listFeeds(req: AppRequest): ReturnType<api.ListAllFeeds> {
    return await withPermission<Feed[], KnownErrorsOf<api.ListAllFeeds>>(
      permissionService.ensureListAllFeedsPermissionFor(req.context),
      async (): Promise<Feed[]> => {
        return await feedRepo.findAll()
      }
    )
  }
}

export function GetFeed(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository, feedRepo: FeedRepository): api.GetFeed {
  return async function getFeed(req: api.GetFeedRequest): ReturnType<api.GetFeed> {
    return await withPermission<api.FeedExpanded, KnownErrorsOf<api.GetFeed>>(
      permissionService.ensureListAllFeedsPermissionFor(req.context),
      async (): Promise<api.FeedExpanded | EntityNotFoundError> => {
        const feed = await feedRepo.findById(req.feed)
        if (!feed) {
          return entityNotFound(req.feed, 'Feed')
        }
        const feedCompanions = await buildFetchContext({ serviceTypeRepo, serviceRepo }, feed.service, feed.topic)
        if (feedCompanions instanceof MageError) {
          return feedCompanions as EntityNotFoundError
        }
        return Object.assign({ ...feed }, { service: feedCompanions.service, topic: feedCompanions.topic })
      }
    )
  }
}

export function UpdateFeed(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository, feedRepo: FeedRepository): api.UpdateFeed {
  return async function updateFeed(req: api.UpdateFeedRequest): ReturnType<api.UpdateFeed> {
    const feed = await feedRepo.findById(req.feed.id)
    if (!feed) {
      return AppResponse.error<api.FeedExpanded, EntityNotFoundError>(entityNotFound(req.feed.id, 'Feed'))
    }
    return await withPermission<api.FeedExpanded, KnownErrorsOf<api.UpdateFeed>>(
      permissionService.ensureCreateFeedPermissionFor(req.context, feed.service),
      withFetchContext<api.FeedExpanded | EntityNotFoundError>({ serviceTypeRepo, serviceRepo }, { service: feed.service, topic: feed.topic }).then(
        async (fetchContext): Promise<api.FeedExpanded | EntityNotFoundError> => {
          const updateAttrs = normalizeFeedMinimalAttrs(fetchContext.topic, { ...req.feed, service: feed.service, topic: feed.topic })
          const updated = await feedRepo.update({ ...updateAttrs, id: feed.id })
          if (!updated) {
            return entityNotFound(feed.id, 'Feed', 'feed deleted before update')
          }
          return Object.assign({ ...updated }, { service: fetchContext.service, topic: fetchContext.topic })
        }
      )
    )
  }
}

export function DeleteFeed(permissionService: api.FeedsPermissionService, feedRepo: FeedRepository): api.DeleteFeed {
  return async function deleteFeed(req: api.DeleteFeedRequest): ReturnType<api.DeleteFeed> {
    throw new Error('unimplemented')
  }
}

export function FetchFeedContent(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository, feedRepo: FeedRepository, jsonSchemaService: JsonSchemaService): api.FetchFeedContent {
  return async function fetchFeedContent(req: api.FetchFeedContentRequest): ReturnType<api.FetchFeedContent> {
    return await withPermission<FeedContent, KnownErrorsOf<api.FetchFeedContent>>(
      permissionService.ensureFetchFeedContentPermissionFor(req.context, req.feed),
      async (): Promise<FeedContent | EntityNotFoundError> => {
        const feed = await feedRepo.findById(req.feed)
        if (!feed) {
          return entityNotFound(req.feed, 'Feed')
        }
        const service = await serviceRepo.findById(feed.service)
        if (!service) {
          return entityNotFound(feed.service, 'FeedService')
        }
        const serviceType = await serviceTypeRepo.findById(service.serviceType)
        if (!serviceType) {
          return entityNotFound(service.serviceType, 'FeedServiceType')
        }
        const conn = await serviceType.createConnection(service.config)
        let params = req.variableParams || {}
        params = Object.assign(params, feed.constantParams || {})
        const content = await conn.fetchTopicContent(feed.topic, params)
        return { ...content, feed: feed.id, variableParams: req.variableParams }
      }
    )
  }
}

function invalidInputServiceConfig(err: InvalidServiceConfigError, ...configKey: string[]): InvalidInputError {
  const problems = err.data?.invalidKeys.map(invalidKey => {
    return [ `${invalidKey} is invalid`, ...configKey, invalidKey ] as KeyPathError
  }) || [[ err.message, 'config' ]]
  return invalidInput(`invalid service config: ${err.message}`, ...problems)
}