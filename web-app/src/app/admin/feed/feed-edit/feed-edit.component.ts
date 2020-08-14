import { Component, OnInit, Input } from '@angular/core';
import { FeedService } from 'src/app/feed/feed.service';
import { ServiceType, Feed, Service, FeedTopic } from 'src/app/feed/feed.model';
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

  hasFeedDeletePermission: boolean;

  searchControl: FormControl = new FormControl();
  serviceSearchControl: FormControl = new FormControl();
  topicSearchControl: FormControl = new FormControl();

  serviceTypes: Array<ServiceType>;
  selectedServiceType: ServiceType;

  services: Array<Service>;
  selectedService: Service;
  serviceConfigurationSchema: any;
  serviceConfiguration: any;
  serviceTitleSummary: any;
  serviceTitleSummarySchema: any;

  topics: Array<FeedTopic>;
  selectedTopic: FeedTopic;

  fullTopic: string;
  fullService: string;
  preview: any;

  feedConfigurationSchema: any;
  feedConfiguration: any;
  formOptions: any;
  constantParams: any;
  formLayout: any;

  editFeed: any;

  step = -1;
  serviceFormReady = false;

  debouncedPreview: any;

  constructor(
    private feedService: FeedService,
    private stateService: StateService,
  ) {
    this.debouncedPreview = _.debounce(this.previewFeed, 500);

    this.feedConfigurationSchema = {
      title: {
        type: 'string',
        title: 'Feed Title'
      },
      itemsHaveIdentity: {
        type: 'boolean',
        title: 'Items Have Identity'
      },
      itemsHaveSpatialDimension: {
        type: 'boolean',
        title: 'Items Have Spatial Dimension'
      },
      itemTemporalProperty: {
        type: 'string',
        title: 'Item Temporal Property'
      },
      itemPrimaryProperty: {
        type: 'string',
        title: 'Item Primary Property'
      },
      itemSecondaryProperty: {
        type: 'string',
        title: 'Item Secondary Property'
      },
      mapStyle: {
        type: 'object',
        properties: {
          iconUrl: {
            type: 'string',
            title: 'Feed Icon URL'
          }
        }
      }
    };

    this.formOptions = {
      addSubmit: false
    };

    this.formLayout = [
      'title',
      'itemsHaveIdentity',
      'itemsHaveSpatialDimension',
      'itemTemporalProperty',
      'itemPrimaryProperty',
      'itemSecondaryProperty',
      {
        type: 'text',
        key: 'mapStyle.iconUrl',
        title: 'Feed Icon URL'
      }
    ];

    this.editFeed = {};

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
        this.feedService.fetchServiceTypes().subscribe(serviceTypes => {
          this.serviceTypes = serviceTypes;
          if (!this.services || this.services.length === 0) {
            this.setStep(-1);
          }
        });
        if (this.services.length === 1) {
          this.selectedService = this.services[0];
          this.serviceSelected();
        }
      });
    }
  }

  createService(): void {
    console.log('serviceConfiguration', this.serviceConfiguration);
    console.log('serviceTitleSummary', this.serviceTitleSummary);

    console.log('serviceConfigurationSchema', this.serviceConfigurationSchema);
    this.serviceTitleSummary.config = this.serviceConfiguration;
    this.serviceTitleSummary.serviceType = this.selectedServiceType.id;
    this.feedService.createService(this.serviceTitleSummary).subscribe(service => {
      if (this.services) {
        this.services.push(service);
      } else {
        this.services = [service];
      }
      this.setStep(0);
    });
  }

  serviceTypeSelected(): void {
    console.log('config schema', this.selectedServiceType.configSchema);
    this.serviceTitleSummarySchema = {
      title: {
        type: 'string',
        title: 'Service Title',
        default: this.selectedServiceType.title
      },
      summary: {
        type: 'string',
        title: 'Summary',
        default: this.selectedServiceType.summary
      }
    };
    this.serviceConfigurationSchema = { ...this.selectedServiceType.configSchema };
    this.serviceFormReady = true;
  }

  serviceTitleSummaryChanged($event: any): void {
    this.serviceTitleSummary = $event;
  }

  serviceConfigurationChanged($event: any): void {
    this.serviceConfiguration = $event;
  }

  serviceSelected(): void {
    this.feedService.fetchTopics(this.selectedService.id).subscribe(topics => {
      this.topics = topics;
      if (this.topics.length === 1) {
        this.selectedTopic = this.topics[0];
        this.topicSelected();
      }
    });
    this.fullService = JSON.stringify(this.selectedService, null, 2);
  }

  topicSelected(): void {
    // this.editFeed = { ...this.selectedTopic };
    // this.editFeed.topic = this.selectedTopic.id;
    // this.fullTopic = JSON.stringify(this.selectedTopic, null, 2);
  }

  topicConfigured(): void {
    this.previewFeed();
    this.nextStep();
  }

  topicConfigChanged($event: any): void {
    this.constantParams = $event;

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

  feedConfigChanged($event: any): void {
    this.feedConfiguration = $event;
    if (this.preview) {
      this.preview.feed = $event;
    }
  }

  createFeed(): void {
    this.feedConfiguration.service = this.selectedService.id;
    this.feedConfiguration.topic = this.selectedTopic.id;
    this.feedConfiguration.constantParams = this.constantParams;
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

  deleteFeed(): void {

  }

}
