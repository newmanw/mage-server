import { Component, OnInit, Input } from '@angular/core';
import { FeedItem } from './feed-item.model';
import { Feed } from './feed.model';
import { FeedItemService } from './item/item.service';

@Component({
  selector: 'feed-list-item',
  templateUrl: './feed-list-item.component.html',
  styleUrls: ['./feed-list-item.component.scss']
})
export class FeedListItemComponent implements OnInit {
  @Input() feed: Feed;
  @Input() item: FeedItem;

  hasContent = false;
  timestamp: number;
  primary: string;
  secondary: string;

  constructor(private feedItemService: FeedItemService) {}

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
  }

  onItemSelect(): void {
    this.feedItemService.select(this.feed, this.item);
  }
}
