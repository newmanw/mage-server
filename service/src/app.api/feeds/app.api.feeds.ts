import { AuthenticatedRequest, AppResponse } from '../app.api.global'
import { FeedService, FeedTopic, FeedParams, FeedContent, FeedId, FeedServiceTypeId, FeedServiceDescriptor, FeedServiceId, Feed, FeedTopicId, FeedServiceTypeDescriptor } from '../../entities/feeds/entities.feeds'
import { Json } from '../../entities/entities.global.json'
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError } from '../app.api.global.errors'


export interface ListFeedServiceTypes {
  (req: AuthenticatedRequest): Promise<AppResponse<FeedServiceTypeDescriptor[], PermissionDeniedError>>
}

export interface CreateFeedServiceRequest extends AuthenticatedRequest {
  serviceType: FeedServiceTypeId
  title: string
  summary?: string | null
  config: Json
}

export interface CreateFeedService {
  (req: CreateFeedServiceRequest): Promise<AppResponse<FeedServiceDescriptor, PermissionDeniedError | EntityNotFoundError | InvalidInputError>>
}

export interface ListTopicsRequest extends AuthenticatedRequest {
  service: FeedServiceId
}

export interface ListTopics {
  (req: ListTopicsRequest): Promise<AppResponse<FeedTopic[], PermissionDeniedError | EntityNotFoundError>>
}

export interface ListFeedTypes {
  (req: AuthenticatedRequest): Promise<FeedTopic[]>
}

export interface PreviewFeedContentRequest extends AuthenticatedRequest {
  params: FeedParams
}

export interface PreviewFeedContent {
  (req: PreviewFeedContentRequest): Promise<FeedContent>
}

export interface CreateFeedRequest extends AuthenticatedRequest {
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

export interface FetchEventFeedsRequest extends AuthenticatedRequest {
  eventId: string
}

export interface FetchEventFeeds {
  (req: FetchEventFeedsRequest): Promise<Feed[]>
}

export interface FetchFeedContentRequest extends AuthenticatedRequest {
  feedId: FeedId,
  variableParams: Json
}

export interface FetchFeedContent {
  (req: FetchFeedContentRequest): Promise<FeedContent>
}
