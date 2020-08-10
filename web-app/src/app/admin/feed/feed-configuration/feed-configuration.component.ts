import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-feed-configuration',
  templateUrl: './feed-configuration.component.html',
  styleUrls: ['./feed-configuration.component.scss']
})
export class FeedConfigurationComponent implements OnInit {
  @Input() schema: any;
  @Output() configurationComplete = new EventEmitter<any>();

  realSchema: any;
  fullRealSchema: string;
  // myJsonSchema: any;

  constructor() {
    // this.myJsonSchema = {
    //   schema: {
    //     bounds: {
    //       type: 'string',
    //       title: 'Bounding Box',
    //       description: 'Bounding box for the query'
    //     }
    //   },
    //   layout: [
    //     {
    //       key: 'bounds',
    //       type: 'map-select-widget'
    //     }
    //   ]
    // };
  }

  ngOnInit(): void {
    console.log('this.schema', this.schema);
    this.realSchema = {
      schema: this.schema
    }
    this.fullRealSchema = JSON.stringify(this.realSchema, null, 2);
  }

  onSubmit($event: any): void {
    this.configurationComplete.emit($event);
  }
}
