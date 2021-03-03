import { forwardRef, Inject } from '@angular/core'
import * as _ from 'lodash'
import { BehaviorSubject, Observable, PartialObserver } from 'rxjs'
import { Feed, FeedTopic, Service } from '../../../../feed/feed.model'
import { FeedPreviewOptions, FeedService } from '../../../../feed/feed.service'
import { FeedEditState, FeedMetaData, feedMetaDataLean, feedPostFromEditState, freshEditState } from './feed-edit.model'


export type FeedEditStateObservers = {
  [stateKey in keyof FeedEditState]: PartialObserver<FeedEditState[stateKey]>
}

type StatePatch = Partial<FeedEditState>

/**
 * This is a stateful service that implements the process of creating or
 * editing a feed.
 */
export class FeedEditService {

  private stateSubject = new BehaviorSubject<FeedEditState>(freshEditState())
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
    if (this.currentState.originalFeed) {
      return
    }
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
    const patch: StatePatch = { ...freshEditState() }
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
    const patch: StatePatch = {
      selectedTopic: topic,
      itemPropertiesSchema: null,
      fetchParameters: null,
      feedMetaData: null,
      preview: null
      // TODO: handle topic icon properly
    }
    return patch
  }

  fetchParametersChanged(fetchParameters: any) {
    if (!this.currentState.selectedTopic) {
      return
    }
    if (fetchParameters === this.currentState.fetchParameters) {
      return
    }
    let preview = null
    if (this.currentState.preview) {
      preview = {
        ...this.currentState.preview,
        content: null
      }
    }
    this.patchState({ fetchParameters, preview })
    this.patchState({ fetchParameters })
    if (fetchParameters === null) {
      return
    }
    this.fetchNewPreview()
  }

  itemPropertiesSchemaChanged(itemPropertiesSchema: any) {
    this.patchState({ itemPropertiesSchema })
  }

  feedMetaDataChanged(feedMetaData: FeedMetaData) {
    if (!this.currentState.selectedTopic) {
      return
    }
    this.patchState({ feedMetaData: feedMetaDataLean(feedMetaData) })
    this.fetchNewPreview({ skipContentFetch: true })
  }

  saveFeed(): Observable<Feed> {
    throw new Error('unimplemented')
  }

  private resetState(): void {
    this.patchState(freshEditState())
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

  private fetchNewPreview(opts?: FeedPreviewOptions): void {
    // TODO: add busy flag to indicate loading
    // TODO: cancel outstanding preview fetch
    const feed = feedPostFromEditState(this.currentState)
    const { service, topic, ...feedSpec } = feed
    // TODO: handle errors
    this.feedService.previewFeed(service, topic, feedSpec, opts || { skipContentFetch: false }).subscribe({
      next: preview => {
        const currentPreview = this.currentState.preview
        if (!preview.content && currentPreview && currentPreview.content) {
          preview = {
            ...preview,
            content: currentPreview.content
          }
        }
        this.patchState({ preview })
      }
    })
  }
}