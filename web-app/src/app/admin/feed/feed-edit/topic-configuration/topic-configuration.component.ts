import {
  Component,






  EventEmitter, Input, OnChanges, OnInit,


  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
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
  @Input() params: any;
  @Input() showPrevious: boolean;
  @Output() topicConfigurationChanged = new EventEmitter<any>();
  @Output() topicConfigured = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();
  @ViewChild('template', {static: true}) template: any;

  currentConfiguration: any;

  newProperty: any;
  itemPropertySchemaLayout: any;
  itemPropertySchema: any;
  formOptions: any;
  feed: any;

  finalProperties: any[];

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

  closed(): void {
    console.log('closed happens even if the finish button is pressed');
  }

}
