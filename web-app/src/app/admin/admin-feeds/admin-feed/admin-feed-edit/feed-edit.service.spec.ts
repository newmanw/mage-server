import { Observable, of, asapScheduler, NextObserver, MonoTypeOperatorFunction } from 'rxjs'
import { distinctUntilChanged, pluck } from 'rxjs/operators'
import { FeedEditService, FeedEditState, FeedEditStateObservers } from './feed-edit.service'
import { FeedExpanded, FeedService } from '../../../../feed/feed.service'
import { FeedPreview, FeedTopic, Service } from '../../../../feed/feed.model'
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

const distinctUntilChangedCheckEmpty = <T>(): MonoTypeOperatorFunction<T> => {
  return distinctUntilChanged((a, b): boolean => {
    if (typeof a !== typeof b) {
      return false
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      return (a.length === 0 && b.length === 0) || a === b
    }
    return  a && b ? (Object.getOwnPropertyNames(a).length === 0 && Object.getOwnPropertyNames(b).length === 0) : a === b
  })
}

class FeedEditChangeRecorder implements FeedEditStateObservers {

  state: Recorder<FeedEditState>
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
    this.state = Recorder.of(feedEdit.state$)
    this.originalFeed = Recorder.of(feedEdit.state$.pipe(pluck('originalFeed'), distinctUntilChangedCheckEmpty()))
    this.availableServices = Recorder.of(feedEdit.state$.pipe(pluck('availableServices'), distinctUntilChangedCheckEmpty()))
    this.selectedService = Recorder.of(feedEdit.state$.pipe(pluck('selectedService'), distinctUntilChangedCheckEmpty()))
    this.availableTopics = Recorder.of(feedEdit.state$.pipe(pluck('availableTopics'), distinctUntilChangedCheckEmpty()))
    this.selectedTopic = Recorder.of(feedEdit.state$.pipe(pluck('selectedTopic'), distinctUntilChangedCheckEmpty()))
    this.fetchParameters = Recorder.of(feedEdit.state$.pipe(pluck('fetchParameters'), distinctUntilChangedCheckEmpty()))
    this.itemPropertiesSchema = Recorder.of(feedEdit.state$.pipe(pluck('itemPropertiesSchema'), distinctUntilChangedCheckEmpty()))
    this.topicMetaData = Recorder.of(feedEdit.state$.pipe(pluck('topicMetaData'), distinctUntilChangedCheckEmpty()))
    this.feedMetaData = Recorder.of(feedEdit.state$.pipe(pluck('feedMetaData'), distinctUntilChangedCheckEmpty()))
    this.preview = Recorder.of(feedEdit.state$.pipe(pluck('preview'), distinctUntilChangedCheckEmpty()))
  }

  get latest(): FeedEditState {
    return this.state.latest
  }

  get eachObserved(): { [StateKey in keyof FeedEditState]: FeedEditState[StateKey][] } {
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

fdescribe('FeedEditService', () => {

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

  fdescribe('creating a new feed', () => {

    it('resets to initial state and fetches available services', () => {

      feedService.fetchServices.and.returnValue(of(services))

      expect(stateChanges.state.observed).toEqual([ emptyState ])

      feedEdit.newFeed()

      expect(stateChanges.state.observed).toEqual([
        emptyState,
        emptyState,
        { ...emptyState, availableServices: services }
      ])
      expect(feedEdit.currentState).toEqual({
        ...emptyState,
        availableServices: services
      })
    })

    it('selecting a service fetches topics for the selected service', () => {

      feedService.fetchServices.and.returnValue(of(services))
      feedService.fetchTopics.withArgs(services[1].id).and.returnValue(of(topicsForService[services[1].id]))

      expect(stateChanges.availableTopics.observed).toEqual([ [] ])

      feedEdit.newFeed()

      expect(stateChanges.availableTopics.observed).toEqual([ [] ])

      feedEdit.selectService(services[1].id)

      expect(stateChanges.availableTopics.observed).toEqual([ [], topicsForService[services[1].id] ])
      expect(feedEdit.currentState.availableTopics).toEqual(topicsForService[services[1].id])
    })

    it('cannot select a service not in available services', () => {

      feedService.fetchServices.and.returnValue(of(services))

      expect(feedEdit.currentState.availableServices).toEqual([])
      expect(stateChanges.selectedService.observed).toEqual([ null ])

      feedEdit.selectService('impossible')

      expect(feedEdit.currentState.selectedService).toBeNull()
      expect(stateChanges.state.observed).toEqual([ emptyState ])

      feedEdit.newFeed()

      expect(feedEdit.currentState.availableServices).toEqual(services)
      expect(stateChanges.state.observed).toEqual([ emptyState, emptyState, { ...emptyState, availableServices: services } ])

      feedEdit.selectService('derp')

      expect(feedEdit.currentState.selectedService).toBeNull()
      expect(stateChanges.state.observed).toEqual([ emptyState, emptyState, { ...emptyState, availableServices: services }])
      expect(stateChanges.selectedService.observed).toEqual([ null ])
    })

    it('populates topic meta-data and item properties schema from selected topic', () => {

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
        topicMetaData: feedMetaDataLean(topic),
        feedMetaData: null,
        preview: null
      })
      expect(stateChanges.selectedTopic.latest).toEqual(topic)
      expect(stateChanges.topicMetaData.latest).toEqual(feedMetaDataLean(topic))
      expect(stateChanges.itemPropertiesSchema.latest).toEqual(topic.itemPropertiesSchema)
    })

    it('resets the fetch parameters, item properties schema, feed meta-data, and preview when the selected topic changes', () => {

      const service = services[0]
      const topics = topicsForService[service.id]
      const fetchParameters: any = { resetMe: true }
      const feedMetaData: FeedMetaData = {
        title: 'Change the Topic'
      }
      feedService.fetchServices.and.returnValue(of(services))
      feedService.fetchTopics.withArgs(service.id).and.returnValue(of(topics))
      feedService.previewFeed.and.returnValue(of(emptyPreview))

      feedEdit.newFeed()
      feedEdit.selectService(service.id)
      feedEdit.selectTopic(topics[0].id)
      feedEdit.fetchParametersChanged(fetchParameters)
      feedEdit.feedMetaDataChanged(feedMetaData)

      expect(feedEdit.currentState).toEqual(<FeedEditState>{
        availableServices: services,
        selectedService: service,
        availableTopics: topics,
        selectedTopic: topics[0],
        fetchParameters,
        topicMetaData: feedMetaDataLean(topics[0]),
        feedMetaData,
        itemPropertiesSchema: topics[0].itemPropertiesSchema,
        originalFeed: null,
        preview: emptyPreview
      })

      feedEdit.selectTopic(topics[1].id)

      expect(feedEdit.currentState).toEqual(<FeedEditState>{
        availableServices: services,
        selectedService: service,
        availableTopics: topics,
        selectedTopic: topics[1],
        itemPropertiesSchema: topics[1].itemPropertiesSchema,
        fetchParameters: null,
        topicMetaData: feedMetaDataLean(topics[1]),
        feedMetaData: null,
        originalFeed: null,
        preview: null
      })
    })

    it('resets everything when the selected service changes', () => {

      feedService.fetchServices.and.returnValue(of(services))
      feedService.fetchTopics.withArgs(services[0].id).and.returnValue(of(topicsForService[services[0].id]))
      feedService.fetchTopics.withArgs(services[1].id).and.returnValue(of(topicsForService[services[1].id]))
      feedService.previewFeed.and.returnValue(of(emptyPreview))

      const stateBeforeChange: FeedEditState = {
        availableServices: services,
        selectedService: services[0],
        availableTopics: topicsForService[services[0].id],
        selectedTopic: topicsForService[services[0].id][0],
        fetchParameters: { firstService: true },
        itemPropertiesSchema: { properties: { test: { type: 'boolean', title: 'Test' }}},
        topicMetaData: feedMetaDataLean(topicsForService[services[0].id][0]),
        feedMetaData: { title: 'Test', itemPrimaryProperty: 'test' },
        originalFeed: null,
        preview: emptyPreview
      }

      feedEdit.newFeed()
      feedEdit.selectService(stateBeforeChange.selectedService.id)
      feedEdit.selectTopic(stateBeforeChange.selectedTopic.id)
      feedEdit.fetchParametersChanged(stateBeforeChange.fetchParameters)
      feedEdit.itemPropertiesSchemaChanged(stateBeforeChange.itemPropertiesSchema)
      feedEdit.feedMetaDataChanged(stateBeforeChange.feedMetaData)

      expect(feedEdit.currentState).toEqual(stateBeforeChange)

      feedEdit.selectService(services[1].id)

      const stateAfterChange: FeedEditState = {
        ...emptyState,
        availableServices: services,
        selectedService: services[1],
        availableTopics: topicsForService[services[1].id]
      }
      expect(feedEdit.currentState).toEqual(stateAfterChange)
    })

    it('does nothing when selecting an invalid topic', () => {
      // TODO: this might not be right. should the observable dispatch an error?

      feedService.fetchServices.and.returnValue(of(services))
      feedService.fetchTopics.withArgs(services[0].id).and.returnValue(of(topicsForService[services[0].id]))

      feedEdit.newFeed()
      feedEdit.selectService(services[0].id)

      const changes: FeedEditState[] = [
        emptyState,
        emptyState,
        {
          ...emptyState,
          availableServices: services
        },
        {
          ...emptyState,
          availableServices: services,
          selectedService: services[0]
        },
        {
          ...emptyState,
          availableServices: services,
          selectedService: services[0],
          availableTopics: topicsForService[services[0].id]
        }
      ]

      expect(stateChanges.state.observed).toEqual(changes)

      const invalidTopicId = topicsForService[services[0].id][0].id + String(Date.now())
      feedEdit.selectTopic(invalidTopicId)

      expect(stateChanges.state.observed).toEqual(changes)
    })

    it('initiating a new create process resets everything after values changed', () => {

      feedService.fetchServices.and.returnValue(of(services))
      feedService.fetchTopics.withArgs(services[0].id).and.returnValue(of(topicsForService[services[0].id]))
      feedService.fetchTopics.withArgs(services[1].id).and.returnValue(of(topicsForService[services[1].id]))
      feedService.previewFeed.and.returnValue(of(emptyPreview))

      const stateBefore: FeedEditState = {
        availableServices: services,
        selectedService: services[0],
        availableTopics: topicsForService[services[0].id],
        selectedTopic: topicsForService[services[0].id][0],
        fetchParameters: { firstService: true },
        itemPropertiesSchema: { properties: { test: { type: 'boolean', title: 'Test' }}},
        topicMetaData: feedMetaDataLean(topicsForService[services[0].id][0]),
        feedMetaData: { title: 'Test', itemPrimaryProperty: 'test' },
        originalFeed: null,
        preview: emptyPreview
      }

      feedEdit.newFeed()
      feedEdit.selectService(stateBefore.selectedService.id)
      feedEdit.selectTopic(stateBefore.selectedTopic.id)
      feedEdit.fetchParametersChanged(stateBefore.fetchParameters)
      feedEdit.itemPropertiesSchemaChanged(stateBefore.itemPropertiesSchema)
      feedEdit.feedMetaDataChanged(stateBefore.feedMetaData)

      expect(feedEdit.currentState).toEqual(stateBefore)

      feedEdit.newFeed()

      const stateAfterChange: FeedEditState = {
        ...emptyState,
        availableServices: services
      }
      expect(feedEdit.currentState).toEqual(stateAfterChange)
    })

    it('refreshes services after creating a service and selects the created service', () => {

      const created: Service = {
        id: 'created',
        serviceType: 'test_type',
        title: 'Created Service',
        summary: 'For new feed',
        config: { test: true }
      }
      const createdTopics: FeedTopic[] = [
        {
          id: 'createdtopic1',
          title: 'Topic of New Service'
        }
      ]
      feedService.fetchServices.and.returnValues(
        of(services),
        of([ ...services, created ])
      )
      feedService.fetchTopics.withArgs(created.id).and.returnValue(of(createdTopics))
      feedEdit.newFeed()
      feedEdit.serviceCreated(created)

      const expectedStates: FeedEditState[] = [
        emptyState,
        emptyState,
        {
          ...emptyState,
          availableServices: services
        },
        emptyState,
        {
          ...emptyState,
          availableServices: [ ...services, created ],
          selectedService: created
        },
        {
          ...emptyState,
          availableServices: [ ...services, created ],
          selectedService: created,
          availableTopics: createdTopics
        },
      ]
      expect(stateChanges.state.observed).toEqual(expectedStates)
      expect(feedEdit.currentState).toEqual(expectedStates[expectedStates.length - 1])
    })
  })

  describe('editing an existing feed', () => {

    it('resets to empty state first', () => {

      feedService.fetchFeed.and.returnValue(of<FeedExpanded>(asapScheduler))

      feedEdit.editFeed('inconsequential')

      expect(feedEdit.currentState).toEqual(emptyState)
      expect(stateChanges.latest).toEqual(emptyState)
      expect(stateChanges.eachObserved).toEqual({
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
      expect(stateChanges.eachObserved).toEqual(<FeedEditChangeRecorder['eachObserved']>{
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
      feedService.fetchFeed.withArgs(feed.id).and.returnValue(of(feed))
      feedService.previewFeed.and.returnValue(of(emptyPreview))

      feedEdit.editFeed(feed.id)

      expect(feedEdit.currentState.availableServices).toEqual([ feed.service ])
      expect(feedEdit.currentState.selectedService).toEqual(feed.service)
      expect(feedEdit.currentState.availableTopics).toEqual([ feed.topic ])
      expect(feedEdit.currentState.selectedTopic).toEqual(feed.topic)

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
      expect(stateChanges.eachObserved.availableServices).toEqual([ [], [], [ feed.service ] ])
      expect(stateChanges.eachObserved.selectedService).toEqual([ null, null, feed.service ])
      expect(stateChanges.eachObserved.availableTopics).toEqual([ [], [], [ feed.topic ] ])
      expect(stateChanges.eachObserved.selectedTopic).toEqual([ null, null, feed.topic ])
    })

    it('does nothing after creating a new service', () => {
      fail('todo')
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

  it('refreshes preview content when fetch parameters change', () => {
    fail('todo')
  })
})