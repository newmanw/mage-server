import { Component, OnInit, OnChanges, Input, Output, ViewChild, ViewContainerRef, EventEmitter } from '@angular/core';
import { FeedTopic } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-topic-configuration',
  templateUrl: './topic-configuration.component.html',
  styleUrls: ['./topic-configuration.component.scss']
})
export class TopicConfigurationComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() disabled: boolean;
  @Input() topic: FeedTopic;
  @Output() topicConfigurationChanged = new EventEmitter<any>();
  @Output() topicConfigured = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();
  @ViewChild('template', {static: true}) template;

  topicConfiguration: any;

  newProperty: any;
  itemPropertySchemaLayout: any;
  itemPropertySchema: any;
  formOptions: any;
  feed: any;

  finalProperties: any[];

  constructor(
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);

    this.formOptions = {
      addSubmit: false
    };
  }

  ngOnChanges(): void {

  }

  topicConfigChanged($event: any): void {
    this.topicConfiguration = $event;
    this.topicConfigurationChanged.emit($event);
    // if (this.feed) {
    //   console.log('ask to preview');
    //   this.debouncedPreview();
    // }
  }

  finish(): void {
    this.topicConfigured.emit(this.topicConfiguration);
  }

  cancel(): void {
    this.cancelled.emit();
  }

  closed(): void {
    console.log('closed happens even if the finish button is pressed');
  }

}
