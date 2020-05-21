import { AuthenticatedRequest } from '../app.api.global'
import { Feed, FeedType, FeedParams, FeedContent, FeedId, FeedServiceType, FeedServiceTypeGuid, FeedServiceGuid, FeedService } from '../../entities/feeds/entities.feeds'
import { Json } from '../../entities/entities.global.json'

export type FeedTypeGuid = string

export interface FeedServiceTypeDescriptor {
  id: string,
  title: string,
  description: string
  configSchema: Json
}

export interface ListFeedServiceTypes {
  (req: AuthenticatedRequest): Promise<FeedServiceType[]>
}

export interface CreateFeedServiceRequest extends AuthenticatedRequest {
  serviceType: FeedServiceTypeGuid
  config: Json
}

export interface CreateFeedService {
  (req: CreateFeedServiceRequest): Promise<FeedService>
}

export interface ListFeedTypes {
  (req: AuthenticatedRequest): Promise<FeedType[]>
}

export interface PreviewFeedContentRequest extends AuthenticatedRequest {
  params: FeedParams
}

export interface PreviewFeedContent {
  (req: PreviewFeedContentRequest): Promise<FeedContent>
}

export interface CreateFeedRequest extends AuthenticatedRequest {
  feedType: FeedTypeGuid,
  title: string,
  summary: string,
  constantParams: Json
  variableParams: Json
}

export interface CreateFeed {
  (req: CreateFeedRequest): Promise<Feed>
}

export interface FetchEventFeedsRequest extends AuthenticatedRequest {
  eventId: string
}

export interface FeedDescriptor {
  id: FeedId
  title: string
  summary: string
  constantParams: Json
  variableParams: Json
  variableParamsSchema: Json
}

export interface FetchEventFeeds {
  (req: FetchEventFeedsRequest): Promise<FeedDescriptor[]>
}

export interface FetchFeedContentRequest extends AuthenticatedRequest {
  feedId: FeedId,
  variableParams: Json
}

export interface FetchFeedContent {
  (req: FetchFeedContentRequest): Promise<FeedContent>
}
