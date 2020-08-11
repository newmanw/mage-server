import { Component, OnInit } from '@angular/core';
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

  searchControl: FormControl = new FormControl();
  serviceSearchControl: FormControl = new FormControl();
  topicSearchControl: FormControl = new FormControl();


  serviceTypes: Array<ServiceType>;
  selectedServiceType: ServiceType;

  services: Array<Service>;
  selectedService: Service;

  topics: Array<FeedTopic>;
  selectedTopic: FeedTopic;

  fullTopic: string;
  fullService: string;
  previewItems: Array<any>;

  feedConfigurationSchema: any;
  formOptions: any;
  constantParams: any;

  feed: Feed;
  editFeed: any;

  step = 0;

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
      style: {
        type: 'object',
        title: 'Style',
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

    this.editFeed = {};

    this.constantParams = {};
  }

  ngOnInit(): void {
    this.feedService.fetchServices().subscribe(services => {
      this.services = services;
      if (this.services.length === 1) {
        this.selectedService = this.services[0];
        this.serviceSelected();
      }
    });

    this.feedService.fetchServiceTypes().subscribe(serviceTypes => {
      this.serviceTypes = serviceTypes;
    });
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

}
