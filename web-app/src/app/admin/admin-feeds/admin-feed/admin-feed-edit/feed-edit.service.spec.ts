import { defer, Observable, of, zip, asyncScheduler, asapScheduler, Observer, PartialObserver, NextObserver } from 'rxjs'
import { first, map } from 'rxjs/operators'
import { FeedEditService, FeedEditState, FeedEditStateObservers } from './feed-edit.service'
import { FeedExpanded, FeedService } from '../../../../feed/feed.service'
import { Feed, FeedPreview, FeedTopic, Service } from '../../../../feed/feed.model'
import { FeedMetaData, feedMetaDataLean } from './feed-edit.model'


const emptyState: Readonly<FeedEditState> = Object.freeze({
  originalFeed: null,
  availableServices: [],
  selectedService: null,
  availableTopics: [],
  selectedTopic: null,
  fetchParameters: null,
  itemPropertiesSchema: null,
  topicMetaData: null,
  feedMetaData: null,
  preview: null,
})

const emptyPreview: Readonly<FeedPreview> = Object.freeze({
  content: {
    feed: 'empty',
    items: {
      type: 'FeatureCollection',
      features: []
    }
  },
  feed: {
    id: 'preview',
    title: 'Empty',
    service: 'empty',
    topic: 'empty'
  }
})

const services: Service[] = [
  Object.freeze({
    id: 'service1',
    serviceType: 'type1',
    title: 'Service 1',
    summary: 'Testing 1',
    config: {
      test: true
    }
  }),
  Object.freeze({
    id: 'service2',
    serviceType: 'type1',
    title: 'Service 2',
    summary: 'Testing 2',
    config: {
      test: true,
      secret: 546653765
    }
  })
]

const topicsForService: { [serviceId: string]: FeedTopic[] } = {
  [services[0].id]: [
    {
      id: 'service1.topic1',
      title: 'Service 1 Topic 1',
      itemPrimaryProperty: 'prop1',
      itemsHaveIdentity: false,
      itemTemporalProperty: 'prop2',
      itemPropertiesSchema: {
        properties: {
          prop1: {
            type: 'string'
          },
          prop2: {
            type: 'number'
          }
        }
      }
    },
    {
      id: 'service1.topic2',
      title: 'Service 1 Topic 2',
      itemsHaveIdentity: false,
      itemsHaveSpatialDimension: true,
      itemPrimaryProperty: 'prop1',
      itemTemporalProperty: 'prop2',
      itemPropertiesSchema: {
        properties: {
          prop1: {
            type: 'string'
          },
          prop2: {
            type: 'number'
          }
        }
      },
      paramsSchema: {
        properties: {
          when: 'number'
        }
      }
    }
  ],
  [services[1].id]: [
    {
      id: 'service2.topic1',
      title: 'Service 2 Topic 1',
      summary: 'Service 2 Topic 1 for testing',
      itemsHaveIdentity: true,
      itemsHaveSpatialDimension: true,
      itemPrimaryProperty: 'prop1',
      itemSecondaryProperty: 'prop3',
      itemTemporalProperty: 'prop2',
      itemPropertiesSchema: {
        properties: {
          prop1: {
            type: 'string'
          },
          prop2: {
            type: 'number'
          },
          prop3: {
            type: 'string'
          }
        }
      },
      paramsSchema: {
        properties: {
          when: 'number',
          who: 'string'
        }
      }
    }
  ]
}

class Recorder<T> implements NextObserver<T> {
  static of<T>(stream: Observable<T>): Recorder<T> {
    const recorder = new Recorder<T>()
    stream.subscribe(recorder)
    return recorder
  }
  readonly observed: T[] = []
  next(o: T) {
    this.observed.push(o)
  }
  get latest(): T {
    return this.observed[this.observed.length - 1]
  }
  get isEmpty(): boolean {
    return !this.observed.length
  }
}

class FeedEditChangeRecorder implements FeedEditStateObservers {

  originalFeed: Recorder<FeedExpanded | null>
  availableServices: Recorder<Service[]>
  selectedService: Recorder<Service | null>
  availableTopics: Recorder<FeedTopic[]>
  selectedTopic: Recorder<FeedTopic | null>
  fetchParameters: Recorder<any | null>
  itemPropertiesSchema: Recorder<any | null>
  topicMetaData: Recorder<FeedMetaData | null>
  feedMetaData: Recorder<FeedMetaData | null>
  preview: Recorder<FeedPreview | null>

  constructor(feedEdit: FeedEditService) {
    this.originalFeed = Recorder.of(feedEdit.changes.originalFeed)
    this.availableServices = Recorder.of(feedEdit.changes.availableServices)
    this.selectedService = Recorder.of(feedEdit.changes.selectedService)
    this.availableTopics = Recorder.of(feedEdit.changes.availableTopics)
    this.selectedTopic = Recorder.of(feedEdit.changes.selectedTopic)
    this.fetchParameters = Recorder.of(feedEdit.changes.fetchParameters)
    this.itemPropertiesSchema = Recorder.of(feedEdit.changes.itemPropertiesSchema)
    this.topicMetaData = Recorder.of(feedEdit.changes.topicMetaData)
    this.feedMetaData = Recorder.of(feedEdit.changes.feedMetaData)
    this.preview = Recorder.of(feedEdit.changes.preview)
  }

  get latest(): FeedEditState {
    return {
      originalFeed: this.originalFeed.latest,
      availableServices: this.availableServices.latest,
      selectedService: this.selectedService.latest,
      availableTopics: this.availableTopics.latest,
      selectedTopic: this.selectedTopic.latest,
      fetchParameters: this.fetchParameters.latest,
      itemPropertiesSchema: this.itemPropertiesSchema.latest,
      topicMetaData: this.topicMetaData.latest,
      feedMetaData: this.feedMetaData.latest,
      preview: this.preview.latest
    }
  }

  get allObserved(): { [StateKey in keyof FeedEditState]: FeedEditState[StateKey][] } {
    return {
      originalFeed: this.originalFeed.observed,
      availableServices: this.availableServices.observed,
      selectedService: this.selectedService.observed,
      availableTopics: this.availableTopics.observed,
      selectedTopic: this.selectedTopic.observed,
      fetchParameters: this.fetchParameters.observed,
      itemPropertiesSchema: this.itemPropertiesSchema.observed,
      topicMetaData: this.topicMetaData.observed,
      feedMetaData: this.feedMetaData.observed,
      preview: this.preview.observed
    }
  }
}

describe('FeedEditService', () => {

  let feedEdit: FeedEditService
  let stateChanges: FeedEditChangeRecorder
  let feedService: jasmine.SpyObj<FeedService>

  beforeEach(() => {
    feedService = jasmine.createSpyObj<FeedService>('SpyOfFeedService', [
      'fetchServices',
      'fetchTopics',
      'fetchFeed',
      'previewFeed'
    ])
    feedEdit = new FeedEditService(feedService)
    stateChanges = new FeedEditChangeRecorder(feedEdit)
  })

  it('starts with empty state', async () => {

    expect(feedEdit.currentState).toEqual(emptyState)
    expect(stateChanges.latest).toEqual(emptyState)
  })

  describe('feed meta-data', () => {

    describe('creating from a topic', () => {

      it('picks the meta-data properties from the topic', () => {

        const topic: Required<FeedTopic> & Required<FeedMetaData> = {
          id: 'topic1',
          title: 'Make Meta-Data',
          summary: 'Does it work?',
          icon: 'mage-plugin://not/sure/yet.png',
          itemPrimaryProperty: 'primary',
          itemSecondaryProperty: 'secondary',
          itemTemporalProperty: 'temporal',
          itemsHaveIdentity: false,
          itemsHaveSpatialDimension: false,
          updateFrequencySeconds: 300,
          itemPropertiesSchema: {
            properties: {
              primary: { type: 'string' },
              secondary: { type: 'string' },
              temporal: { type: 'number' }
            }
          },
          mapStyle: {
            iconUrl: 'pretty://pictures/nice.png'
          },
          paramsSchema: {
            password: { type: 'string' }
          }
        }
        const metaData = feedMetaDataLean(topic)

        const expected: Required<FeedMetaData> = {
          title: 'Make Meta-Data',
          summary: 'Does it work?',
          icon: 'mage-plugin://not/sure/yet.png',
          itemPrimaryProperty: 'primary',
          itemSecondaryProperty: 'secondary',
          itemTemporalProperty: 'temporal',
          itemsHaveIdentity: false,
          itemsHaveSpatialDimension: false,
          updateFrequencySeconds: 300
        }
        expect(metaData).toEqual(expected)
      })

      it('omits keys with undefined values', () => {

        fail('todo')
      })
    })
  })

  describe('creating a new feed', () => {

    it('resets to initial state and fetches available services', () => {

      feedService.fetchServices.and.returnValue(of(services, asapScheduler))

      feedEdit.newFeed()

      expect(feedEdit.currentState).toEqual(emptyState)

      asapScheduler.flush()

      expect(feedEdit.currentState).toEqual({
        ...emptyState,
        availableServices: services
      })
      expect(stateChanges.availableServices.observed).toEqual([ [], [], services ])
    })

    it('selects a service and fetches topics for the selected service', () => {

      feedService.fetchServices.and.returnValue(of(services, asapScheduler))
      feedService.fetchTopics.withArgs(services[1].id).and.returnValue(of(topicsForService[services[1].id], asapScheduler))

      feedEdit.newFeed()
      asapScheduler.flush()
      feedEdit.selectService(services[1].id)
      asapScheduler.flush()

      expect(feedEdit.currentState.availableTopics).toEqual(topicsForService[services[1].id])
      expect(stateChanges.availableTopics.observed).toEqual([
        [],
        [],
        topicsForService[services[1].id]
      ])
    })

    it('cannot select a service not in available services', () => {

      feedService.fetchServices.and.returnValue(of(services, asapScheduler))

      expect(feedEdit.currentState.availableServices).toEqual([])

      feedEdit.selectService('impossible')

      expect(feedEdit.currentState.selectedService).toBeNull()
      expect(stateChanges.selectedService.observed).toEqual([ null ])

      feedEdit.newFeed()
      asapScheduler.flush()

      expect(feedEdit.currentState.availableServices).toEqual(services)

      feedEdit.selectService('derp')

      expect(feedEdit.currentState.selectedService).toBeNull()
      expect(stateChanges.selectedService.observed).toEqual([ null, null ])
    })

    it('populates feed meta-data and item properties schema from selected topic', () => {

      const service = services[0]
      const topics = topicsForService[service.id]
      const topic = topics[1]
      feedService.fetchServices.and.returnValue(of(services, asapScheduler))
      feedService.fetchTopics.withArgs(service.id).and.returnValue(of(topics, asapScheduler))

      feedEdit.newFeed()
      asapScheduler.flush()
      feedEdit.selectService(service.id)
      asapScheduler.flush()
      feedEdit.selectTopic(topic.id)

      expect(feedEdit.currentState).toEqual(<FeedEditState>{
        originalFeed: null,
        availableServices: services,
        selectedService: service,
        availableTopics: topics,
        selectedTopic: topic,
        fetchParameters: null,
        itemPropertiesSchema: topic.itemPropertiesSchema,
        feedMetaData: feedMetaDataLean(topic),
        preview: null
      })
      expect(stateChanges.selectedTopic.latest).toEqual(topic)
      expect(stateChanges.feedMetaData.latest).toEqual(feedMetaDataLean(topic))
      expect(stateChanges.itemPropertiesSchema.latest).toEqual(topic.itemPropertiesSchema)
    })

    it('resets the fetch parameters, item properties schema, and preview when the selected topic changes', () => {
      fail('todo')
    })

    it('does nothing when selecting an invalid topic', () => {
      // TODO: this might not be right. should the observable dispatch an error?
      fail('todo')
    })
  })

  describe('editing an existing feed', () => {

    it('resets to empty state first', () => {

      feedService.fetchFeed.and.returnValue(of<FeedExpanded>(asapScheduler))

      feedEdit.editFeed('inconsequential')

      expect(feedEdit.currentState).toEqual(emptyState)
      expect(stateChanges.latest).toEqual(emptyState)
      expect(stateChanges.allObserved).toEqual({
        originalFeed: [ null, null ],
        availableServices: [ [], [] ],
        selectedService: [ null, null ],
        availableTopics: [ [], [] ],
        selectedTopic: [ null, null ],
        fetchParameters: [ null, null ],
        itemPropertiesSchema: [ null, null ],
        topicMetaData: [ null, null ],
        feedMetaData: [ null, null ],
        preview: [ null, null ]
      })
    })

    it('fetches the feed and intializes editing state', () => {

      const feedId = 'feed1'
      const fetchedFeed: Readonly<FeedExpanded> = Object.freeze({
        id: feedId,
        service: {
          id: 'service1',
          title: 'Service 1',
          summary: 'Made for testing',
          serviceType: 'servicetype1',
          config: null
        },
        topic: {
          id: 'topic1',
          title: 'Topic 1'
        },
        title: 'Feed of Topic 1',
        summary: 'Items from level 10 to 25',
        itemPrimaryProperty: 'what',
        itemPropertiesSchema: {
          properties: {
            what: 'string',
            level: 'number'
          }
        },
        constantParams: {
          levelBetween: [ 10, 25 ]
        }
      })
      feedService.fetchFeed.withArgs(feedId).and.returnValue(of(fetchedFeed, asapScheduler))
      feedService.previewFeed.and.returnValue(of(emptyPreview))

      feedEdit.editFeed(feedId)
      asapScheduler.flush()

      const expectedState: FeedEditState = {
        availableServices: [ fetchedFeed.service ],
        selectedService: fetchedFeed.service,
        availableTopics: [ fetchedFeed.topic ],
        selectedTopic: fetchedFeed.topic,
        originalFeed: fetchedFeed,
        fetchParameters: fetchedFeed.constantParams,
        itemPropertiesSchema: fetchedFeed.itemPropertiesSchema,
        topicMetaData: feedMetaDataLean(fetchedFeed.topic),
        feedMetaData: {
          title: fetchedFeed.title,
          summary: fetchedFeed.summary,
          icon: undefined,
          itemPrimaryProperty: fetchedFeed.itemPrimaryProperty,
          itemSecondaryProperty: undefined,
          itemTemporalProperty: undefined,
          itemsHaveIdentity: undefined,
          itemsHaveSpatialDimension: undefined
        },
        preview: emptyPreview
      }
      expect(feedEdit.currentState).toEqual(expectedState)
      expect(feedService.fetchFeed).toHaveBeenCalledWith(feedId)
      expect(stateChanges.allObserved).toEqual(<FeedEditChangeRecorder['allObserved']>{
        availableServices: [ [], [], expectedState.availableServices ],
        selectedService: [ null, null, expectedState.selectedService ],
        availableTopics: [ [], [], expectedState.availableTopics ],
        selectedTopic: [ null, null, expectedState.selectedTopic ],
        originalFeed: [ null, null, expectedState.originalFeed ],
        fetchParameters: [ null, null, expectedState.fetchParameters ],
        itemPropertiesSchema: [ null, null, expectedState.itemPropertiesSchema ],
        topicMetaData: [ null, null, expectedState.topicMetaData ],
        feedMetaData: [ null, null, expectedState.feedMetaData ],
        preview: [ null, null, expectedState.preview ]
      })
    })

    it('does not allow selecting a service or topic', async () => {

      const feed: FeedExpanded = {
        id: 'feed1',
        title: 'Service is Set',
        summary: 'No selecting a service for a saved feed',
        service: {
          id: 'service1',
          title: 'Test Service',
          summary: 'Testing',
          config: null,
          serviceType: 'servicetype1'
        },
        topic: {
          id: 'topic1',
          title: 'Topic 1',
        }
      }
      feedService.fetchFeed.withArgs(feed.id).and.returnValue(of(feed, asapScheduler))
      feedService.previewFeed.and.returnValue(of(emptyPreview))

      feedEdit.editFeed(feed.id)
      asapScheduler.flush()

      expect(feedEdit.currentState.availableServices).toEqual([ feed.service ])
      expect(feedEdit.currentState.selectedService).toEqual(feed.service)
      expect(feedEdit.currentState.availableTopics).toEqual([ feed.topic ])
      expect(feedEdit.currentState.selectedTopic).toEqual(feed.topic)
      expect(stateChanges.allObserved.availableServices).toEqual([ [], [], [ feed.service ] ])
      expect(stateChanges.allObserved.selectedService).toEqual([ null, null, feed.service ])
      expect(stateChanges.allObserved.availableTopics).toEqual([ [], [], [ feed.topic ] ])
      expect(stateChanges.allObserved.selectedTopic).toEqual([ null, null, feed.topic ])

      feedEdit.selectService('nope')
      feedEdit.selectService(feed.service.id)
      feedEdit.selectTopic('nope')
      feedEdit.selectTopic(feed.topic.id)

      await new Promise((resolve) => {
        setTimeout(resolve)
      })

      expect(feedEdit.currentState.availableServices).toEqual([ feed.service ])
      expect(feedEdit.currentState.selectedService).toEqual(feed.service)
      expect(feedEdit.currentState.availableTopics).toEqual([ feed.topic ])
      expect(feedEdit.currentState.selectedTopic).toEqual(feed.topic)
      expect(stateChanges.allObserved.availableServices).toEqual([ [], [], [ feed.service ] ])
      expect(stateChanges.allObserved.selectedService).toEqual([ null, null, feed.service ])
      expect(stateChanges.allObserved.availableTopics).toEqual([ [], [], [ feed.topic ] ])
      expect(stateChanges.allObserved.selectedTopic).toEqual([ null, null, feed.topic ])
    })
  })

  describe('changing the feed meta-data', () => {

    beforeEach(() => {
      feedService.fetchServices.and.returnValue(of(services))
      feedService.fetchTopics.and.callFake((serviceId: string) => {
        return of(topicsForService[serviceId])
      })
    })

    it('merges topic properties to unspecified meta-data properties', () => {

      const service = services[0]
      const topic = topicsForService[service.id][0]
      const topicMetaData = Object.freeze(feedMetaDataLean(topic))
      const changes = [ null ]

      feedEdit.newFeed()
      feedEdit.selectService(service.id)
      feedEdit.selectTopic(topic.id)

      expect(stateChanges.feedMetaData.observed).toEqual([
        null,
        null,
        topicMetaData,
      ])

      feedEdit.feedMetaDataChanged({})

      expect(stateChanges.feedMetaData.observed).toEqual([
        null,
        null,
        topicMetaData,
        topicMetaData
      ])

      feedEdit.feedMetaDataChanged({ title: undefined })

      expect(stateChanges.feedMetaData.observed).toEqual([
        null,
        null,
        topicMetaData,
        topicMetaData,
        topicMetaData
      ])

      feedEdit.feedMetaDataChanged({
        title: undefined,
        itemPrimaryProperty: undefined,
        itemSecondaryProperty: 'altSecondary'
      })

      expect(stateChanges.feedMetaData.observed).toEqual([
        null,
        topicMetaData,
        topicMetaData,
        topicMetaData,
        { ...topicMetaData, itemSecondaryProperty: 'altSecondary' }
      ])

      const allMod: Required<FeedMetaData> = {
        title: 'Title Mod',
        summary: 'Summary Mod',
        icon: 'icon-mod.png',
        itemPrimaryProperty: 'primaryMod',
        itemSecondaryProperty: 'secondaryMod',
        itemTemporalProperty: 'temporalMod',
        itemsHaveIdentity: !topic.itemsHaveIdentity,
        itemsHaveSpatialDimension: !topic.itemsHaveSpatialDimension,
        updateFrequencySeconds: (topic.updateFrequencySeconds || 0) + 100
      }
      feedEdit.feedMetaDataChanged(allMod)

      expect(stateChanges.feedMetaData.observed).toEqual([
        null,
        topicMetaData,
        topicMetaData,
        topicMetaData,
        { ...topicMetaData, itemSecondaryProperty: 'altSecondary' },
        allMod
      ])
    })

    it('is not allowed when there is no topic selected', () => {
      fail('todo')
    })

    it('respects null values from change', () => {
      fail('todo')
    })
  })

  it('does not set constant parameters if the parameters are empty', () => {
    fail('todo')
  })
})