import { FeedServiceTypeRepository, FeedServiceRepository, FeedTopic, FeedService, InvalidServiceConfigError, FeedContent, Feed, FeedTopicId, FeedServiceConnection, FeedRepository, FeedCreateAttrs, FeedMinimalAttrs, FeedServiceType } from '../../entities/feeds/entities.feeds';
import * as api from '../../app.api/feeds/app.api.feeds'
import { AppRequest, KnownErrorsOf, withPermission, AppResponse } from '../../app.api/app.api.global'
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError, entityNotFound, invalidInput, MageError, ErrInvalidInput, KeyPathError } from '../../app.api/app.api.global.errors'
import { FeedServiceTypeDescriptor } from '../../app.api/feeds/app.api.feeds'
import { JsonSchemaService, JsonValidator } from '../../entities/entities.global.json'


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
        const conn = serviceType.createConnection(service.config)
        return await conn.fetchAvailableTopics()
      }
    )
  }
}

type CreateFeedDependencies = {
  serviceTypeRepo: FeedServiceTypeRepository,
  serviceRepo: FeedServiceRepository,
  jsonSchemaService: JsonSchemaService,
}

type FeedFetchContext = {
  serviceType: FeedServiceType,
  service: FeedService,
  topic: FeedTopic,
  conn: FeedServiceConnection,
  variableParamsValidator?: JsonValidator,
}

interface WithFeedFetchContext<R> {
  then(createFeedOp: (context: FeedFetchContext) => Promise<R>): () => Promise<EntityNotFoundError | InvalidInputError | R>
}

function buildFeedCreateContext<R>(feedStub: FeedMinimalAttrs, deps: CreateFeedDependencies): WithFeedFetchContext<R> {
  return {
    then(createFeedOp: (context: FeedFetchContext) => Promise<R>): () => Promise<EntityNotFoundError | InvalidInputError | R> {
      return async (): Promise<EntityNotFoundError | InvalidInputError | R> => {
        const service = await deps.serviceRepo.findById(feedStub.service)
        if (!service) {
          return entityNotFound(feedStub.service, 'FeedService')
        }
        const serviceType = await deps.serviceTypeRepo.findById(service.serviceType)
        if (!serviceType) {
          return entityNotFound(service.serviceType, 'FeedServiceType')
        }
        const conn = serviceType.createConnection(service.config)
        const topics = await conn.fetchAvailableTopics()
        const topic = topics.find(x => x.id === feedStub.topic)
        if (!topic) {
          return entityNotFound(feedStub.topic, 'FeedTopic')
        }
        let variableParamsValidator: JsonValidator | undefined = undefined
        if (feedStub.variableParamsSchema) {
          try {
            variableParamsValidator = await deps.jsonSchemaService.validateSchema(feedStub.variableParamsSchema)
          }
          catch (err) {
            return invalidInput('invalid variable parameters schema', [ err, 'feed', 'variableParamsSchema' ])
          }
        }
        return await createFeedOp({ serviceType, service, topic, conn, variableParamsValidator })
      }
    }
  }
}

export function PreviewFeed(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository, jsonSchemaService: JsonSchemaService): api.PreviewFeed {
  return async function previewFeed(req: api.PreviewFeedRequest): ReturnType<api.PreviewFeed> {
    const reqFeed = req.feed
    return await withPermission<api.FeedPreview, KnownErrorsOf<api.PreviewFeed>>(
      permissionService.ensureCreateFeedPermissionFor(req.context, reqFeed.service),
      buildFeedCreateContext<api.FeedPreview | InvalidInputError>(reqFeed, { serviceTypeRepo, serviceRepo, jsonSchemaService })
        .then(async (context: FeedFetchContext): Promise<api.FeedPreview | InvalidInputError> => {
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
          const previewCreateAttrs = FeedCreateAttrs(context.topic, reqFeed)
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
      buildFeedCreateContext<Feed>(reqFeed, { serviceRepo, serviceTypeRepo, jsonSchemaService })
        .then(async (context: FeedFetchContext): Promise<Feed> => {
          const feedAttrs = FeedCreateAttrs(context.topic, reqFeed)
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

export function FetchFeedContent(permissionService: api.FeedsPermissionService, serviceTypeRepo: FeedServiceTypeRepository, serviceRepo: FeedServiceRepository, feedRepo: FeedRepository, jsonSchemaService: JsonSchemaService): api.FetchFeedContent {
  return async function fetchFeedContent(req: api.FetchFeedContentRequest): ReturnType<api.FetchFeedContent> {
    const feed = await feedRepo.findById(req.feed)
    if (!feed) {
      return AppResponse.error<FeedContent, EntityNotFoundError>(entityNotFound(req.feed, 'Feed'))
    }
    const service = await serviceRepo.findById(feed.service)
    if (!service) {
      return AppResponse.error<FeedContent, EntityNotFoundError>(entityNotFound(feed.service, 'FeedService'))
    }
    const serviceType = await serviceTypeRepo.findById(service.serviceType)
    if (!serviceType) {
      return AppResponse.error<FeedContent, EntityNotFoundError>(entityNotFound(service.serviceType, 'FeedServiceType'))
    }
    const conn = serviceType.createConnection(service.config)
    let params = req.variableParams || {}
    params = Object.assign(params, feed.constantParams || {})
    const content = await conn.fetchTopicContent(feed.topic, params)
    return AppResponse.success({ ...content, feed: feed.id, variableParams: req.variableParams })
  }
}

function invalidInputServiceConfig(err: InvalidServiceConfigError, ...configKey: string[]): InvalidInputError {
  const problems = err.data?.invalidKeys.map(invalidKey => {
    return [ `${invalidKey} is invalid`, ...configKey, invalidKey ] as KeyPathError
  }) || [[ err.message, 'config' ]]
  return invalidInput(`invalid service config: ${err.message}`, ...problems)
}