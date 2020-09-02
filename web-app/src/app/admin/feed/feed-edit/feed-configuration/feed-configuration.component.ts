import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ViewContainerRef, OnChanges } from '@angular/core';
import { FeedTopic } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-feed-configuration',
  templateUrl: './feed-configuration.component.html',
  styleUrls: ['./feed-configuration.component.scss']
})
export class FeedConfigurationComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() itemProperties: Array<any>;
  @Input() topic: FeedTopic;
  @Output() feedConfigurationSet = new EventEmitter<any>();
  @Output() feedConfigurationChanged = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();
  @ViewChild('template', {static: true}) template;

  formOptions: any;
  formLayout: any;
  itemPropertiesSchema: Array<any>;
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
    if (this.itemProperties) {
      this.itemPropertiesSchema = this.itemProperties.map(this.itemPropertiesSchemaToTitleMap);

      this.formLayout = [
        'title',
        'itemsHaveIdentity',
        'itemsHaveSpatialDimension',
        {
          key: 'itemTemporalProperty',
          type: 'autocomplete',
          titleMap: this.itemPropertiesSchema
        },
        {
          key: 'itemPrimaryProperty',
          type: 'autocomplete',
          titleMap: this.itemPropertiesSchema
        },
        {
          key: 'itemSecondaryProperty',
          type: 'autocomplete',
          titleMap: this.itemPropertiesSchema
        },
        {
          type: 'text',
          key: 'mapStyle.iconUrl',
          title: 'Feed Icon URL'
        }
      ];
    }
  }

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);

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

  itemPropertiesSchemaToTitleMap(value: any): any {
    if (!value.schema) {
      return;
    }
    return {
      name: value.schema.title,
      value: value.key
    };
  }

  feedConfigChanged($event: any): void {
    this.feedConfiguration = $event;
    console.log('feed config changed');
    this.feedConfigurationChanged.emit(this.feedConfiguration);
  }

  prevStep(): void {
    this.cancelled.emit();
  }

  createFeed(): void {
    this.feedConfigurationSet.emit(this.feedConfiguration);
  }

  updateFeed(): void {
    this.feedConfigurationSet.emit(this.feedConfiguration);
  }

}
