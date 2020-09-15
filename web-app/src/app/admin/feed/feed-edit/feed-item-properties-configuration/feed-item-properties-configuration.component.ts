import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { FeedTopic } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-feed-item-properties-configuration',
  templateUrl: './feed-item-properties-configuration.component.html',
  styleUrls: ['./feed-item-properties-configuration.component.scss']
})
export class FeedItemPropertiesConfigurationComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() disabled: boolean;
  @Input() itemPropertiesSchema: JSON;
  @Input() topic: FeedTopic;
  @Output() itemPropertiesUpdated = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();
  @ViewChild('template', {static: true}) template;

  newProperty: any;
  itemPropertySchemaLayout: any;
  itemPropertySchema: any;
  initialProperties: Array<any> = [];
  topicItemPropertiesSchema: Array<any>;
  formOptions: any;
  feed: any;
  valid: boolean;

  itemProperties: Array<any> = [];

  constructor(
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);

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
      for (const key in this.itemPropertiesSchema) {
        if (this.itemPropertiesSchema.hasOwnProperty(key)) {
          this.initialProperties.push({
            key,
            schema: this.itemPropertiesSchema[key]
          });
        }
      }
    }
    const topicChange: SimpleChange = changes.topic;
    if (!this.topicItemPropertiesSchema && topicChange.currentValue) {
      this.topicItemPropertiesSchema = [];
      for (const key in topicChange.currentValue.itemPropertiesSchema.properties) {
        if (topicChange.currentValue.itemPropertiesSchema.properties.hasOwnProperty(key)) {
          this.topicItemPropertiesSchema.push({
            key,
            schema: topicChange.currentValue.itemPropertiesSchema.properties[key]
          });
          if (this.itemPropertiesSchema && !this.itemPropertiesSchema.hasOwnProperty(key)
          || !this.itemPropertiesSchema) {
            this.initialProperties.push({
              key,
              schema: topicChange.currentValue.itemPropertiesSchema.properties[key]
            });
          }
        }
      }
    }

    if (this.initialProperties) {
      this.itemProperties = this.itemProperties.map(value => {
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
    console.log('valid', valid);
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
