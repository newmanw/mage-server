import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { Feed, FeedTopic } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-topic-configuration',
  templateUrl: './admin-feed-edit-topic-configuration.component.html',
  styleUrls: ['./admin-feed-edit-topic-configuration.component.scss']
})
export class AdminFeedEditTopicConfigurationComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() topic: FeedTopic;
  @Input() feed: Feed;
  @Input() params: any;
  @Input() showPrevious: boolean;
  @Output() topicConfigurationChanged = new EventEmitter<any>();
  @Output() topicConfigured = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();

  currentConfiguration: any;
  formOptions: any;

  constructor() {
    this.formOptions = {
      addSubmit: false
    };
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
  }

  topicConfigChanged($event: any): void {
    this.currentConfiguration = $event;
    this.topicConfigurationChanged.emit($event);
  }

  finish(): void {
    this.topicConfigured.emit(this.currentConfiguration);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
