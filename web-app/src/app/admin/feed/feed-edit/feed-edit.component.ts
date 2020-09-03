import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FeedService } from 'src/app/feed/feed.service';
import { Feed, Service, FeedTopic } from 'src/app/feed/feed.model';
import { FormControl } from '@angular/forms';
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

  serviceSearchControl: FormControl = new FormControl();
  topicSearchControl: FormControl = new FormControl();


  services: Array<Service>;
  selectedService: Service;


  topics: Array<FeedTopic>;
  selectedTopic: FeedTopic;


  itemProperties: any[];

  preview: any;

  feedConfiguration: any;
  constantParams: any;

  step = -1;

  debouncedPreview: any;
  // customWidgets: any;

  constructor(
    private feedService: FeedService,
    private stateService: StateService,
    private cdr: ChangeDetectorRef
  ) {
    this.debouncedPreview = _.debounce(this.previewFeed, 500);

    this.constantParams = {};
  }

  ngOnInit(): void {
    if (this.stateService.params.feedId) {
      this.feedService.fetchFeed(this.stateService.params.feedId).subscribe(feed => {
        this.feed = feed;
        this.feedService.fetchService(this.feed.service).subscribe(service => {
          this.services = [service];
          this.selectedService = service;
          this.feedService.fetchTopic(this.selectedService.id, this.feed.topic).subscribe(topic => {
            this.topics = [topic];
            this.selectedTopic = topic;
            this.topicSelected();
            console.log('feed', feed);
            this.setStep(1);
            this.previewFeed();
          });
        });

      });
    } else {
      this.feedService.fetchServices().subscribe(services => {
        this.services = services;
        if (this.services && this.services.length !== 0) {
          this.setStep(0);
        }
        if (!this.services || this.services.length === 0) {
          this.setStep(-1);
        }
        if (this.services.length === 1) {
          this.selectedService = this.services[0];
          this.serviceSelected();
        }
      });
    }
  }

  serviceCreationCancelled(): void {
    console.log('service creation cancelled')
    this.setStep(0);
  }

  serviceCreated(service: Service): void {
    this.services.push(service);
    this.selectedService = service;
    this.setStep(0);
    this.serviceSelected();
  }

  serviceSelected(): void {
    this.feedService.fetchTopics(this.selectedService.id).subscribe(topics => {
      this.topics = topics;
      if (this.topics.length === 1) {
        this.selectedTopic = this.topics[0];
        this.topicSelected();
      }
    });
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

  topicSelected(): void {
    this.itemProperties = this.selectedTopic.itemPropertiesSchema.map(value => {
      return {
        key: value.key,
        schema: value.schema
      };
    });
  }

  topicConfigured(topicParameters: any): void {
    this.previewFeed();
    this.nextStep();
  }

  topicConfigChanged(topicParameters: any): void {
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
    // feedPreviewRequest.feed = { constantParams: this.constantParams };
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
    this.feedConfiguration.itemPropertiesSchema = this.itemProperties;
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
