import { AppRequest, AppResponse, Descriptor, AppRequestContext, KnownErrorsOf } from '../app.api.global'
import { FeedService, FeedTopic, FeedContent, FeedId, FeedServiceTypeId, FeedServiceId, Feed, FeedServiceType, FeedContentParams, FeedCreateMinimal, FeedUpdateMinimal, FeedCreateAttrs } from '../../entities/feeds/entities.feeds'
import { Json, JsonObject } from '../../entities/entities.json_types'
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError } from '../app.api.errors'


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

export interface GetFeedServiceRequest extends AppRequest {
  service: FeedServiceId
}

export type FeedServiceExpanded = Omit<FeedService, 'serviceType'> & { serviceType: FeedServiceTypeDescriptor }

export interface GetFeedService {
  (req: GetFeedServiceRequest): Promise<AppResponse<FeedServiceExpanded, PermissionDeniedError | EntityNotFoundError>>
}

export interface DeleteFeedServiceRequest extends AppRequest {
  service: FeedServiceId
}

export interface DeleteFeedService {
  (req: DeleteFeedServiceRequest): Promise<AppResponse<true, PermissionDeniedError | EntityNotFoundError>>
}

export interface ListServiceTopicsRequest extends AppRequest {
  service: FeedServiceId
}

export interface ListServiceTopics {
  (req: ListServiceTopicsRequest): Promise<AppResponse<FeedTopic[], PermissionDeniedError | EntityNotFoundError>>
}

export interface CreateFeedRequest extends AppRequest {
  feed: FeedCreateMinimal
}

export interface PreviewFeedRequest extends CreateFeedRequest {
  skipContentFetch?: boolean
  variableParams?: FeedContentParams
}

export interface FeedPreview {
  feed: FeedCreateAttrs
  content?: FeedContent & { feed: 'preview' }
}

export interface PreviewFeed {
  (req: PreviewFeedRequest): Promise<AppResponse<FeedPreview, KnownErrorsOf<CreateFeed>>>
}

export interface CreateFeed {
  (req: CreateFeedRequest): Promise<AppResponse<FeedExpanded, PermissionDeniedError | EntityNotFoundError | InvalidInputError>>
}

export interface ListAllFeeds {
  (req: AppRequest): Promise<AppResponse<Feed[], PermissionDeniedError>>
}

export interface ListServiceFeedsRequest extends AppRequest {
  service: FeedServiceId
}

export interface ListServiceFeeds {
  (req: ListServiceFeedsRequest): Promise<AppResponse<Feed[], PermissionDeniedError | EntityNotFoundError>>
}

export interface GetFeedRequest extends AppRequest {
  feed: FeedId
}

export type FeedExpanded = Omit<Feed, 'service' | 'topic'> & {
  service: FeedService,
  topic: FeedTopic
}

export interface GetFeed {
  (req: GetFeedRequest): Promise<AppResponse<FeedExpanded, PermissionDeniedError | EntityNotFoundError>>
}

export interface UpdateFeedRequest extends AppRequest {
  feed: FeedUpdateMinimal
}

export interface UpdateFeed {
  (req: UpdateFeedRequest): Promise<AppResponse<FeedExpanded, PermissionDeniedError | EntityNotFoundError | InvalidInputError>>
}

export interface DeleteFeedRequest extends AppRequest {
  feed: FeedId
}

export interface DeleteFeed {
  (req: DeleteFeedRequest): Promise<AppResponse<true, PermissionDeniedError | EntityNotFoundError>>
}

export interface FetchFeedContentRequest extends AppRequest {
  feed: FeedId,
  variableParams?: FeedContentParams
}

export interface FetchFeedContent {
  (req: FetchFeedContentRequest): Promise<AppResponse<FeedContent, PermissionDeniedError | EntityNotFoundError>>
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
  ensureCreateFeedPermissionFor(context: AppRequestContext, service: FeedServiceId): Promise<PermissionDeniedError | null>
  ensureListAllFeedsPermissionFor(context: AppRequestContext): Promise<PermissionDeniedError | null>
  ensureFetchFeedContentPermissionFor(context: AppRequestContext, feed: FeedId): Promise<PermissionDeniedError | null>
}