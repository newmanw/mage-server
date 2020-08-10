import { Component, OnInit } from '@angular/core';
import { FeedService } from 'src/app/feed/feed.service';
import { ServiceType, Feed, Service, FeedTopic } from 'src/app/feed/feed.model';
import { FormControl } from '@angular/forms';

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

  feed: Feed;

  constructor(
    private feedService: FeedService,
  ) { }

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
    this.feedService.fetchTopics(this.selectedService.id).subscribe(topics => {
      this.topics = topics;
    });
    this.fullService = JSON.stringify(this.selectedService, null, 2);
  }

  topicSelected(): void {
    this.fullTopic = JSON.stringify(this.selectedTopic, null, 2);
  }

  topicConfigured($event: any): void {
    console.log('topic configuration', $event);
    this.feedService.previewFeed(this.selectedService.id, this.selectedTopic.id, $event)
      .subscribe(content => {
        console.log(content);
      })
  }

}
