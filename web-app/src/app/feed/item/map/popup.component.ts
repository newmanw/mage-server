import { Component, OnInit, Input } from '@angular/core';
import { Feed } from '../../feed.model';
import { FeedItem } from '../item.model';
import { FeedItemService } from '../item.service';

@Component({
  selector: 'item-map-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class FeedItemMapPopupComponent implements OnInit {
  @Input() feed: Feed;
  @Input() item: FeedItem;

  hasContent = false;
  iconUrl: string;
  timestamp: number;
  primary: string;
  secondary: string;

  constructor(private feedItemService: FeedItemService) { }

  ngOnInit(): void {
    if (this.feed.style) this.iconUrl = this.feed.style.iconUrl;

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

  onInfo(): void {
    this.feedItemService.select(this.feed, this.item);
  }

}
