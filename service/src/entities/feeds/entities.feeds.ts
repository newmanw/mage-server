
import { Json } from '../entities.global.json'
import { FeatureCollection } from 'geojson'
import { JSONSchema6 } from 'json-schema'

export const ErrInvalidServiceConfig = Symbol.for('err.feeds.invalid_service_config')

export class FeedsError<Code extends symbol, Data> extends Error {
  constructor(readonly code: Code, readonly data?: Data) {
    super(Symbol.keyFor(code))
  }
}

export interface InvalidServiceConfigErrorData {
  readonly invalidKeys: string[]
}

export type InvalidServiceConfigError = FeedsError<typeof ErrInvalidServiceConfig, InvalidServiceConfigErrorData>

export type FeedServiceTypeId = string

export interface FeedServiceType {
  readonly id: FeedServiceTypeId
  readonly title: string
  readonly summary: string | null
  readonly configSchema: JSONSchema6 | null

  validateServiceConfig(config: Json): Promise<null | InvalidServiceConfigError>
  createConnection(config: Json): FeedServiceConnection
}

export type FeedServiceId = string

export interface FeedServiceInfo {
  readonly title: string
  readonly summary: string
}

export interface FeedService {
  id: FeedServiceId
  serviceType: FeedServiceTypeId
  title: string
  summary: string | null
  config: Json
}

export interface FeedServiceConnection {
  fetchServiceInfo(): Promise<FeedServiceInfo | null>
  fetchAvailableTopics(): Promise<FeedTopic[]>
}

export interface FeedServiceTypeRepository {
  findAll(): Promise<FeedServiceType[]>
  findById(serviceTypeId: FeedServiceTypeId): Promise<FeedServiceType | null>
}

export type FeedServiceCreateAttrs = Pick<FeedService,
  | 'serviceType'
  | 'title'
  | 'summary'
  | 'config'
  >

export interface FeedServiceRepository {
  create(feedAttrs: FeedServiceCreateAttrs): Promise<FeedService>
  findAll(): Promise<FeedService[]>
  findById(serviceId: FeedServiceId): Promise<FeedService | null>
}

export interface FeedContent {
  readonly feed: FeedService
  readonly variableParams: FeedParams
  readonly items: FeatureCollection
}

export type FeedId = string

export interface Feed {
  id: FeedId
  topic: FeedTopicId
  title: string
  summary: string
  constantParams: Json
  variableParams: Json
  /**
   * A feed's update frequency is similar to the like-named property on its
   * underlying topic.  While a topic's update frequency would come from the
   * implementing plugin, a feed's update frequency would likely come from user
   * configuration based on the parameters of the feed as well as the update
   * frequency of the underlying topic.  This allows for feed service type
   * plugins that are too generic to know what an appropriate update interval
   * would be for particular service's topics.
   */
  updateFrequency: FeedUpdateFrequency | null
}

export type FeedParams = {
  constantParams: Json,
  variableParams: Json
}

export type FeedTopicId = string

export class FeedUpdateFrequency {
  constructor(readonly seconds: number) {}
}

export interface FeedTopic {
  readonly id: FeedTopicId
  readonly title: string
  readonly summary: string | null
  readonly constantParamsSchema: JSONSchema6 | null
  readonly variableParamsSchema: JSONSchema6 | null
  /**
   * A topic's update frequency is a hint about how often a service might
   * publish new data to a topic.
   */
  readonly updateFrequency: FeedUpdateFrequency | null
}
