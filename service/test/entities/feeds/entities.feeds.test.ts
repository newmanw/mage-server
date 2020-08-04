import uniqid from 'uniqid'
import { FeedCreateAttrs, FeedTopic, FeedMinimalAttrs } from '../../../lib/entities/feeds/entities.feeds'
import { expect } from 'chai'

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
      updateFrequency: { seconds: 3600 },
      paramsSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          key: { type: 'string' }
        },
        required: [ 'key' ]
      }
    }
    const feed: FeedMinimalAttrs = {
      service: uniqid(),
      topic: topic.id,
      title: 'Feed Title',
      summary: 'About the feed',
      itemsHaveIdentity: false,
      itemsHaveSpatialDimension: false,
      itemPrimaryProperty: null,
      itemSecondaryProperty: null,
      itemTemporalProperty: 'feedTemporal',
      updateFrequency: { seconds: 600 },
      constantParams: {
        key: 'abc123'
      },
      variableParamsSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', maximum: 200, default: 25 }
        }
      }
    }
    const createAttrs = FeedCreateAttrs(topic, feed)
    expect(createAttrs).to.deep.equal({
      service: feed.service,
      topic: topic.id,
      title: feed.title,
      summary: feed.summary,
      itemsHaveIdentity: false,
      itemsHaveSpatialDimension: false,
      itemTemporalProperty: feed.itemTemporalProperty,
      updateFrequency: feed.updateFrequency,
      constantParams: feed.constantParams,
      variableParamsSchema: feed.variableParamsSchema
    })
    expect(createAttrs).to.not.have.property('itemPrimaryProperty')
    expect(createAttrs).to.not.have.property('itemSecondaryProperty')
  })

  it('applies the topic attributes when feed attributes are not present', function() {

    const topic: FeedTopic = {
      id: uniqid(),
      title: 'Topic Title',
      summary: 'About the topic',
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      itemPrimaryProperty: 'topicPrimary',
      itemSecondaryProperty: 'topicSecondary',
      itemTemporalProperty: 'topicTemporal',
      updateFrequency: { seconds: 3600 },
      paramsSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          key: { type: 'string' }
        },
        required: [ 'key' ]
      }
    }
    const feed: FeedMinimalAttrs = {
      service: uniqid(),
      topic: topic.id,
      summary: 'About the feed',
      itemTemporalProperty: null
    }
    const createAttrs = FeedCreateAttrs(topic, feed)

    expect(createAttrs).to.deep.equal({
      service: feed.service,
      topic: topic.id,
      title: topic.title,
      summary: feed.summary,
      itemsHaveIdentity: topic.itemsHaveIdentity,
      itemsHaveSpatialDimension: topic.itemsHaveSpatialDimension,
      itemPrimaryProperty: topic.itemPrimaryProperty,
      itemSecondaryProperty: topic.itemSecondaryProperty,
      updateFrequency: topic.updateFrequency
    })
    expect(createAttrs).to.not.have.property('itemTemporalProperty')
  })
})
