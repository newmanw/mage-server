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
  constantParams: any;

  feed: Feed;

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
      feedIconUrl: {
        type: 'string',
        title: 'Feed Icon URL'
      },
      feedItemIconUrl: {
        type: 'string',
        title: 'Feed Item Icon URL'
      }
    };

    this.feed = {
      title: 'title',
      id: 'temp',
      service: null,
      topic: null
    }

  }

  ngOnInit(): void {
    this.feedService.fetchServices().subscribe(services => {
      this.services = services;
    });

    this.feedService.fetchServiceTypes().subscribe(serviceTypes => {
      console.log('serviceTypes', serviceTypes);
      this.serviceTypes = serviceTypes;
    });
  }

  serviceSelected(): void {
    console.log('service selected', this.selectedService);
    this.feed.service = this.selectedService.id;
    this.feedService.fetchTopics(this.selectedService.id).subscribe(topics => {
      this.topics = topics;
    });
    this.fullService = JSON.stringify(this.selectedService, null, 2);
  }

  topicSelected(): void {
    this.feed.topic = this.selectedTopic.id;
    this.fullTopic = JSON.stringify(this.selectedTopic, null, 2);
    // this.feedConfigurationSchema.constantParams = this.selectedTopic.paramsSchema;
  }

  topicConfigured($event: any): void {
    console.log('topic configuration', $event);
    this.constantParams = $event;
    this.feedService.previewFeed(this.selectedService.id, this.selectedTopic.id, $event.topicParams)
      .subscribe(content => {
        // console.log(content);
        // console.log('items', JSON.stringify(content.content.items, null, 2));
        this.previewItems = content.content.items.features;
      });
  }

  feedConfigured($event: any): void {
    $event.constantParams = this.constantParams;
    this.feedService.createFeed(this.selectedService.id, this.selectedTopic.id, $event).subscribe(feed => {
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
