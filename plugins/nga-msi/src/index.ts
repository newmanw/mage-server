
import { FeedServiceType } from "@ngageoint/mage.service/lib/entities/feeds/entities.feeds"

import { FeedsPluginHooks  } from '@ngageoint/mage.service/lib/entities/feeds/entities.feeds'
import * as MSI from './nga-msi'

const hooks: FeedsPluginHooks = {
  feeds: {
    async loadServiceTypes(): Promise<FeedServiceType[]> {
      return [
        new MSI.MsiServiceType()
      ]
    }
  }
}

export = hooks