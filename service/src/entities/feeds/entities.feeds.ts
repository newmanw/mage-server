
import * as OgcApiFeatures from '../ogcapi-features/entities.ogcapi-features'
import { Json } from '../entities.global.json'

/**
 * An AdapterDescriptor represents a type of data source and the translation
 * from that data source type's data to data that MAGE can understand, and vice
 * versa.
 */
export interface AdapterDescriptor {
  id: string
  title: string
  summary: string | null
  isReadable: boolean
  isWritable: boolean
}

/**
 * A SourceDescriptor represents an actual data endpoint whose data a
 * corresponding [[AdapterDescriptor | adapter]] can retrieve and transform.
 */
export interface SourceDescriptor {
  id: string
  adapter: string | AdapterDescriptor
  title: string
  summary: string | null
  isReadable: boolean
  isWritable: boolean
  url: string
}

/**
 * The ManifoldDescriptor contains all the currently available adapters and
 * configured sources, each keyed by their IDs.
 */
export class ManifoldDescriptor {

  readonly adapters: Map<string, AdapterDescriptor> = new Map()
  readonly sources: Map<string, SourceDescriptor> = new Map()

  constructor(adapters: AdapterDescriptor[], sources: SourceDescriptor[]) {
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SourceConnection extends OgcApiFeatures.ServiceAdapter {

}

export interface ManifoldAdapter {
  getPreviewParametersForSource(sourceDesc: SourceDescriptor): Promise<Json>
  connectTo(source: SourceDescriptor): Promise<SourceConnection>
}


export interface FeedContent {
  readonly feed: Feed
  readonly fetchParams: object
  readonly feedItems: OgcApiFeatures.FeatureCollection
}

export interface Feed {
  id: string
  feedType: FeedTypeKey
  title: string
  summary: string
  staticParams: object
  dynamicParams: object
}

export interface FeedDescriptor {
  readonly id: string
  readonly title: string
  readonly summary: string
  readonly params: object
}

export type FeedTypeKey = string

type FeedParams = {
  staticParams: object,
  dynamicParams: object
}

export interface FeedType {
  readonly key: FeedTypeKey
  readonly title: string
  readonly summary: string
  readonly baseStaticParams: Readonly<object>
  readonly baseDynamicParams: Readonly<object>

  previewContent(params: FeedParams): Promise<FeedContent>
  fetchContentFromFeed(feed: Feed, params: object): Promise<FeedContent>
}

export interface FeedTypeRegistry {
  registerFeedType(desc: FeedTypeDescriptor): void
}

interface FetchEventFeedsRequest {
  userId: string
  eventId: string
}

interface FetchEventFeedsResponse {
  feeds: FeedDescriptor[]
}

interface FeedsAppService {
  fetchEventFeeds(eventId: string): Promise<Feed[]>
  fetchFeedContent(feedId: string): Promise<FeedContent>
}

interface FeedPlugin {
  initialize(): Promise<FeedType[]>
}

interface FeedTypeDescriptor {
  readonly key: FeedTypeKey,
  readonly title: string,
  readonly summary: string
}

interface FetchFeedTypesRequest {
  subject: string
}

interface FetchFeedTypesResponse {
  feedTypes: FeedTypeDescriptor[]
}

interface FeedsAdminService {
  fetchFeedTypes(request: FetchFeedTypesRequest): Promise<FetchFeedTypesResponse>
}
