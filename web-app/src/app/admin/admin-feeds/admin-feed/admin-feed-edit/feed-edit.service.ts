import { forwardRef, Inject } from '@angular/core'
import * as _ from 'lodash'
import { BehaviorSubject, Observable, PartialObserver } from 'rxjs'
import { Feed, FeedTopic, Service } from '../../../../feed/feed.model'
import { FeedService } from '../../../../feed/feed.service'

type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K }[keyof T];
type OptionalKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never }[keyof T];
type PickRequired<T> = Pick<T, RequiredKeys<T>>;
type PickOptional<T> = Pick<T, OptionalKeys<T>>;
type Nullable<T> = { [P in keyof T]: T[P] | null };
type NullableOptional<T> = PickRequired<T> & Nullable<PickOptional<T>>;

type FeedMetaDataKeys =
  | 'title'
  | 'summary'
  | 'icon'
  | 'itemsHaveIdentity'
  | 'itemsHaveSpatialDimension'
  | 'itemPrimaryProperty'
  | 'itemSecondaryProperty'
  | 'itemTemporalProperty'

export type FeedMetaData = Pick<Feed, FeedMetaDataKeys>
export type FeedMetaDataNullable = Required<NullableOptional<FeedMetaData>>

export interface FeedEditState {
  originalFeed: Feed | null
  availableServices: Service[]
  selectedService: Service | null
  availableTopics: FeedTopic[]
  selectedTopic: FeedTopic | null
  fetchParameters: object | null
  itemPropertiesSchema: object | null
  feedMetaData: FeedMetaData | null
  preview: object | null
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
    originalFeed: new BehaviorSubject<Feed>(null),
    availableServices: new BehaviorSubject<Service[]>([]),
    selectedService: new BehaviorSubject<Service | null>(null),
    availableTopics: new BehaviorSubject<FeedTopic[]>([]),
    selectedTopic: new BehaviorSubject<FeedTopic | null>(null),
    fetchParameters: new BehaviorSubject<object | null>(null),
    itemPropertiesSchema: new BehaviorSubject<object | null>(null),
    feedMetaData: new BehaviorSubject<FeedMetaData | null>(null),
    preview: new BehaviorSubject<object | null>(null)
  }

  changes: FeedEditStateChanges = this.state

  constructor(@Inject(forwardRef(() => FeedService)) private feedService: FeedService) {}

  editFeed(feedId: string | null) {
    this.feedService.fetchFeed(feedId).subscribe({
      next: (feed) => {
        const state = this.state
        const service = feed.service as Service
        const topic = feed.topic
        state.availableServices.next([ service ])
        state.availableTopics.next([ topic ])
        state.selectedService.next(service)
        state.selectedTopic.next(topic)
        state.fetchParameters.next(feed.constantParams)
        state.itemPropertiesSchema.next(feed.itemPropertiesSchema)
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
        state.preview.next(null)
        const feedCopy = _.cloneDeep(feed)
        state.originalFeed.next(feedCopy)
      }
    })
  }

  newFeed(): void {
    this.state.originalFeed.next(null)
    this.state.availableTopics.next([])
    this.state.selectedService.next(null)
    this.state.selectedTopic.next(null)
    this.state.fetchParameters.next(null)
    this.state.itemPropertiesSchema.next(null)
    this.state.feedMetaData.next(null)
    this.state.preview.next(null)
    this.refreshAvailableServices(null)
  }

  serviceCreated(service: Service): void {
    this.refreshAvailableServices(service)
  }

  selectService(service: Service | null) {
    if (this.state.originalFeed.getValue()) {
      return
    }
    if (this.state.selectedService.getValue() === service) {
      return
    }
    this.selectTopic(null)
    this.state.availableTopics.next([])
    if (service) {
      this.feedService.fetchTopics(service.id).subscribe({
        next: (topics) => {
          this.state.availableTopics.next(topics)
        }
      })
    }
    this.state.selectedService.next(service)
  }

  selectTopic(topic: FeedTopic | null) {
    if (this.state.originalFeed.getValue()) {
      return
    }
    const topics = this.state.availableTopics.getValue() || []
    if (topic) {
      topic = topics.find(x => x.id === topic.id)
    }
    if (!topic) {
      this.state.itemPropertiesSchema.next(null)
      this.state.feedMetaData.next(null)
      return
    }
    this.state.selectedTopic.next(topic)
    this.state.itemPropertiesSchema.next(_.cloneDeep(topic.itemPropertiesSchema))
    // TODO: populate from topic
    // TODO: what do with topic icon?
    this.state.feedMetaData.next({
      title: topic.title,
      summary: topic.summary,
      icon: topic.icon,
      itemPrimaryProperty: topic.itemPrimaryProperty,
      itemSecondaryProperty: topic.itemSecondaryProperty,
      itemTemporalProperty: topic.itemTemporalProperty,
      itemsHaveIdentity: topic.itemsHaveIdentity,
      itemsHaveSpatialDimension: topic.itemsHaveSpatialDimension
    })
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

  private refreshAvailableServices(serviceToSelect?: Service | null): void {
    this.feedService.fetchServices().subscribe({
      next: (services) => {
        this.state.availableServices.next(services)
        this.selectService(serviceToSelect || null)
      }
    })
  }
}