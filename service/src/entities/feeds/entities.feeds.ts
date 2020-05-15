
import { Json } from '../entities.global.json'
import { FeatureCollection } from 'geojson'

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
