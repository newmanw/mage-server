import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FeedService } from './feed.service';
import { Feed } from './feed.model';
import { Feature } from 'geojson';

@Component({
  selector: 'feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnChanges {
  @Input() feed: Feed;

  items: Array<Feature> = [];

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
