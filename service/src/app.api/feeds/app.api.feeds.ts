import { AppRequest, AppResponse, Descriptor, AppRequestContext } from '../app.api.global'
import { FeedService, FeedTopic, FeedContent, FeedId, FeedServiceTypeId, FeedServiceId, Feed, FeedTopicId, FeedServiceType, FeedCreateAttrs } from '../../entities/feeds/entities.feeds'
import { Json, JsonObject } from '../../entities/entities.global.json'
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError } from '../app.api.global.errors'


export interface ListFeedServiceTypes {
  (req: AppRequest): Promise<AppResponse<FeedServiceTypeDescriptor[], PermissionDeniedError>>
}

export interface PreviewTopicsRequest extends AppRequest {
  serviceType: FeedServiceTypeId
  serviceConfig: Json
}

export interface PreviewTopics {
  (req: PreviewTopicsRequest): Promise<AppResponse<FeedTopic[], PermissionDeniedError | EntityNotFoundError | InvalidInputError>>
}

export interface CreateFeedServiceRequest extends AppRequest {
  serviceType: FeedServiceTypeId
  title: string
  summary?: string | null
  config: Json
}

export interface CreateFeedService {
  (req: CreateFeedServiceRequest): Promise<AppResponse<FeedService, PermissionDeniedError | EntityNotFoundError | InvalidInputError>>
}

export interface ListFeedServices {
  (req: AppRequest): Promise<AppResponse<FeedService[], PermissionDeniedError>>
}

export interface ListServiceTopicsRequest extends AppRequest {
  service: FeedServiceId
}

export interface ListServiceTopics {
  (req: ListServiceTopicsRequest): Promise<AppResponse<FeedTopic[], PermissionDeniedError | EntityNotFoundError>>
}

export interface PreviewFeedRequest extends AppRequest {
  feed: FeedCreateAttrs
  variableParams?: Json
}

export interface PreviewFeed {
  (req: PreviewFeedRequest): Promise<AppResponse<FeedContent, PermissionDeniedError | EntityNotFoundError>>
}

export interface CreateFeedRequest extends AppRequest {
  service: FeedServiceId,
  topic: FeedTopicId
  title: string,
  summary: string,
  constantParams: Json
  variableParams: Json
}

export interface CreateFeed {
  (req: CreateFeedRequest): Promise<FeedService>
}

export interface FetchEventFeedsRequest extends AppRequest {
  eventId: string
}

export interface FetchEventFeeds {
  (req: FetchEventFeedsRequest): Promise<Feed[]>
}

export interface FetchFeedContentRequest extends AppRequest {
  feedId: FeedId,
  variableParams: Json
}

export interface FetchFeedContent {
  (req: FetchFeedContentRequest): Promise<FeedContent>
}

export interface FeedServiceTypeDescriptor extends Descriptor<'FeedServiceType'>, Pick<FeedServiceType, 'id' | 'title' | 'summary'> {
  id: string
  configSchema: JsonObject | null
}

export function FeedServiceTypeDescriptor(from: FeedServiceType): FeedServiceTypeDescriptor {
  return {
    descriptorOf: 'FeedServiceType',
    id: from.id as string,
    title: from.title,
    summary: from.summary,
    configSchema: from.configSchema as JsonObject | null
  }
}

export interface FeedServiceDescriptor extends Descriptor<'FeedService'>, Pick<FeedService, 'id' | 'serviceType' | 'title' | 'summary' | 'config'> {
  serviceType: string
}

export function FeedServiceDescriptor(from: FeedService): FeedServiceDescriptor {
  return {
    descriptorOf: 'FeedService',
    id: from.id,
    serviceType: from.serviceType as string,
    title: from.title,
    summary: from.summary,
    config: from.config
  }
}

export interface FeedsPermissionService {
  ensureListServiceTypesPermissionFor(context: AppRequestContext): Promise<PermissionDeniedError | null>
  ensureCreateServicePermissionFor(context: AppRequestContext): Promise<PermissionDeniedError | null>
  ensureListServicesPermissionFor(context: AppRequestContext): Promise<PermissionDeniedError | null>
  ensureListTopicsPermissionFor(context: AppRequestContext, service: FeedServiceId): Promise<PermissionDeniedError | null>
  ensureCreateFeedPermissionFor(context: AppRequestContext): Promise<PermissionDeniedError | null>
}