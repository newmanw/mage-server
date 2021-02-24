import { Feed, FeedTopic, Service } from '../../../../feed/feed.model'
import { FeedEditState, FeedMetaData, feedMetaDataLean, FeedMetaDataNullable, feedPostFromEditState } from './feed-edit.model'

export type FeedMetaDataBooleanKeys = { [K in keyof FeedMetaData]: FeedMetaData[K] extends boolean ? K : never }[keyof FeedMetaData]

describe('feedMetaDataLean', () => {

  it('creates meta-data from populated topic', () => {

    const topic: Required<FeedTopic> = {
      id: 'abc123',
      title: 'A Topic',
      summary: 'Topic for testing',
      icon: 'hurr://durr/derp.png',
      itemPrimaryProperty: 'primary',
      itemSecondaryProperty: 'secondary',
      itemTemporalProperty: 'temporal',
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      itemPropertiesSchema: {
        properties: {
          primary: {}, secondary: {}, temporal: {}
        }
      },
      paramsSchema: {
        properties: { when: { type: 'number' } }
      },
      mapStyle: {},
      updateFrequencySeconds: 10000
    }
    const metaData = feedMetaDataLean(topic)

    expect(metaData).toEqual(<Required<FeedMetaData>>{
      title: 'A Topic',
      summary: 'Topic for testing',
      itemPrimaryProperty: 'primary',
      itemSecondaryProperty: 'secondary',
      itemTemporalProperty: 'temporal',
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      updateFrequencySeconds: 10000,
      icon: 'hurr://durr/derp.png'
    })
  })

  it('creates feed meta-data from populated feed', () => {

    const topic: Required<Feed> = {
      id: 'abc123',
      service: 'service1',
      topic: 'topic1',
      title: 'A Topic',
      summary: 'Topic for testing',
      icon: 'hurr://durr/derp.png',
      itemPrimaryProperty: 'primary',
      itemSecondaryProperty: 'secondary',
      itemTemporalProperty: 'temporal',
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      itemPropertiesSchema: {
        properties: {
          primary: {}, secondary: {}, temporal: {}
        }
      },
      constantParams: {
        account: 'abc-123-zxy'
      },
      variableParamsSchema: {
        properties: { when: { type: 'number' } }
      },
      mapStyle: {},
      updateFrequencySeconds: 10000
    }
    const metaData = feedMetaDataLean(topic)

    expect(metaData).toEqual(<Required<FeedMetaData>>{
      title: 'A Topic',
      summary: 'Topic for testing',
      itemPrimaryProperty: 'primary',
      itemSecondaryProperty: 'secondary',
      itemTemporalProperty: 'temporal',
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      updateFrequencySeconds: 10000,
      icon: 'hurr://durr/derp.png'
    })
  })

  it('strips all null keys from source', () => {

    const nullSource: FeedMetaDataNullable = {
      title: null,
      summary: null,
      itemPrimaryProperty: null,
      itemSecondaryProperty: null,
      itemTemporalProperty: null,
      itemsHaveIdentity: null,
      itemsHaveSpatialDimension: null,
      updateFrequencySeconds: null,
      icon: null
    }
    const lean = feedMetaDataLean(nullSource)

    expect(lean).toEqual({})
  })

  it('strips all undefined keys from source', () => {

    const undefinedSource: Record<keyof Required<FeedMetaData>, undefined> = {
      title: undefined,
      summary: undefined,
      itemPrimaryProperty: undefined,
      itemSecondaryProperty: undefined,
      itemTemporalProperty: undefined,
      itemsHaveIdentity: undefined,
      itemsHaveSpatialDimension: undefined,
      updateFrequencySeconds: undefined,
      icon: undefined
    }
    const lean = feedMetaDataLean(undefinedSource)

    expect(lean).toEqual({})
  })

  it('strips empty string keys', () => {

    type FeedMetaDataStringKeys = { [K in keyof FeedMetaData]: FeedMetaData[K] extends string ? K : never }[keyof FeedMetaData]

    const source: Record<FeedMetaDataStringKeys, ''> = {
      title: '',
      summary: '',
      itemPrimaryProperty: '',
      itemSecondaryProperty: '',
      itemTemporalProperty: '',
      icon: ''
    }
    const lean = feedMetaDataLean(source)

    expect(lean).toEqual({})
  })

  it('does not strip false booleans', () => {

    const source: Record<FeedMetaDataBooleanKeys, false> = {
      itemsHaveIdentity: false,
      itemsHaveSpatialDimension: false
    }
    const lean = feedMetaDataLean(source)

    expect(lean).toEqual(source)
  })
})

describe('feedPostFromEditState', () => {

  it('maps all properties from complete edit state', () => {

    const service: Required<Service> = { id: 'service1', serviceType: 'type1', title: 'Service 1', summary: 'Test service 1', config: { test: true }}
    const topic: Required<FeedTopic> = {
      id: 'topic1',
      title: 'Test Topic',
      summary: 'A topic for testing',
      icon: 'icon1',
      itemPrimaryProperty: 'prop1',
      itemSecondaryProperty: 'prop2',
      itemTemporalProperty: 'time',
      itemPropertiesSchema: {
        properties: {
          prop1: { type: 'string' }
        }
      },
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      mapStyle: {
        iconUrl: 'icon1'
      },
      paramsSchema: {
        properties: {
          when: { type: 'number' }
        }
      },
      updateFrequencySeconds: 100
    }
    const feedMetaData: Required<FeedMetaData> = {
      title: 'Test Feed',
      summary: 'A feed for testing',
      icon: 'icon5',
      itemPrimaryProperty:  'feedProp1',
      itemSecondaryProperty: 'feedProp2',
      itemTemporalProperty: 'feedTime',
      itemsHaveIdentity: false,
      itemsHaveSpatialDimension: false,
      updateFrequencySeconds: 4000
    }
    const state: FeedEditState = {
      availableServices: [],
      availableTopics: [],
      selectedService: service,
      selectedTopic: topic,
      topicMetaData: feedMetaDataLean(topic),
      feedMetaData,
      fetchParameters: { test: 'yes' },
      itemPropertiesSchema: {
        properties: {
          feedProp1: { type: 'string', title: 'Prop 1 Titled' }
        }
      },
      originalFeed: {
        id: 'feed1',
        service: service,
        topic: topic,
        title: 'Original Title'
      },
      preview: null
    }

    const feedFromState = feedPostFromEditState(state)

    const expectedFeed: Required<Omit<Feed, 'mapStyle' | 'variableParamsSchema'>> = {
      id: state.originalFeed.id,
      service: state.selectedService.id,
      topic: state.selectedTopic.id,
      itemPropertiesSchema: state.itemPropertiesSchema,
      constantParams: state.fetchParameters,
      ...feedMetaData
    }
    expect(feedFromState).toEqual(expectedFeed)
  })

  it('omits null values from edit state', () => {

    const service: Required<Service> = { id: 'service1', serviceType: 'type1', title: 'Service 1', summary: 'Test service 1', config: { test: true }}
    const topic: Required<FeedTopic> = {
      id: 'topic1',
      title: 'Test Topic',
      summary: 'A topic for testing',
      icon: 'icon1',
      itemPrimaryProperty: 'prop1',
      itemSecondaryProperty: 'prop2',
      itemTemporalProperty: 'time',
      itemPropertiesSchema: {
        properties: {
          prop1: { type: 'string' }
        }
      },
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      mapStyle: {
        iconUrl: 'icon1'
      },
      paramsSchema: {
        properties: {
          when: { type: 'number' }
        }
      },
      updateFrequencySeconds: 100
    }
    const state: FeedEditState = {
      availableServices: [],
      availableTopics: [],
      selectedService: service,
      selectedTopic: topic,
      topicMetaData: feedMetaDataLean(topic),
      feedMetaData: null,
      fetchParameters: null,
      itemPropertiesSchema: null,
      originalFeed: null,
      preview: null
    }
    const feedPost = feedPostFromEditState(state)

    expect(feedPost).toEqual({
      service: state.selectedService.id,
      topic: state.selectedTopic.id
    })
  })
})
