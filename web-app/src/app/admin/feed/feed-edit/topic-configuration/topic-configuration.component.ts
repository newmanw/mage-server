import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
  EventEmitter,
  KeyValueDiffers,
  KeyValueDiffer, 
  Query} from '@angular/core';
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
  paramDiffer: KeyValueDiffer<string, any>;

  constructor(
    private differs: KeyValueDiffers,
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);

    this.formOptions = {
      addSubmit: false
    };

    this.paramDiffer = this.differs.find(this.params).create();

  }

  ngOnChanges(): void {
  }

  topicConfigChanged($event: any): void {
    if (this.paramDiffer.diff($event)) {
      console.log('changed', new Date());
      this.currentConfiguration = $event;
      this.topicConfigurationChanged.emit($event);
    }
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
