
import { Json } from '../entities.global.json'
import { FeatureCollection } from 'geojson'
import { JSONSchema6 } from 'json-schema'

export const ErrInvalidServiceConfig = Symbol.for('err.feeds.invalid_service_config')

export class FeedsError<Code extends symbol, Data> extends Error {
  constructor(readonly code: Code, readonly data?: Data) {
    super(Symbol.keyFor(code))
  }
}

export class InvalidServiceConfigData {
  constructor(readonly invalidKeys: string[]) {}
}

export type InvalidServiceConfigError = FeedsError<typeof ErrInvalidServiceConfig, InvalidServiceConfigData>

export type FeedServiceTypeId = string

export interface FeedServiceType {
  id: FeedServiceTypeId
  title: string
  description: string | null
  configSchema: JSONSchema6

  validateConfig(config: Json): Promise<null | InvalidServiceConfigError>
}

export type FeedServiceId = string

export interface FeedService {
  id: FeedServiceId
  serviceType: FeedServiceTypeId
  title: string
  description: string | null
  config: Json
}

export interface FeedServiceTypeRepository {
  findAll(): Promise<FeedServiceType[]>
  findById(serviceTypeId: FeedServiceTypeId): Promise<FeedServiceType | null>
  // removeById(adapterId: string): Promise<void>
}

export type FeedServiceCreateAttrs = Pick<FeedService,
  | 'serviceType'
  | 'title'
  | 'description'
  | 'config'
  >

export interface FeedServiceRepository {
  create(feedAttrs: FeedServiceCreateAttrs): Promise<FeedService>
  findAll(): Promise<FeedService[]>
  findById(feedId: FeedServiceId): Promise<FeedService | null>
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
}

export type FeedParams = {
  constantParams: Json,
  variableParams: Json
}

export type FeedTopicId = string

export interface FeedTopic {
  readonly id: FeedTopicId
  readonly title: string
  readonly summary: string | null
  readonly constantParamsSchema: JSONSchema6
  readonly variableParamsSchema: JSONSchema6
}
