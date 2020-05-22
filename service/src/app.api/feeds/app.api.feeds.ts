import { AuthenticatedRequest, AppResponse, Descriptor } from '../app.api.global'
import { FeedService, FeedTopic, FeedParams, FeedContent, FeedId, FeedServiceType, FeedServiceTypeId, FeedServiceId } from '../../entities/feeds/entities.feeds'
import { Json } from '../../entities/entities.global.json'
import { PermissionDeniedError, EntityNotFoundError, InvalidInputError } from '../app.api.global.errors'

export type FeedTypeGuid = string

export interface FeedServiceTypeDescriptor extends Descriptor, Pick<FeedServiceType, 'id' | 'title' | 'description' | 'configSchema'> {
  descriptorOf: 'FeedServiceType'
}

export function FeedServiceTypeDescriptor(from: FeedServiceType): FeedServiceTypeDescriptor {
  return {
    descriptorOf: 'FeedServiceType',
    id: from.id,
    title: from.title,
    description: from.description,
    configSchema: from.configSchema
  }
}

export interface ListFeedServiceTypes {
  (req: AuthenticatedRequest): Promise<AppResponse<FeedServiceTypeDescriptor[], PermissionDeniedError>>
}

export interface CreateFeedServiceRequest extends AuthenticatedRequest {
  serviceType: FeedServiceTypeId
  config: Json
}

export interface CreateFeedService {
  (req: CreateFeedServiceRequest): Promise<AppResponse<FeedService, PermissionDeniedError | EntityNotFoundError | InvalidInputError>>
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
  feedType: FeedTypeGuid,
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
