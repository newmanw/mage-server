import { PluginStaticIcon } from '@ngageoint/mage.service/lib/entities/icons/entities.icons'
import hooks from './index'
import { MsiServiceType } from './nga-msi'

describe('msi mage plugin hooks', function() {

  describe('feeds hook', function() {

    it('provides the service type', async function() {

      const serviceTypes = await hooks.feeds.loadServiceTypes()

      expect(serviceTypes).toHaveLength(1)
      expect(serviceTypes[0]).toBeInstanceOf(MsiServiceType)
    })
  })

  describe('icons hook', function() {

    it('provides the bundled msi icons', async function() {

      const icons = await hooks.icons.loadPluginStaticIcons()

      expect(icons).toHaveLength(1)
      expect(icons[0]).toMatchObject({
        pluginRelativePath: 'icons/asam.png'
      })
    })
  })
})

xdescribe('end to end', function() {

  it('fetches asam', async function() {

    const serviceTypes = await hooks.feeds.loadServiceTypes()
    const serviceType = serviceTypes[0]
    const conn = await serviceType.createConnection('https://msi.gs.mil')
    const content = await conn.fetchTopicContent('asam', { newerThanDays: 60 })
    console.log(JSON.stringify(content, null, 2))
  })
})