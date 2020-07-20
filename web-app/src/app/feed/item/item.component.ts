import { Component, OnInit, Input } from '@angular/core';
import { FeedItem } from '../feed-item.model';
import { Feed } from '../feed.model';

@Component({
  selector: 'feed-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class FeedItemComponent implements OnInit {
  @Input() feed: Feed;
  @Input() item: FeedItem;

  hasContent = false;
  timestamp: number;
  primary: string;
  secondary: string;
  properties = []

  ngOnInit(): void {
    if (!this.item.properties) return;

    if (this.feed.itemTemporalProperty && this.item.properties[this.feed.itemTemporalProperty] != null) {
      this.timestamp = this.item.properties[this.feed.itemTemporalProperty];
      this.hasContent = true;
    }

    if (this.feed.itemPrimaryProperty && this.item.properties[this.feed.itemPrimaryProperty] != null) {
      this.primary = this.item.properties[this.feed.itemPrimaryProperty];
      this.hasContent = true;
    }

    if (this.feed.itemSecondaryProperty && this.item.properties[this.feed.itemSecondaryProperty] != null) {
      this.secondary = this.item.properties[this.feed.itemSecondaryProperty];
      this.hasContent = true;
    }

    if (this.item.properties) {
      this.properties = Object.keys(this.item.properties).map(key => {
        return {
          key: key,
          value: this.item.properties[key]
        }
      });
    }
  }

}
