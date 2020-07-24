import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feed-configuration',
  templateUrl: './feed-configuration.component.html',
  styleUrls: ['./feed-configuration.component.scss']
})
export class FeedConfigurationComponent implements OnInit {
  myJsonSchema: any;

  constructor() {
    this.myJsonSchema = {
      schema: {
        bounds: {
          type: 'string',
          title: 'Bounding Box',
          description: 'Bounding box for the query'
        }
      },
      layout: [
        {
          key: 'bounds',
          type: 'map-select-widget'
        }
      ]
    };
  }

  ngOnInit() {}
}
