import uniqid from 'uniqid'
import { FeedCreateAttrs, FeedTopic, FeedCreateMinimal, MapStyle, ResolvedMapStyle } from '../../../lib/entities/feeds/entities.feeds'
import { expect } from 'chai'
import { URL } from 'url'
import { min } from 'lodash'

describe.only('feed-create attribute factory', function() {

  it('applies the feed attribute when present', function() {

    const topic: FeedTopic = {
      id: uniqid(),
      title: 'Topic Title',
      summary: 'About the topic',
      icon: new URL('test:///topic.png'),
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
    const minimal: Required<FeedCreateMinimal> & { mapStyle: Required<ResolvedMapStyle> } = {
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
        strokeOpacity: 0.4,
        strokeWidth: 1.5,
        fill: 'aaa111',
        fillOpacity: 0.2,
        icon: uniqid()
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
    const icons = { [String(topic.icon)]: minimal.icon! }
    const createAttrs = FeedCreateAttrs(topic, minimal, icons)
    expect(createAttrs).to.deep.equal({
      service: minimal.service,
      topic: topic.id,
      title: minimal.title,
      summary: minimal.summary,
      icon: minimal.icon,
      itemsHaveIdentity: false,
      itemsHaveSpatialDimension: false,
      itemTemporalProperty: minimal.itemTemporalProperty,
      updateFrequencySeconds: minimal.updateFrequencySeconds,
      constantParams: minimal.constantParams,
      variableParamsSchema: minimal.variableParamsSchema,
      mapStyle: minimal.mapStyle,
      itemPropertiesSchema: minimal.itemPropertiesSchema
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
        icon: new URL('https://icons.net/building.png'),
        stroke: 'abcabc',
        strokeOpacity: 0.5
      },
      itemPropertiesSchema: {
        title: 'Topic Properties'
      }
    }
    const icons = {
      [String(topic.icon)]: uniqid(),
      [String(topic.mapStyle.icon)]: uniqid()
    }
    const minimal: FeedCreateMinimal = {
      service: uniqid(),
      topic: topic.id,
      summary: 'About the feed',
      itemTemporalProperty: null
    }
    const createAttrs = FeedCreateAttrs(topic, minimal, icons)

    expect(createAttrs).to.deep.equal({
      service: minimal.service,
      topic: topic.id,
      title: topic.title,
      summary: minimal.summary,
      itemsHaveIdentity: topic.itemsHaveIdentity,
      itemsHaveSpatialDimension: topic.itemsHaveSpatialDimension,
      itemPrimaryProperty: topic.itemPrimaryProperty,
      itemSecondaryProperty: topic.itemSecondaryProperty,
      updateFrequencySeconds: topic.updateFrequencySeconds,
      mapStyle: {
        icon: icons[String(topic.mapStyle.icon)],
        stroke: topic.mapStyle.stroke,
        strokeOpacity: topic.mapStyle.strokeOpacity
      },
      itemPropertiesSchema: topic.itemPropertiesSchema,
      icon: icons[String(topic.icon)]
    })
  })

  it('deep copies the map style', function() {

    const topic: Required<FeedTopic> = {
      id: uniqid(),
      title: 'Topic Title',
      summary: 'About the topic',
      icon: new URL('test:///topic.png'),
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
        icon: new URL('https://icons.net/building.png'),
        fill: 'abc123'
      },
      itemPropertiesSchema: {
        title: 'Topic Properties'
      }
    }
    const icons = {
      [String(topic.mapStyle.icon)]: uniqid()
    }
    const minimal: FeedCreateMinimal = {
      service: uniqid(),
      topic: topic.id,
      summary: 'About the feed',
      itemTemporalProperty: null
    }
    const createAttrs = FeedCreateAttrs(topic, minimal, icons)

    expect(topic.mapStyle.icon).to.be.instanceOf(URL)
    expect(createAttrs.mapStyle).to.deep.equal({
      icon: icons[String(topic.mapStyle.icon)],
      fill: topic.mapStyle.fill
    })
    expect(createAttrs.mapStyle).to.not.equal(topic.mapStyle)
  })
})
