
import { Json } from '../entities.global.json'
import { FeatureCollection } from 'geojson'
import { JSONSchema6 } from 'json-schema'

interface LoadFeedServiceTypes {
  (): Promise<FeedServiceType[]>
}

/**
 * A plugin package that wishes to provide one or more [FeedServiceType]
 * implementations must implement include this interface in the top-level
 * export of the package.  For example,
 * ```
 * export = {
 *   // ... other plugin hooks
 *   feeds: {
 *     loadServiceTypes: () => Promise<FeedServiceType[]> {
 *       // resolve the service types
 *     }
 *   }
 * }
 */
export interface FeedsPluginHooks {
  feeds: {
    readonly loadServiceTypes:  LoadFeedServiceTypes
  }
}

export const ErrInvalidServiceConfig = Symbol.for('err.feeds.invalid_service_config')

export class FeedsError<Code extends symbol, Data> extends Error {
  constructor(readonly code: Code, readonly data?: Data, message?: string) {
    super(message ? message : Symbol.keyFor(code))
  }
}

export interface InvalidServiceConfigErrorData {
  readonly invalidKeys: string[]
  readonly config: Json
}

export type InvalidServiceConfigError = FeedsError<typeof ErrInvalidServiceConfig, InvalidServiceConfigErrorData>

export const FeedServiceTypeUnregistered = Symbol.for('FeedServiceTypeUnregistered')
export type FeedServiceTypeId = string | typeof FeedServiceTypeUnregistered

export interface FeedServiceType {
  readonly id: FeedServiceTypeId
  readonly pluginServiceTypeId: string
  readonly title: string
  readonly summary: string | null
  readonly configSchema: JSONSchema6 | null

  validateServiceConfig(config: Json): Promise<null | InvalidServiceConfigError>
  createConnection(config: Json): FeedServiceConnection
}

export type RegisteredFeedServiceType = FeedServiceType & { id: string }

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
  register(moduleName: string, serviceType: FeedServiceType): Promise<RegisteredFeedServiceType>
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

/** A feed ID is globally unique. */
export type FeedId = string

export interface Feed {
  id: FeedId
  topic: FeedTopicId
  title: string
  summary: string
  constantParams: Json
  /**
   * The variable parameters schema of a feed is a schema an administrative user
   * can define to advertise the parameters feed consumers can pass when
   * fetching content from a feed.  This schema could be the same as that of the
   * source  {@linkcode FeedTopic} or could be a more restrictive subset of the
   * topic schema.
   */
  variableParamsSchema: JSONSchema6
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
  /**
   * This flag is similar to the like-named property on its source
   * {@linkcode FeedTopic}, but as with {@linkcode Feed.updateFrequency}, allows
   * configuration by a human user.
   */
  itemsHaveIdentity: boolean
  itemsHaveSpatialDimension: boolean
  itemsHaveTemporalDimension: boolean
  itemPrimaryProperty: string
  itemSecondaryProperty: string | null
}

export type FeedParams = {
  constantParams: Json,
  variableParams: Json
}

/**
 * A topic ID is unique in the context the providing {@linkcode FeedService}.
 */
export type FeedTopicId = string

export class FeedUpdateFrequency {
  constructor(readonly seconds: number) {}
}

export interface FeedTopic {
  readonly id: FeedTopicId
  readonly title: string
  readonly summary: string | null
  /**
   * The constant paramters schema defines parameters that an administrative
   * user must supply when defining a feed derived from this topic.  An example
   * of a constant parameter this schema defines might be `apiKey`.
   */
  readonly constantParamsSchema?: JSONSchema6
  /**
   * The variable parameters schema defines parameters that a consuming client
   * can supply when fetching items from a feed dervied from this topic.  A
   * MAGE mobile app user could change the parameters this schema defines.  An
   * example parameter this schema defines might be `lastUpdatedTime`.
   */
  readonly variableParamsSchema?: JSONSchema6
  /**
   * A topic's update frequency is a hint about how often a service might
   * publish new data to a topic.  A value of `undefined` indicates a topic's
   * update frequency is unknown and requires configuration in a derived
   * {@linkcode Feed}.
   */
  readonly updateFrequency?: FeedUpdateFrequency
  /**
   * When feed items have identity, the `id` property of the GeoJSON feature
   * items fetched from a feed will contain a persistent unique identifier for
   * the items.  The same item across mulutiple fetches will have the same
   * `id` property value.  Consumers of feed content can then present changes as
   * updates to previously fetched items, for example updating the location of
   * a moving vehicle.  A value of `undefined` indicates a topic's item identity
   * is unknown and requires configuration in a derived {@linkcode Feed}.
   */
  readonly itemsHaveIdentity?: boolean
  /**
   * Feed items with a spatial dimension will translate to GeoJSON features with
   * non-null geometries.  A value of `undefined` indicates a topic's spatial
   * dimension is unknown and requires configuration in a derived
   * {@linkcode Feed}.
   */
  readonly itemsHaveSpatialDimension?: boolean
  /**
   * Feed items with a temporal dimension will translate to GeoJSON features
   * that have a temporal extent property called `$mage$temporalExtent.  A
   * value of `undefined` indicates a topic's temporal dimension is unknown and
   * requires configuration in a derived {@linkcode Feed}.
   */
  readonly itemsHaveTemporalDimension?: boolean
  /**
   * The primary property of a GeoJSON feature feed item is the main value that
   * should represent the item in a list view to the end user, as well as in
   * a popup on a map view.  A value of `undefined` indicates a topic's primary
   * property is unknown and requires configuration in a derived
   * {@linkcode Feed}.
   */
  readonly itemPrimaryProperty?: string
  /**
   * Simimlar to {@linkcode FeedTopic.itemPrimaryProperty}, the intent of the
   * secondary of a GeoJSON feature feed item is to indicate a value that
   * represents the item in a list or map view to the end user.  The secondary
   * property can add a bit of enhancing detail about the item to the primary
   * property.  A value of `undefined` indicates a topic's secondary property is
   * unknown and requires configuration in a derived {@linkcode Feed}.
   */
  readonly itemSecondaryProperty?: string
}
