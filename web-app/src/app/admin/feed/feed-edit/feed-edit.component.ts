import { Component, OnInit } from '@angular/core';
import { FeedService } from 'src/app/feed/feed.service';
import { Feed, Service, FeedTopic } from 'src/app/feed/feed.model';
import { StateService } from '@uirouter/angular';
import * as _ from 'underscore';

@Component({
  selector: 'app-feed-edit',
  templateUrl: './feed-edit.component.html',
  styleUrls: ['./feed-edit.component.scss']
})
export class FeedEditComponent implements OnInit {
  feed: Feed;
  currentItemProperties: Array<any>;
  hasFeedDeletePermission: boolean;

  selectedService: Service;
  selectedTopic: FeedTopic;

  itemProperties: any[];

  preview: any;

  feedConfiguration: any;
  constantParams: any;

  step = 0;

  debouncedPreview: any;

  constructor(
    private feedService: FeedService,
    private stateService: StateService
  ) {
    this.debouncedPreview = _.debounce(this.previewFeed, 500);

    this.constantParams = {};
  }

  ngOnInit(): void {
    if (this.stateService.params.feedId) {
      this.feedService.fetchFeed(this.stateService.params.feedId).subscribe(feed => {
        this.feed = feed;
        this.constantParams = feed.constantParams;
        this.selectedService = this.feed.service;
        this.selectedTopic = this.feed.topic;
        this.step = 1;
        this.serviceAndTopicSelected({service: this.selectedService, topic: this.selectedTopic});
        this.previewFeed();
      });
    }
  }
  noServicesExist(): void {
    this.setStep(0);
  }

  serviceCreationCancelled(): void {
    console.log('service creation cancelled')
    this.setStep(0);
  }

  serviceCreated(service: Service): void {
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
    this.selectedTopic = serviceAndTopic.topic;
    this.selectedService = serviceAndTopic.service;
    // this.itemProperties = this.selectedTopic.itemPropertiesSchema.map(value => {
    //   return {
    //     key: value.key,
    //     schema: value.schema
    //   };
    // });
    this.nextStep();
  }

  topicConfigured(topicParameters: any): void {
    this.constantParams = topicParameters;
    this.previewFeed();
    this.nextStep();
  }

  topicConfigChanged(topicParameters: any): void {
    console.log('topic config changed')
    this.constantParams = topicParameters;

    if (this.feed) {
      console.log('ask to preview');
      this.debouncedPreview();
    }
  }

  previewFeed(): void {
    console.log('previewing feed');
    const feedPreviewRequest = {
      feed: { constantParams: this.constantParams }
    };
    this.feedService.previewFeed(this.selectedService.id, this.selectedTopic.id, feedPreviewRequest)
      .subscribe(preview => {
        console.log('preview', preview);
        this.preview = preview;
      });
  }

  itemPropertiesUpdated(itemProperties: any[]): void {
    this.currentItemProperties = itemProperties;
    console.log('item properties updated', itemProperties);
    this.nextStep();
  }


  feedConfigurationChanged($event: any): void {
    this.feedConfiguration = $event;
    console.log('feed config changed in feed-edit', $event);

    if (this.preview) {
      this.preview.feed = $event;
    }
  }

  feedConfigurationSet(feedConfiguration: any): void {
    console.log('feed configuration', feedConfiguration);
    if (this.feed) {
      this.updateFeed();
    } else {
      this.createFeed();
    }
  }

  createFeed(): void {
    this.feedConfiguration.service = this.selectedService.id;
    this.feedConfiguration.topic = this.selectedTopic.id;
    this.feedConfiguration.constantParams = this.constantParams;
    // this.feedConfiguration.itemPropertiesSchema = this.itemProperties;
    this.feedService.createFeed(this.selectedService.id, this.selectedTopic.id, this.feedConfiguration).subscribe(feed => {
      this.stateService.go('admin.feed', { feedId: feed.id });
    });
  }

  updateFeed(): void {
    this.feed.constantParams = this.constantParams;
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
