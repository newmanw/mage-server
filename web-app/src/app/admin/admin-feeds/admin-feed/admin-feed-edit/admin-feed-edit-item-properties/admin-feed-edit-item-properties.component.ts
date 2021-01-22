import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FeedTopic } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-feed-item-properties-configuration',
  templateUrl: './admin-feed-edit-item-properties.component.html',
  styleUrls: ['./admin-feed-edit-item-properties.component.scss']
})
export class AdminFeedEditItemPropertiesComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() itemPropertiesSchema: any;
  @Input() topic: FeedTopic;
  @Output() itemPropertiesUpdated = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();

  newProperty: any;
  itemPropertySchemaLayout: any;
  itemPropertySchema: any;
  initialProperties: Array<any> = [];
  topicItemPropertiesSchema: Array<any>;
  formOptions: any;
  feed: any;
  valid: boolean;

  itemProperties: Array<any> = [];

  ngOnInit(): void {
    this.newProperty = {};
    this.formOptions = {
      addSubmit: false
    };

    this.itemPropertySchema = {
      type: 'object',
      properties: {
        key: {
          type: 'string',
        },
        schema: {
          type: 'object',
          properties: {
            title: {
              type: 'string'
            },
            type: {
              type: 'string',
              enum: ['string', 'number', 'integer']
            },
            format: {
              type: 'string',
              enum: [
                'date',
                'time',
                'date-time',
                'email',
                'hostname',
                'ipv4',
                'ipv6',
                'uri',
                'uri-reference',
                'uri-template',
                'regex'
              ]
            },
            pattern: {
              type: 'string'
            }
          },
          required: ['title', 'type']
        }
      },
      required: ['key']
    };

    this.itemPropertySchemaLayout = [{
      type: 'div',
      display: 'flex',
      'flex-direction': 'column',
      items: [{
        type: 'div',
        display: 'flex',
        'flex-direction': 'row',
        fxLayoutGap: '8px',
        items: [{
          type: 'text',
          key: 'key',
          title: 'Property Key',
          description: 'GeoJSON property key'
        }, {
          type: 'text',
          key: 'schema.title',
          title: 'Property Title',
          description: 'Display title'
        },
        {
          key: 'schema.type',
          title: 'Type',
          type: 'select',
          description: 'GeoJSON data type'
        }]
      }, {
        type: 'div',
        display: 'flex',
        'flex-direction': 'row',
        fxLayoutGap: '8px',
        items: [{
          key: 'schema.format',
          type: 'select',
          title: 'Format',
          description: 'Semantic validation format'
        }, {
          type: 'text',
          key: 'schema.pattern',
          title: 'Pattern',
          description: 'Regular expression to restrict strings'
        }]
      }]
    }];
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change: SimpleChange = changes.itemPropertiesSchema;
    if (change && !change.previousValue && change.currentValue) {
      this.initialProperties = [];
      for (const key in this.itemPropertiesSchema.properties) {
        if (this.itemPropertiesSchema.properties.hasOwnProperty(key)) {
          this.initialProperties.push({
            key,
            schema: this.itemPropertiesSchema.properties[key]
          });
        }
      }
    }
    const topicChange: SimpleChange = changes.topic;
    if (topicChange && (!this.initialProperties || !this.initialProperties.length) && topicChange.currentValue) {
      this.initialProperties = [];
      for (const key in topicChange.currentValue.itemPropertiesSchema.properties) {
        if (topicChange.currentValue.itemPropertiesSchema.properties.hasOwnProperty(key)) {
          this.initialProperties.push({
            key,
            schema: topicChange.currentValue.itemPropertiesSchema.properties[key]
          });
        }
      }
    }

    if (this.initialProperties) {
      this.itemProperties = this.initialProperties.map(value => {
        return {
          key: value.key,
          schema: value.schema
        };
      });
    }
  }

  closed(): void {
    console.log('panel closed')
  }

  isValid(valid: boolean): void {
    // console.log('valid', valid);
    this.valid = valid;
  }

  addProperty(): void {
    this.initialProperties.push(this.newProperty);
    this.propertiesChanged(this.newProperty, this.initialProperties.length - 1);
    this.newProperty = {};
  }

  prevStep(): void {
    this.cancelled.emit();
  }

  nextStep(): void {
    const schema = {};
    this.itemProperties.forEach(value => {
      schema[value.key] = value.schema;
    });
    this.itemPropertiesUpdated.emit(schema);
  }

  propertiesChanged($event: any, $index: any): void {
    this.itemProperties[$index] = $event;
  }

}
