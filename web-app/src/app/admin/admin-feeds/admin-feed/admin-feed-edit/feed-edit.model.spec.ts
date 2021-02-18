import { Feed, FeedTopic } from '../../../../feed/feed.model'
import { FeedMetaData, feedMetaDataLean, FeedMetaDataNullable } from './feed-edit.model'

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
