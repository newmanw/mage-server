import { Component, OnInit } from '@angular/core';
import { StateService } from '@uirouter/angular';
import { Feed, FeedTopic, Service } from 'src/app/feed/feed.model';
import { FeedService } from 'src/app/feed/feed.service';
import * as _ from 'underscore';

@Component({
  selector: 'app-feed-edit',
  templateUrl: './feed-edit.component.html',
  styleUrls: ['./feed-edit.component.scss']
})
export class FeedEditComponent implements OnInit {
  feed: Feed;
  currentItemProperties: any;
  hasFeedDeletePermission: boolean;

  selectedService: Service;
  selectedTopic: FeedTopic;
  configuredTopic: any;
  createdService: Service;

  itemPropertiesSchema: any;
  itemProperties: any[];

  preview: any;

  feedConfiguration: any;
  constantParams: any;
  configuredParams: any;

  step = 0;

  debouncedPreview: any;

  constructor(
    private feedService: FeedService,
    private stateService: StateService
  ) {
    this.debouncedPreview = _.debounce(this.previewFeed, 500);

    this.constantParams = {};
    this.configuredTopic = {};
  }

  ngOnInit(): void {
    if (this.stateService.params.feedId) {
      this.feedService.fetchFeed(this.stateService.params.feedId).subscribe(feed => {
        this.feed = feed;
        this.constantParams = this.configuredParams = feed.constantParams;
        this.selectedService = this.feed.service as Service;
        this.selectedTopic = this.feed.topic;
        this.step = 1;
        this.serviceAndTopicSelected({service: this.selectedService, topic: this.selectedTopic});
        this.configuredTopic = this.feed;
        this.debouncedPreview();
      });
    }
  }

  noServicesExist(): void {
    this.setStep(0);
  }

  serviceCreationCancelled(): void {
    this.setStep(0);
  }

  serviceCreated(service: Service): void {
    this.createdService = service;
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

  serviceAndTopicSelected(serviceAndTopic: {service: Service, topic: FeedTopic}): void {
    this.selectedTopic = this.configuredTopic = serviceAndTopic.topic;
    this.selectedService = serviceAndTopic.service;
    if (this.feed) {
      this.itemPropertiesSchema = this.feed.itemPropertiesSchema;
    } else {
      this.itemPropertiesSchema = {};
    }
    this.nextStep();
  }

  topicConfigured(topicParameters: any): void {
    this.configuredParams = topicParameters;
    this.configuredTopic.constantParams = topicParameters;
    this.previewFeed();
    this.nextStep();
  }

  topicConfigChanged(topicParameters: any): void {
    this.configuredParams = topicParameters;

    if (this.feed) {
      this.debouncedPreview();
    }
  }

  previewFeed(): void {
    const feedPreviewRequest = {
      feed: { constantParams: this.configuredParams }
    };
    this.feedService.previewFeed(this.selectedService.id, this.selectedTopic.id, feedPreviewRequest)
      .subscribe(preview => {
        this.preview = preview;
      });
  }

  itemPropertiesUpdated(itemProperties: any): void {
    this.currentItemProperties = itemProperties;
    this.nextStep();
  }

  feedConfigurationChanged(feedConfiguration: any): void {
    if (this.preview) {
      this.preview.feed = feedConfiguration;
    }
  }

  feedConfigurationSet(feedConfiguration: any): void {
    this.feedConfiguration = feedConfiguration;
    if (this.feed) {
      this.updateFeed();
    } else {
      this.createFeed();
    }
  }

  createFeed(): void {
    this.feedConfiguration.service = this.selectedService.id;
    this.feedConfiguration.topic = this.selectedTopic.id;
    this.feedConfiguration.constantParams = this.configuredParams;
    this.feedConfiguration.itemPropertiesSchema = this.currentItemProperties;
    this.feedService.createFeed(this.selectedService.id, this.selectedTopic.id, this.feedConfiguration).subscribe(feed => {
      this.stateService.go('admin.feed', { feedId: feed.id });
    });
  }

  updateFeed(): void {
    this.feed.constantParams = this.configuredParams;
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
