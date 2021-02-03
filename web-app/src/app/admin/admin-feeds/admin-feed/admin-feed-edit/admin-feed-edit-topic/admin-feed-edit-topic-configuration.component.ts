import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Feed, FeedTopic } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-topic-configuration',
  templateUrl: './admin-feed-edit-topic-configuration.component.html',
  styleUrls: ['./admin-feed-edit-topic-configuration.component.scss']
})
export class AdminFeedEditTopicConfigurationComponent implements OnChanges, OnInit {

  @Input() expanded: boolean
  @Input() fetchParametersSchema: any
  @Input() initialFetchParameters: any;
  @Input() showPrevious: boolean;
  @Output() fetchParametersChanged = new EventEmitter<any>();
  @Output() fetchParametersAccepted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();

  fetchParametersMod: any = {}

  formOptions = {
    addSubmit: false
  }

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.initialFetchParameters && changes.initialFetchParameters.currentValue !== changes.initialFetchParameters.previousValue) {
      console.log('fetch parameters changed ', Date.now(), changes.initialFetchParameters.currentValue === this.initialFetchParameters, changes.initialFetchParameters.currentValue)
    }
  }

  onFetchParametersChanged($event: any): void {
    console.log('changes ', $event === this.initialFetchParameters, $event)
    this.fetchParametersMod = $event;
    this.fetchParametersChanged.emit($event);
  }

  finish(): void {
    this.fetchParametersAccepted.emit(this.fetchParametersMod);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
