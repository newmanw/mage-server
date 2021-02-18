import { forwardRef, Inject } from '@angular/core'
import * as _ from 'lodash'
import { BehaviorSubject, Observable, PartialObserver } from 'rxjs'
import { Feed, FeedPreview, FeedTopic, Service } from '../../../../feed/feed.model'
import { FeedExpanded, FeedService } from '../../../../feed/feed.service'
import { FeedMetaData, feedMetaDataLean } from './feed-edit.model'


export interface FeedEditState {
  originalFeed: FeedExpanded | null
  availableServices: Service[]
  selectedService: Service | null
  availableTopics: FeedTopic[]
  selectedTopic: FeedTopic | null
  fetchParameters: any | null
  itemPropertiesSchema: any | null
  topicMetaData: FeedMetaData | null
  feedMetaData: FeedMetaData | null
  preview: FeedPreview | null
}

type FeedEditStateChanges = {
  [stateKey in keyof FeedEditState]: Observable<FeedEditState[stateKey]>
}

type FeedEditStateSubjects = {
  [stateKey in keyof FeedEditState]: BehaviorSubject<FeedEditState[stateKey]>
}

export type FeedEditStateObservers = {
  [stateKey in keyof FeedEditState]: PartialObserver<FeedEditState[stateKey]>
}

/**
 * This is a stateful service that implements the process of creating or
 * editing a feed.
 */
export class FeedEditService {

  private state: FeedEditStateSubjects = {
    originalFeed: new BehaviorSubject<FeedExpanded | null>(null),
    availableServices: new BehaviorSubject<Service[]>([]),
    selectedService: new BehaviorSubject<Service | null>(null),
    availableTopics: new BehaviorSubject<FeedTopic[]>([]),
    selectedTopic: new BehaviorSubject<FeedTopic | null>(null),
    fetchParameters: new BehaviorSubject<any | null>(null),
    itemPropertiesSchema: new BehaviorSubject<any | null>(null),
    topicMetaData: new BehaviorSubject<FeedMetaData | null>(null),
    feedMetaData: new BehaviorSubject<FeedMetaData | null>(null),
    preview: new BehaviorSubject<FeedPreview | null>(null)
  }

  changes: FeedEditStateChanges = this.state

  get currentState(): FeedEditState {
    return {
      originalFeed: this.state.originalFeed.value,
      availableServices: this.state.availableServices.value,
      selectedService: this.state.selectedService.value,
      availableTopics: this.state.availableTopics.value,
      selectedTopic: this.state.selectedTopic.value,
      fetchParameters: this.state.fetchParameters.value,
      itemPropertiesSchema: this.state.itemPropertiesSchema.value,
      topicMetaData: this.state.topicMetaData.value,
      feedMetaData: this.state.feedMetaData.value,
      preview: this.state.preview.value
    }
  }

  constructor(@Inject(forwardRef(() => FeedService)) private feedService: FeedService) {}

  editFeed(feedId: string) {
    this.resetState()
    this.feedService.fetchFeed(feedId).subscribe({
      next: (feed) => {
        const state = this.state
        const service = feed.service as Service
        const topic = feed.topic as FeedTopic
        const feedCopy = _.cloneDeep(feed)
        state.originalFeed.next(feedCopy)
        state.availableServices.next([ service ])
        state.availableTopics.next([ topic ])
        state.selectedService.next(service)
        state.selectedTopic.next(topic)
        state.fetchParameters.next(feed.constantParams)
        state.itemPropertiesSchema.next(feed.itemPropertiesSchema)
        state.topicMetaData.next(feedMetaDataLean(topic))
        state.feedMetaData.next({
          title: feed.title,
          summary: feed.summary,
          icon: feed.icon,
          itemPrimaryProperty: feed.itemPrimaryProperty,
          itemSecondaryProperty: feed.itemSecondaryProperty,
          itemTemporalProperty: feed.itemTemporalProperty,
          itemsHaveIdentity: feed.itemsHaveIdentity,
          itemsHaveSpatialDimension: feed.itemsHaveSpatialDimension
        })
        this.fetchNewPreview()
      }
    })
  }

  newFeed(): void {
    this.resetState()
    this.fetchAvailableServices(null)
  }

  serviceCreated(service: Service): void {
    this.fetchAvailableServices(service.id)
  }

  selectService(serviceId: string | null) {
    if (this.state.originalFeed.value) {
      return
    }
    const selectedService = this.state.selectedService.value
    if (selectedService && selectedService.id === serviceId) {
      return
    }
    const nextService = this.state.availableServices.value.find(x => x.id === serviceId)
    if (!nextService) {
      return
    }
    if (selectedService) {
      if (this.state.selectedTopic.value) {
        this.selectTopic(null)
      }
      this.state.availableTopics.next([])
    }
    this.state.selectedService.next(nextService)
    this.feedService.fetchTopics(nextService.id).subscribe({
      next: (topics) => {
        this.state.availableTopics.next(topics)
      }
    })
  }

  selectTopic(topicId: string | null) {
    if (this.state.originalFeed.value) {
      return
    }
    const topics = this.state.availableTopics.value || []
    const topic = topics.find(x => x.id === topicId)
    if (!topic) {
      // TODO: anything else here?
      return
    }
    this.state.selectedTopic.next(topic)
    this.state.itemPropertiesSchema.next(_.cloneDeep(topic.itemPropertiesSchema))
    // TODO: what do with topic icon?
    const metaData = feedMetaDataLean(topic)
    this.state.feedMetaData.next(metaData)
  }

  fetchParametersChanged(fetchParameters: any) {
    this.state.fetchParameters.next(fetchParameters)
    // TODO: refresh preview through rx debounce operator
  }

  itemPropertiesSchemaChanged(itemPropertiesSchema: any) {
    this.state.itemPropertiesSchema.next(itemPropertiesSchema)
  }

  feedMetaDataChanged(metaData: FeedMetaData) {
    this.state.feedMetaData.next(metaData)
  }

  private resetState(): void {
    this.state.originalFeed.next(null)
    this.state.availableServices.next([])
    this.state.availableTopics.next([])
    this.state.selectedTopic.next(null)
    this.state.selectedService.next(null)
    this.state.fetchParameters.next(null)
    this.state.itemPropertiesSchema.next(null)
    this.state.topicMetaData.next(null)
    this.state.feedMetaData.next(null)
    this.state.preview.next(null)
  }

  private fetchAvailableServices(serviceIdToSelect?: string | null): void {
    this.feedService.fetchServices().subscribe({
      next: (services) => {
        this.state.availableServices.next(services)
        this.selectService(serviceIdToSelect || null)
      }
    })
  }

  private fetchNewPreview(): void {
    // TODO: add busy flag to indicate loading
    // TODO: cancel outstanding refresh?
    const service = this.state.selectedService.value
    const topic = this.state.selectedTopic.value
    if (!service || !topic) {
      this.state.preview.next(null)
      return
    }
    const feed: Partial<Omit<Feed, 'id'>> = {
      service: service.id,
      topic: topic.id,
      ...this.state.feedMetaData.value as FeedMetaData,
    }
    const fetchParams = _.cloneDeep(this.state.fetchParameters.value || {})
    if (Object.getOwnPropertyNames(fetchParams).length) {
      feed.constantParams = { ...this.state.fetchParameters.value }
    }
    const itemSchema = _.cloneDeep(this.state.itemPropertiesSchema || {})
    if (Object.getOwnPropertyNames(itemSchema)) {
      feed.itemPropertiesSchema = { ...this.state.itemPropertiesSchema.value }
    }
    this.feedService.previewFeed(service.id, topic.id, feed).subscribe({
      next: preview => {
        this.state.preview.next(preview)
      }
    })
  }
}