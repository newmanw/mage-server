
import { Json } from '../entities.global.json'
import { FeatureCollection } from 'geojson'
import { JSONSchema6 } from 'json-schema'
import { Descriptor } from '../../app.api/app.api.global'

export const ErrInvalidServiceConfig = Symbol.for('err.feeds.invalid_service_config')

export class FeedsError<Code extends symbol, Data> extends Error {
  constructor(readonly code: Code, readonly data?: Data) {
    super(Symbol.keyFor(code))
  }
}

export class InvalidServiceConfigErrorData {
  constructor(readonly invalidKeys: string[]) {}
}

export type InvalidServiceConfigError = FeedsError<typeof ErrInvalidServiceConfig, InvalidServiceConfigErrorData>

export type FeedServiceTypeId = string

export interface FeedServiceType {
  readonly id: FeedServiceTypeId
  readonly title: string
  readonly summary: string | null
  readonly configSchema: JSONSchema6

  validateServiceConfig(config: Json): Promise<null | InvalidServiceConfigError>
  instantiateService(config: Json): FeedService
}

export type FeedServiceId = string

export interface FeedServiceInfo {
  readonly title: string
  readonly summary: string
}

export interface FeedServiceDescriptor extends Descriptor<'FeedService'> {
  id: FeedServiceId
  serviceType: FeedServiceTypeId
  title: string
  summary: string | null
  config: Json
}

export interface FeedService {
  title?: string
  summary?: string
  fetchServiceInfo(): Promise<FeedServiceInfo | null>
  fetchAvailableTopics(): Promise<FeedTopic[]>
}

export interface FeedServiceTypeRepository {
  findAll(): Promise<FeedServiceType[]>
  findById(serviceTypeId: FeedServiceTypeId): Promise<FeedServiceType | null>
  // removeById(adapterId: string): Promise<void>
}

export type FeedServiceCreateAttrs = Pick<FeedServiceDescriptor,
  | 'serviceType'
  | 'title'
  | 'summary'
  | 'config'
  >

export interface FeedServiceRepository {
  create(feedAttrs: FeedServiceCreateAttrs): Promise<FeedServiceDescriptor>
  findAll(): Promise<FeedServiceDescriptor[]>
  findById(serviceId: FeedServiceId): Promise<FeedServiceDescriptor | null>
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
  readonly constantParamsSchema: JSONSchema6 | null
  readonly variableParamsSchema: JSONSchema6 | null
}
