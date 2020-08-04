import { Component, OnInit, Input, Inject } from '@angular/core';
import { Feed } from '../feed.model';
import { FeedItemService } from './item.service';
import { MapService } from '../../upgrade/ajs-upgraded-providers';
import { Feature } from 'geojson';

@Component({
  selector: 'feed-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class FeedItemComponent implements OnInit {
  @Input() feed: Feed;
  @Input() item: Feature;

  hasContent = false;
  timestamp: number;
  primary: string;
  secondary: string;
  iconUrl: string;
  properties = []

  constructor(private feedItemService: FeedItemService, @Inject(MapService) private mapService: any) {}

  ngOnInit(): void {
    if (!this.item.properties) return;

    if (this.feed.style) {
      this.iconUrl = this.feed.style.iconUrl;
    }

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

  close(): void {
    this.feedItemService.deselect(this.feed, this.item);
  }

  onLocationClick(): void {
    this.mapService.zoomToFeatureInLayer(this.item, `feed-${this.feed.id}`);
  }

}
