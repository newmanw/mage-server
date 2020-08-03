
import { FeedServiceType } from "@ngageoint/mage.service/lib/entities/feeds/entities.feeds"
import { FeedsPluginHooks  } from '@ngageoint/mage.service/lib/entities/feeds/entities.feeds'
import * as MSI from './nga-msi'
import { AxiosMsiTransport } from './transport.axios'

const transport = new AxiosMsiTransport()

const hooks: FeedsPluginHooks = {
  feeds: {
    async loadServiceTypes(): Promise<FeedServiceType[]> {
      return [
        new MSI.MsiServiceType(transport)
      ]
    }
  }
}

export = hooks