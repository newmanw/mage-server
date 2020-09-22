import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FeedTopic } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-feed-configuration',
  templateUrl: './admin-feed-edit-configuration.component.html',
  styleUrls: ['./admin-feed-edit-configuration.component.scss']
})
export class AdminFeedEditConfigurationComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() itemPropertiesSchema: any;
  @Input() topic: FeedTopic;
  @Input() buttonText: string;
  @Output() feedConfigurationSet = new EventEmitter<any>();
  @Output() feedConfigurationChanged = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();
  @ViewChild('template', {static: true}) template;

  formOptions: any;
  formLayout: any;
  itemPropertiesTitleMap: Array<any>;
  feedConfigurationSchema: any;

  feedConfiguration: any;

  feed: any;

  constructor(
    private viewContainerRef: ViewContainerRef
  ) {
    this.formOptions = {
      addSubmit: false
    };
  }

  ngOnChanges(): void {
    if (this.itemPropertiesSchema) {
      this.itemPropertiesTitleMap = [];
      for (const key in this.itemPropertiesSchema) {
        if (this.itemPropertiesSchema.hasOwnProperty(key)) {
          this.itemPropertiesTitleMap.push({
            name: this.itemPropertiesSchema[key].title || this.itemPropertiesSchema[key].key,
            value: key
          });
        }
      }
      this.resetFormLayout();
    }
  }

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);
    this.resetFormLayout();
    this.feedConfigurationSchema = {
      title: {
        type: 'string',
        title: 'Feed Title'
      },
      itemsHaveIdentity: {
        type: 'boolean',
        title: 'Items Have Identity'
      },
      itemsHaveSpatialDimension: {
        type: 'boolean',
        title: 'Items Have Spatial Dimension'
      },
      itemTemporalProperty: {
        type: 'string',
        title: 'Item Temporal Property'
      },
      itemPrimaryProperty: {
        type: 'string',
        title: 'Item Primary Property'
      },
      itemSecondaryProperty: {
        type: 'string',
        title: 'Item Secondary Property'
      },
      mapStyle: {
        type: 'object',
        properties: {
          iconUrl: {
            type: 'string',
            title: 'Feed Icon URL'
          }
        }
      },
    };
  }

  resetFormLayout(): void {
    this.formLayout = [
      'title',
      'itemsHaveIdentity',
      'itemsHaveSpatialDimension',
      // 'itemTemporalProperty',
      // 'itemPrimaryProperty',
      // 'itemSecondaryProperty',
      {
        key: 'itemTemporalProperty',
        type: 'autocomplete',
        titleMap: this.itemPropertiesTitleMap
      },
      {
        key: 'itemPrimaryProperty',
        type: 'autocomplete',
        titleMap: this.itemPropertiesTitleMap
      },
      {
        key: 'itemSecondaryProperty',
        type: 'autocomplete',
        titleMap: this.itemPropertiesTitleMap
      },
      {
        type: 'text',
        key: 'mapStyle.iconUrl',
        title: 'Feed Icon URL'
      }
    ];
  }

  feedConfigChanged($event: any): void {
    this.feedConfiguration = $event;
    this.feedConfigurationChanged.emit(this.feedConfiguration);
  }

  prevStep(): void {
    this.cancelled.emit();
  }

  setConfiguration(): void {
    this.feedConfigurationSet.emit(this.feedConfiguration);
  }

}
