import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Feed, FeedTopic } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-topic-configuration',
  templateUrl: './topic-configuration.component.html',
  styleUrls: ['./topic-configuration.component.scss']
})
export class TopicConfigurationComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() topic: FeedTopic;
  @Input() feed: Feed;
  @Input() params: any;
  @Input() showPrevious: boolean;
  @Output() topicConfigurationChanged = new EventEmitter<any>();
  @Output() topicConfigured = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();
  @ViewChild('template', {static: true}) template: any;

  currentConfiguration: any;
  formOptions: any;

  constructor(
    private viewContainerRef: ViewContainerRef
  ) {
    this.formOptions = {
      addSubmit: false
    };
  }

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);
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
