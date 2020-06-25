
import { FeedServiceType, FeedServiceConnection, FeedServiceTypeId, FeedTopic, FeedServiceInfo, InvalidServiceConfigError, FeedTopicId, FeedsError, ErrInvalidServiceConfig, FeedServiceTypeUnregistered } from "@ngageoint/mage.service/lib/entities/feeds/entities.feeds"
import { Json, JSONSchema6 } from '@ngageoint/mage.service/lib/entities/entities.global.json'
import * as Asam from './topics/asam'

/**
 * MSI is NGA's Maritime Safety Information API.
 */
export class MsiServiceType implements FeedServiceType {

  readonly id: FeedServiceTypeId = FeedServiceTypeUnregistered
  readonly pluginServiceTypeId: string = 'nga-msi'
  readonly title: string = 'NGA MSI'
  readonly summary: string = 'NGA Maritime Safety Information service'
  readonly configSchema: JSONSchema6 = {
    type: 'string',
    title: 'URL',
    description: "The base URL of a service that implements NGA's MSI OpenAPI definition",
    default: 'https://msi.gs.mil/'
  }

  async validateServiceConfig(config: Json): Promise<null | InvalidServiceConfigError> {
    return typeof config === 'string' ? null : new FeedsError(ErrInvalidServiceConfig, { invalidKeys: [], config })
  }

  createConnection(config: Json): FeedServiceConnection {
    return new MsiConnection(config as string)
  }
}

const topics: Map<string, FeedTopic> = new Map<FeedTopicId, FeedTopic>([
  [ Asam.topic.id, Asam.topic ],
])

class MsiConnection implements FeedServiceConnection {

  constructor(readonly url: string) {}

  fetchServiceInfo(): Promise<FeedServiceInfo> {
    throw new Error('Method not implemented.')
  }

  async fetchAvailableTopics(): Promise<FeedTopic[]> {
    return Array.from(topics.values())
  }
}
