import { Component, OnInit, OnChanges, EventEmitter, ViewContainerRef, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-feed-item-properties-configuration',
  templateUrl: './feed-item-properties-configuration.component.html',
  styleUrls: ['./feed-item-properties-configuration.component.scss']
})
export class FeedItemPropertiesConfigurationComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() disabled: boolean;
  @Input() itemProperties: Array<any>;
  @Output() itemPropertiesUpdated = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();
  @ViewChild('template', {static: true}) template;

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
          title: 'Property Key'
        }, {
          type: 'text',
          key: 'schema.title',
          title: 'Property Title'
        },
        {
          key: 'schema.type',
          title: 'Type',
          type: 'select'
        }]
      }, {
        type: 'div',
        display: 'flex',
        'flex-direction': 'row',
        fxLayoutGap: '8px',
        items: [
          'schema.format',
       {
          type: 'text',
          key: 'schema.pattern',
          title: 'Pattern'
        }]
      }]
    }];


  }

  ngOnChanges(): void {
    if (this.itemProperties) {
      this.finalProperties = this.itemProperties.map(value => {
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

  addProperty(): void {
    console.log('add the property', this.newProperty);
    this.itemProperties.push(this.newProperty);
    this.propertiesChanged(this.newProperty, this.itemProperties.length - 1);
    this.newProperty = {};
  }

  prevStep(): void {
    this.cancelled.emit();
  }

  nextStep(): void {
    this.itemPropertiesUpdated.emit(this.finalProperties);
  }

  propertiesChanged($event: any, $index: any): void {
    this.finalProperties[$index] = $event;
  }

}
