import uniqid from 'uniqid'
import { normalizeFeedMinimalAttrs, FeedTopic, FeedMinimalAttrs } from '../../../lib/entities/feeds/entities.feeds'
import { expect } from 'chai'
import { URL } from 'url'

describe('feed-create attribute factory', function() {

  it('applies the feed attribute when present', function() {

    const topic: FeedTopic = {
      id: uniqid(),
      title: 'Topic Title',
      summary: 'About the topic',
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      itemPrimaryProperty: 'topicPrimary',
      itemSecondaryProperty: 'topicSecondary',
      itemTemporalProperty: 'topicTemporal',
      updateFrequencySeconds: 3600,
      paramsSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          key: { type: 'string' }
        },
        required: [ 'key' ]
      },
      mapStyle: {
        stroke: 'abc123',
        strokeOpacity: 0.5
      }
    }
    const feed: Required<FeedMinimalAttrs> = {
      service: uniqid(),
      topic: topic.id,
      title: 'Feed Title',
      summary: 'About the feed',
      icon: uniqid(),
      itemsHaveIdentity: false,
      itemsHaveSpatialDimension: false,
      itemPrimaryProperty: null,
      itemSecondaryProperty: null,
      itemTemporalProperty: 'feedTemporal',
      updateFrequencySeconds: 600,
      constantParams: {
        key: 'abc123'
      },
      variableParamsSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', maximum: 200, default: 25 }
        }
      },
      mapStyle: {
        stroke: 'abcddd',
        strokeOpacity: 0.4
      },
      itemPropertiesSchema: {
        type: 'object',
        title: 'Test Items',
        properties: {
          feedTemporal: {
            type: 'number',
            format: 'urn:mage:epoch'
          }
        }
      }
    }
    const createAttrs = normalizeFeedMinimalAttrs(topic, feed)
    expect(createAttrs).to.deep.equal({
      service: feed.service,
      topic: topic.id,
      title: feed.title,
      summary: feed.summary,
      itemsHaveIdentity: false,
      itemsHaveSpatialDimension: false,
      itemTemporalProperty: feed.itemTemporalProperty,
      updateFrequencySeconds: feed.updateFrequencySeconds,
      constantParams: feed.constantParams,
      variableParamsSchema: feed.variableParamsSchema,
      mapStyle: feed.mapStyle,
      itemPropertiesSchema: feed.itemPropertiesSchema
    })
    expect(createAttrs).to.not.have.property('itemPrimaryProperty')
    expect(createAttrs).to.not.have.property('itemSecondaryProperty')
  })

  it('applies the topic attributes when feed attributes are not present', function() {

    const topic: Required<FeedTopic> = {
      id: uniqid(),
      title: 'Topic Title',
      summary: 'About the topic',
      icon: new URL('test://icons/topic.png'),
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      itemPrimaryProperty: 'topicPrimary',
      itemSecondaryProperty: 'topicSecondary',
      itemTemporalProperty: 'topicTemporal',
      updateFrequencySeconds: 3600,
      paramsSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          key: { type: 'string' }
        },
        required: [ 'key' ]
      },
      mapStyle: {
        iconUrl: new URL('https://icons.net/building.png')
      },
      itemPropertiesSchema: {
        title: 'Topic Properties'
      }
    }
    const feed: FeedMinimalAttrs = {
      service: uniqid(),
      topic: topic.id,
      summary: 'About the feed',
      itemTemporalProperty: null
    }
    const createAttrs = normalizeFeedMinimalAttrs(topic, feed)

    expect(createAttrs).to.deep.equal({
      service: feed.service,
      topic: topic.id,
      title: topic.title,
      summary: feed.summary,
      itemsHaveIdentity: topic.itemsHaveIdentity,
      itemsHaveSpatialDimension: topic.itemsHaveSpatialDimension,
      itemPrimaryProperty: topic.itemPrimaryProperty,
      itemSecondaryProperty: topic.itemSecondaryProperty,
      updateFrequencySeconds: topic.updateFrequencySeconds,
      mapStyle: topic.mapStyle,
      itemPropertiesSchema: topic.itemPropertiesSchema
    })
    expect(createAttrs).to.not.have.property('itemTemporalProperty')
  })
})
