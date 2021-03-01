import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FeedTopic, Service } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-choose-service-topic',
  templateUrl: './admin-feed-edit-topic.component.html',
  styleUrls: ['./admin-feed-edit-topic.component.scss']
})
export class AdminFeedEditTopicComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() services: Service[];
  @Input() topics: FeedTopic[];
  @Input() selectedService: Service;
  @Output() serviceSelected = new EventEmitter<Service>();
  @Output() topicSelected = new EventEmitter<FeedTopic>();
  @Output() noServicesExist = new EventEmitter();
  @Output() opened = new EventEmitter();

  selectedTopic: FeedTopic;

  serviceSearchControl: FormControl = new FormControl();
  topicSearchControl: FormControl = new FormControl();

  constructor() {
    this.services = [];
    this.topics = [];
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  onServiceSelected(): void {
    this.serviceSelected.emit(this.selectedService || null)
  }

  onTopicSelected(): void {
    this.topicSelected.emit(this.selectedTopic || null)
  }
}
