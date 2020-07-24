import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FeedService } from './feed.service';
import { FeedItem } from './item/item.model';
import { Feed } from './feed.model';

@Component({
  selector: 'feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnChanges {
  @Input() feed: Feed;

  items: Array<FeedItem> = [];

  constructor(private feedService: FeedService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const feed: Feed = changes.feed.currentValue;
    if (feed) {
      this.feedService.feedItems(feed.id).subscribe(items => {
        this.items = items;
      });
    }
  }

}
