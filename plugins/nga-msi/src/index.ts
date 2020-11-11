
import { FeedServiceType } from "@ngageoint/mage.service/lib/entities/feeds/entities.feeds"
import { FeedsPluginHooks  } from '@ngageoint/mage.service/lib/entities/feeds/entities.feeds'
import { IconPluginHooks, PluginStaticIcon } from '@ngageoint/mage.service/lib/entities/icons/entities.icons'
import * as MSI from './nga-msi'
import { AxiosMsiTransport } from './transport.axios'

const transport = new AxiosMsiTransport()

const hooks: FeedsPluginHooks & IconPluginHooks = {
  feeds: {
    async loadServiceTypes(): Promise<FeedServiceType[]> {
      return [
        new MSI.MsiServiceType(transport)
      ]
    }
  },
  icons: {
    async loadPluginStaticIcons(): Promise<PluginStaticIcon[]> {
      return [
        {
          pluginRelativePath: 'icons/asam.png',
          title: 'ASAM',
          imageType: 'raster',
          mediaType: 'image/png',
          fileName: 'asam.png',
          sizePixels: { width: 60, height: 60 },
          sizeBytes: 1684,
          tags: [],
        }
      ]
    }
  }
}

export = hooks