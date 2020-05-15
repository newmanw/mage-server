import { AuthenticatedRequest } from '../app.api.global'
import { Feed, FeedType, FeedParams, FeedContent, FeedId } from '../../entities/feeds/entities.feeds'
import { Json } from '../../entities/entities.global.json'

export type FeedTypeId = string

export interface FeedTypeDescriptor {
  id: FeedTypeId
  title: string
  summary: string
  staticParams: object
  dynamicParams: object
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
  feedType: FeedTypeId,
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
