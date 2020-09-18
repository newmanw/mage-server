import { Component, Input, OnInit } from '@angular/core';
import { FeedTab } from './feed.model';

@Component({
  selector: 'feed-tab',
  templateUrl: './feed-tab.component.html',
  styleUrls: ['./feed-tab.component.scss']
})
export class FeedTabComponent implements OnInit {
  @Input() tab: FeedTab;
  @Input() active: boolean;

  imageStyle: object;

  ngOnInit(): void {
    if (!this.tab) {
      return;
    }
    if (this.tab.iconUrl) {
      this.imageStyle = { 
        'mask-image': `url(${this.tab.iconUrl})`, 
        '-webkit-mask-image': `url(${this.tab.iconUrl})`
      }
    } else if (!this.tab.icon) {
      this.tab.icon = 'rss_feed';
    }
  }
}
