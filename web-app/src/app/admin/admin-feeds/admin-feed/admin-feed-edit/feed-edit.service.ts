import { Serializer } from '@angular/compiler'
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

type StatePatch = Partial<FeedEditState>

const freshState = (): Readonly<FeedEditState> => {
  return Object.freeze({
    originalFeed: null,
    availableServices: [],
    selectedService: null,
    availableTopics: [],
    selectedTopic: null,
    fetchParameters: null,
    itemPropertiesSchema: null,
    topicMetaData: null,
    feedMetaData: null,
    preview: null
  })
}

/**
 * This is a stateful service that implements the process of creating or
 * editing a feed.
 */
export class FeedEditService {

  private stateSubject = new BehaviorSubject<FeedEditState>(freshState())
  private _state$ = this.stateSubject.pipe()

  private patchState(patch: StatePatch) {
    const state = { ...this.stateSubject.value, ...patch }
    this.stateSubject.next(state)
  }

  get state$(): Observable<FeedEditState> {
    return this._state$
  }

  get currentState(): FeedEditState {
    return this.stateSubject.value
  }

  constructor(@Inject(forwardRef(() => FeedService)) private feedService: FeedService) {}

  editFeed(feedId: string) {
    this.resetState()
    this.feedService.fetchFeed(feedId).subscribe({
      next: (feed) => {
        const service = feed.service as Service
        const topic = feed.topic as FeedTopic
        const feedCopy = _.cloneDeep(feed)
        const patch: StatePatch = {
          originalFeed: feedCopy,
          availableServices: [ service ],
          selectedService: service,
          availableTopics: [ topic ],
          selectedTopic: topic,
          fetchParameters: feed.constantParams || null,
          itemPropertiesSchema: feed.itemPropertiesSchema || null,
          topicMetaData: feedMetaDataLean(topic),
          feedMetaData: feedMetaDataLean(feed)
        }
        this.patchState(patch)
        this.fetchNewPreview()
      }
    })
  }

  newFeed(): void {
    this.resetAndFetchServices(null)
  }

  serviceCreated(service: Service): void {
    this.resetAndFetchServices(service.id)
  }

  selectService(serviceId: string | null): void {
    if (this.currentState.originalFeed) {
      return
    }
    this.selectServiceWithAvailableServices(serviceId)
  }

  private selectServiceWithAvailableServices(serviceId: string | null, nextAvailableServices?: Service[]): void {
    const selectedService = this.currentState.selectedService
    const services = nextAvailableServices || this.currentState.availableServices
    let nextService: Service | null = null
    if (serviceId) {
      nextService = services.find(x => x.id === serviceId) || null
    }
    const patchService: boolean = (selectedService && !nextService) || (nextService && !selectedService)
      || (selectedService && nextService && selectedService.id !== nextService.id)
    if (!patchService && !nextAvailableServices) {
      return
    }
    const patch: StatePatch = { ...freshState() }
    patch.availableServices = services
    if (patchService) {
      patch.selectedService = nextService
    }
    this.patchState(patch)
    if (!serviceId) {
      return
    }
    this.feedService.fetchTopics(serviceId).subscribe({
      next: (topics) => {
        this.patchState({ availableTopics: topics })
      }
    })
  }

  selectTopic(topicId: string | null) {
    const patch = this.patchToSelectTopic(topicId)
    if (patch) {
      this.patchState(patch)
    }
  }

  private patchToSelectTopic(topicId: string | null): StatePatch | null {
    if (this.currentState.originalFeed) {
      return null
    }
    const topics = this.currentState.availableTopics || []
    let topic: FeedTopic | null = null
    if (topicId) {
      topic = topics.find(x => x.id === topicId)
      if (!topic) {
        return null
      }
    }
    const safeTopic = topic || {} as FeedTopic
    const patch: StatePatch = {
      selectedTopic: topic,
      itemPropertiesSchema: topic ? _.cloneDeep(safeTopic.itemPropertiesSchema) || null : null,
      topicMetaData: topic ? feedMetaDataLean(topic) : null,
      fetchParameters: null,
      feedMetaData: null,
      preview: null
      // TODO: handle topic icon properly
    }
    return patch
  }

  fetchParametersChanged(fetchParameters: any) {
    this.patchState({ fetchParameters })
    this.fetchNewPreview()
    // TODO: refresh preview through rx debounce operator
  }

  itemPropertiesSchemaChanged(itemPropertiesSchema: any) {
    this.patchState({ itemPropertiesSchema })
  }

  feedMetaDataChanged(feedMetaData: FeedMetaData) {
    this.patchState({ feedMetaData })
  }

  private resetState(): void {
    this.patchState(freshState())
  }

  private resetAndFetchServices(serviceIdToSelect?: string | null): void {
    this.resetState()
    this.feedService.fetchServices().subscribe({
      next: (services) => {
        if (!serviceIdToSelect) {
          this.patchState({
            availableServices: services
          })
          return
        }
        this.selectServiceWithAvailableServices(serviceIdToSelect || null, services)
      }
    })
  }

  private fetchNewPreview(): void {
    // TODO: add busy flag to indicate loading
    // TODO: cancel outstanding preview fetch
    const service = this.currentState.selectedService
    const topic = this.currentState.selectedTopic
    if (!service || !topic) {
      return
    }
    this.patchState({ preview: null })
    const feed: Partial<Omit<Feed, 'id'>> = {
      service: service.id,
      topic: topic.id,
      ...this.currentState.feedMetaData
    }
    const fetchParams = this.currentState.fetchParameters || {}
    if (Object.getOwnPropertyNames(fetchParams).length) {
      feed.constantParams = _.cloneDeep(fetchParams)
    }
    const itemSchema = this.currentState.itemPropertiesSchema || {}
    if (Object.getOwnPropertyNames(itemSchema)) {
      feed.itemPropertiesSchema = _.cloneDeep(this.currentState.itemPropertiesSchema)
    }
    // TODO: handle errors
    this.feedService.previewFeed(service.id, topic.id, feed).subscribe({
      next: preview => {
        this.patchState({ preview })
      }
    })
  }
}