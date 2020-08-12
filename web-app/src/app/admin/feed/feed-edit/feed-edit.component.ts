import { Component, OnInit, Input } from '@angular/core';
import { FeedService } from 'src/app/feed/feed.service';
import { ServiceType, Feed, Service, FeedTopic } from 'src/app/feed/feed.model';
import { FormControl } from '@angular/forms';
import { StateService } from '@uirouter/angular';

@Component({
  selector: 'app-feed-edit',
  templateUrl: './feed-edit.component.html',
  styleUrls: ['./feed-edit.component.scss']
})
export class FeedEditComponent implements OnInit {
  @Input() feed: Feed;

  hasFeedDeletePermission: boolean;

  searchControl: FormControl = new FormControl();
  serviceSearchControl: FormControl = new FormControl();
  topicSearchControl: FormControl = new FormControl();

  serviceTypes: Array<ServiceType>;
  selectedServiceType: ServiceType;

  services: Array<Service>;
  selectedService: Service;
  serviceConfiguration: any = {};
  selectedServiceTypeConfigSchema: any;

  topics: Array<FeedTopic>;
  selectedTopic: FeedTopic;

  fullTopic: string;
  fullService: string;
  previewItems: Array<any>;

  feedConfigurationSchema: any;
  formOptions: any;
  constantParams: any;
  formLayout: any;

  editFeed: any;

  step = -1;

  constructor(
    private feedService: FeedService,
    private stateService: StateService,
  ) {
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
        key: 'style.iconUrl',
        title: 'Feed Icon URL'
      }
    ];

    this.editFeed = {};

    this.constantParams = {};
  }

  ngOnInit(): void {
    this.feedService.fetchServices().subscribe(services => {
      this.services = services;
      if (!this.services || this.services.length === 0) {
        this.feedService.fetchServiceTypes().subscribe(serviceTypes => {
          this.serviceTypes = serviceTypes;
          this.step = -1;
        });
      } else {
        this.step = 0;
      }
      if (this.services.length === 1) {
        this.selectedService = this.services[0];
        this.serviceSelected();
      }
    });
  }

  createService(): void {

  }

  serviceTypeSelected(): void {
    this.selectedServiceTypeConfigSchema = { ...this.selectedServiceType.configSchema };
    this.selectedServiceTypeConfigSchema.title = {
      type: 'string',
      title: 'Service Name'
    };

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
    this.editFeed.service = this.selectedService.id;
    this.editFeed.topic = this.selectedTopic.id;
    this.editFeed = { ...this.selectedTopic };
    this.editFeed.topic = this.selectedTopic.id;
    this.fullTopic = JSON.stringify(this.selectedTopic, null, 2);
  }

  topicConfigured(): void {
    this.feedService.previewFeed(this.selectedService.id, this.selectedTopic.id, this.constantParams)
      .subscribe(content => {
        this.previewItems = content.content.items.features;
      });
    this.nextStep();
  }

  submitFeed(): void {
    this.editFeed.constantParams = this.constantParams;
    this.feedService.createFeed(this.selectedService.id, this.selectedTopic.id, this.editFeed).subscribe(feed => {
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
    
  }

  deleteFeed(): void {
    
  }

}
