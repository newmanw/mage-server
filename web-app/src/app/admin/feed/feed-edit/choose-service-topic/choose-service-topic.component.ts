import { Component, OnInit, OnChanges, Input, Output, ViewChild, EventEmitter, ViewContainerRef } from '@angular/core';
import { Service, FeedTopic } from 'src/app/feed/feed.model';
import { FeedService } from 'src/app/feed/feed.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-choose-service-topic',
  templateUrl: './choose-service-topic.component.html',
  styleUrls: ['./choose-service-topic.component.scss']
})
export class ChooseServiceTopicComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Output() serviceAndTopicSelected = new EventEmitter<{service: Service, topic: FeedTopic}>();
  @Output() noServicesExist = new EventEmitter();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();
  @ViewChild('template', {static: true}) template;

  services: Array<Service>;
  selectedService: Service;

  topics: Array<FeedTopic>;
  selectedTopic: FeedTopic;

  serviceSearchControl: FormControl = new FormControl();
  topicSearchControl: FormControl = new FormControl();

  constructor(
    private feedService: FeedService,
    private viewContainerRef: ViewContainerRef
  ) {

  }

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);
    this.feedService.fetchServices().subscribe(services => {
      this.services = services;
      if (!this.services || this.services.length === 0) {
        this.noServicesExist.emit();
      }
      if (this.services.length === 1) {
        this.selectedService = this.services[0];
        this.serviceSelected();
      }
    });
  }

  ngOnChanges(): void {

  }

  serviceSelected(): void {
    this.feedService.fetchTopics(this.selectedService.id).subscribe(topics => {
      this.topics = topics;
      if (this.topics.length === 1) {
        this.selectedTopic = this.topics[0];
      }
    });
  }

  next(): void {
    this.serviceAndTopicSelected.emit({service: this.selectedService, topic: this.selectedTopic});
  }
}
