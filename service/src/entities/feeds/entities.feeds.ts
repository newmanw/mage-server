
import { Json } from '../entities.global.json'
import { FeatureCollection } from 'geojson'

export type FeedServiceTypeGuid = string

export interface FeedServiceType {
  id: FeedServiceTypeGuid,
  title: string,
  description: string | null,
  configSchema: Json,
}

export type FeedServiceGuid = string

export interface FeedService {
  id: FeedServiceGuid
}

export interface FeedServiceTypeRepository {
  findAll(): Promise<FeedServiceType[]>
  // /**
  //  * Resolve null if no adapter descriptor with the given ID exists.
  //  * @param adapterId
  //  */
  // findById(adapterId: string): Promise<FeedType | null>
  // removeById(adapterId: string): Promise<void>
}

export interface FeedRepository {
  create(feedAttrs: Partial<Feed>): Promise<Feed>
  findAll(): Promise<Feed[]>
  findById(feedId: FeedId): Promise<Feed | null>
}

export interface FeedContent {
  readonly feed: Feed
  readonly variableParams: FeedParams
  readonly items: FeatureCollection
}

export type FeedId = string

export interface Feed {
  id: FeedId
  feedType: FeedTypeId
  title: string
  summary: string
  constantParams: Json
  variableParams: Json
}

export type FeedParams = {
  constantParams: Json,
  variableParams: Json
}

export type FeedTypeId = string

export interface FeedType {
  readonly id: FeedTypeId
  readonly title: string
  readonly summary: string | null
  readonly constantParamsSchema: Json
  readonly variableParamsSchema: Json

  previewContent(params: FeedParams): Promise<FeedContent>
  fetchContentFromFeed(feed: Feed, variableParams: Json): Promise<FeedContent>
}
