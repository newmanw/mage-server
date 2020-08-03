import nock from 'nock'
import * as MSI from './nga-msi'
import * as ASAM from './topics/asam'
import { FeedsError, ErrInvalidServiceConfig, FeedTopic, FeedTopicContent } from '@ngageoint/mage.service/lib/entities/feeds/entities.feeds'


describe('msi feeds plugin hooks', function() {

  it('provides the service type', async function() {
    fail('todo')
  })
})

describe('msi service type', function() {

  const msi = new MSI.MsiServiceType()

  it('validates the service config is a string', async function() {

    let err = await msi.validateServiceConfig({ url: 'invalid' })
    expect(err).toBeInstanceOf(FeedsError)
    expect(err?.code).toEqual(ErrInvalidServiceConfig)

    err = await msi.validateServiceConfig('http://test.org')
    expect(err).toBeNull()
  })

  it('validates the service config is a url', async function() {

    let err = await msi.validateServiceConfig('not/a/url')

    expect(err).toBeInstanceOf(FeedsError)
    expect(err?.code).toEqual(ErrInvalidServiceConfig)
  })

  it('creates a service connection with a url string', async function() {

    const conn = msi.createConnection('http://test.msi') as MSI.MsiConnection

    expect(conn).toBeInstanceOf(MSI.MsiConnection)
    expect(conn.url).toEqual('http://test.msi')
  })
})


describe('msi connection', function() {

  let topicModules: MSI.MsiTopicModule[]
  let transport: jest.Mocked<MSI.MsiTransport>

  beforeEach(function() {
    topicModules = [
      {
        topicDescriptor: {
          id: 'msi1',
          title: 'MSI Test 1',
        },
        createContentRequest() { throw new Error() },
        transformResponse() { throw new Error() }
      },
      {
        topicDescriptor: {
          id: 'msi2',
          title: 'MSI Test 2',
        },
        createContentRequest() { throw new Error() },
        transformResponse() { throw new Error() }
      }
    ]
    transport = {
      send: jest.fn()
    }
  })

  it('returns the configured topics', async function() {

    const url = 'https://test.msi'
    const conn = new MSI.MsiConnection(url, new Map(topicModules.map(x => [ x.topicDescriptor.id, x ])), transport)
    const topics = await conn.fetchAvailableTopics()

    expect(topics).toHaveLength(2)
    expect(topics[0]).toEqual(topicModules[0].topicDescriptor)
    expect(topics[1]).toEqual(topicModules[1].topicDescriptor)
  })

  it('fetches topic content with the topic request', async function() {

    const conn = new MSI.MsiConnection('http://test.fetch', new Map(topicModules.map(x => [ x.topicDescriptor.id, x ])), transport)
    const contentReq: MSI.MsiRequest = {
      method: 'get',
      path: 'stuff',
      queryParams: {
        good: 'true'
      }
    }
    const contentRes: MSI.MsiResponse = {
      status: 200,
      body: {
        goodStuff: true
      }
    }
    const topicContent: FeedTopicContent = {
      topic: topicModules[0].topicDescriptor.id,
      items: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [ 1, 2 ], [ 3, 4 ], [ 5, 6 ], [ 1, 2 ]
              ]]
            },
            properties: { good: 'yep' }
          }
        ]
      }
    }
    const topicParams = {
      goodness: 75
    }
    topicModules[0].createContentRequest = jest.fn(() => contentReq)
    topicModules[0].transformResponse = jest.fn(() => topicContent)
    transport.send.mockImplementationOnce(async () => contentRes)
    const content = await conn.fetchTopicContent(topicModules[0].topicDescriptor.id, topicParams)

    expect(content).toEqual(topicContent)
    expect(transport.send).toBeCalledTimes(1)
    expect(transport.send).toBeCalledWith(contentReq)
    expect(topicModules[0].createContentRequest).toBeCalledWith(topicParams)
    expect(topicModules[0].transformResponse).toBeCalledWith(contentRes, contentReq)
  })
})