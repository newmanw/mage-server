import hooks from './index'
import { MsiServiceType } from './nga-msi'

describe('msi feeds plugin hooks', function() {

  it('provides the service type', async function() {

    const serviceTypes = await hooks.feeds.loadServiceTypes()

    expect(serviceTypes).toHaveLength(1)
    expect(serviceTypes[0]).toBeInstanceOf(MsiServiceType)
  })
})

describe('end to end', function() {

  it('fetches asam', async function() {

    const serviceTypes = await hooks.feeds.loadServiceTypes()
    const serviceType = serviceTypes[0]
    const conn = serviceType.createConnection('https://msi.gs.mil')
    const content = await conn.fetchTopicContent('asam', { newerThanDays: 60 })
    console.log(JSON.stringify(content, null, 2))
  })
})