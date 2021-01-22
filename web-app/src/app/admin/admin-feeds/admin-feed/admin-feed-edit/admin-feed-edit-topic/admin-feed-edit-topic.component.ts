import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FeedTopic, Service } from 'src/app/feed/feed.model';
import { FeedService } from 'src/app/feed/feed.service';

@Component({
  selector: 'app-choose-service-topic',
  templateUrl: './admin-feed-edit-topic.component.html',
  styleUrls: ['./admin-feed-edit-topic.component.scss']
})
export class AdminFeedEditTopicComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() defaultService: Service;
  @Output() serviceAndTopicSelected = new EventEmitter<{service: Service, topic: FeedTopic}>();
  @Output() noServicesExist = new EventEmitter();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();

  services: Array<Service>;
  selectedService: Service;

  topics: Array<FeedTopic>;
  selectedTopic: FeedTopic;

  serviceSearchControl: FormControl = new FormControl();
  topicSearchControl: FormControl = new FormControl();

  constructor(private feedService: FeedService) {
    this.services = [];
  }

  ngOnInit(): void {
    this.feedService.fetchServices().subscribe(services => {
      this.services = services;
      if (this.services.length === 0) {
        this.noServicesExist.emit();
        return;
      }
      if (this.defaultService) {
        this.selectedService = this.defaultService;
        this.serviceSelected();
        return;
      }
      if (this.services.length === 1) {
        this.selectedService = this.services[0];
        this.serviceSelected();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.defaultService && changes.defaultService.currentValue !== undefined) {
      this.selectedService = this.defaultService;
      this.serviceSelected();
    }
  }

  serviceSelected(): void {
    if (this.selectedService) {
      this.feedService.fetchTopics(this.selectedService.id).subscribe(topics => {
        this.topics = topics;
        if (this.topics.length === 1) {
          this.selectedTopic = this.topics[0];
        }
      });
    }
  }

  next(): void {
    this.serviceAndTopicSelected.emit({service: this.selectedService, topic: this.selectedTopic});
  }
}
