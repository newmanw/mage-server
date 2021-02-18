import { Component, OnInit } from '@angular/core';
import { StateService } from '@uirouter/angular';
import { NextObserver } from 'rxjs'
import * as _ from 'underscore';
import { Feed, FeedTopic, Service } from '../../../../feed/feed.model';
import { FeedService } from '../../../../feed/feed.service';
import { AdminBreadcrumb } from '../../../admin-breadcrumb/admin-breadcrumb.model';
import { FeedMetaData } from './feed-edit.model'
import { FeedEditService, FeedEditState, FeedEditStateObservers } from './feed-edit.service'

@Component({
  selector: 'app-feed-edit',
  templateUrl: './admin-feed-edit.component.html',
  styleUrls: ['./admin-feed-edit.component.scss'],
  providers: [FeedEditService]
})
export class AdminFeedEditComponent implements OnInit {
  breadcrumbs: AdminBreadcrumb[] = [{
    title: 'Feeds',
    icon: 'rss_feed',
    state: {
      name: 'admin.feeds'
    }
  }]

  feed: Feed;
  currentItemProperties: any;
  hasFeedDeletePermission: boolean;

  selectedService: Service | null;
  selectedTopic: FeedTopic | null;
  configuredTopic: any;

  itemPropertiesSchema: object;
  itemProperties: any[];

  preview: any;

  feedConfiguration: any;
  constantParams: any;
  fetchParametersMod: any;

  step = 0;

  debouncedPreview: any;

  editState: FeedEditState = {
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
  }

  private observers = Object.getOwnPropertyNames(this.editState).reduce((stateObservers, stateKey) => {
    const observer: NextObserver<any> = { next: (x) => {
      this.editState[stateKey] = x
    }}
    stateObservers[stateKey] = observer
    return stateObservers
  }, {})

  constructor(
    private feedEdit: FeedEditService,
    private feedService: FeedService,
    private stateService: StateService
  ) {
    this.debouncedPreview = _.debounce(this.previewFeed, 500);
    this.constantParams = {};
    this.configuredTopic = {};

    if (this.stateService.params.feedId) {
      this.breadcrumbs = this.breadcrumbs.concat([{
        title: ''
      }, {
        title: 'Edit'
      }]);
    } else {
      this.breadcrumbs.push({
        title: 'New'
      })
    }
  }

  ngOnInit(): void {
    for (const stateKey of Object.getOwnPropertyNames(this.editState)) {
      this.feedEdit.changes[stateKey].subscribe(this.observers[stateKey])
    }
    if (this.stateService.params.feedId) {
      this.feedEdit.editFeed(this.stateService.params.feedId)
      this.feedEdit.changes.originalFeed.subscribe(feed => {
        if (feed) {
          this.breadcrumbs[1] = {
            title: feed.title,
            state: {
              name: 'admin.feed',
              params: {
                feedId: feed.id
              }
            }
          }
          this.step = 1;
          this.debouncedPreview();
        }
      });
    }
    else {
      this.feedEdit.newFeed()
    }
  }

  noServicesExist(): void {
    this.setStep(0);
  }

  serviceCreationCancelled(): void {
    this.setStep(0);
  }

  serviceCreated(service: Service): void {
    this.feedEdit.serviceCreated(service)
    this.setStep(0);
  }

  itemPropertiesSchemaToTitleMap(value: any): any {
    if (!value.schema) {
      return;
    }
    return {
      name: value.schema.title,
      value: value.key
    };
  }

  serviceSelected(service: Service): void {
    this.feedEdit.selectService(service.id)
  }

  topicSelected(topic: FeedTopic): void {
    this.feedEdit.selectTopic(topic.id)
    if (topic) {
      this.nextStep();
    }
  }

  onFetchParametersAccepted(fetchParameters: any): void {
    this.feedEdit.fetchParametersChanged(fetchParameters)
    // this.fetchParametersMod = fetchParameters;
    // this.configuredTopic.constantParams = fetchParameters;
    // this.previewFeed();
    this.nextStep();
  }

  onFetchParametersChanged(fetchParameters: any): void {
    this.feedEdit.fetchParametersChanged(fetchParameters)
    // this.fetchParametersMod = fetchParameters;
    // if (this.feed) {
    //   this.debouncedPreview();
    // }
  }

  previewFeed(): void {
    // const feedPreviewRequest = {
    //   feed: { constantParams: this.fetchParametersMod }
    // };
    // this.feedService.previewFeed(this.selectedService.id, this.selectedTopic.id, feedPreviewRequest)
    //   .subscribe(preview => {
    //     this.preview = preview;
    //   });
  }

  onItemPropertiesSchemaChanged(itemProperties: any): void {
    this.feedEdit.itemPropertiesSchemaChanged(itemProperties)
  }

  onItemPropertiesSchemaAccepted(itemProperties: any): void {
    this.nextStep();
  }

  onFeedMetaDataChanged(metaData: FeedMetaData): void {
    // if (this.preview) {
    //   this.preview.feed = metaData;
    // }
    this.feedEdit.feedMetaDataChanged(metaData)
  }

  onFeedMetaDataAccepted(metaData: FeedMetaData): void {
    // this.feedConfiguration = metaData;
    // if (this.feed) {
    //   this.updateFeed();
    // } else {
    //   this.createFeed();
    // }
  }

  createFeed(): void {
    // this.feedConfiguration.service = this.selectedService.id;
    // this.feedConfiguration.topic = this.selectedTopic.id;
    // this.feedConfiguration.constantParams = this.fetchParametersMod;
    // this.feedConfiguration.itemPropertiesSchema = this.currentItemProperties;
    // this.feedService.createFeed(this.selectedService.id, this.selectedTopic.id, this.feedConfiguration).subscribe(feed => {
    //   this.stateService.go('admin.feed', { feedId: feed.id });
    // });
  }

  updateFeed(): void {
    this.feed.constantParams = this.fetchParametersMod;
    this.feed.itemPropertiesSchema = this.currentItemProperties;
    Object.assign(this.feed, this.feedConfiguration);
    this.feedService.updateFeed(this.feed).subscribe(feed => {
      this.stateService.go('admin.feed', { feedId: feed.id });
    });
  }

  setStep(index: number): void {
    this.step = index;
  }

  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }

  goToFeeds(): void {
    this.stateService.go('admin.feeds');
  }
}
