import { Component, Input, Inject, OnChanges, SimpleChanges } from '@angular/core';
import { Feed, StyledFeature } from '../feed.model';
import { MapService } from '../../upgrade/ajs-upgraded-providers';
import { FeedPanelService } from 'src/app/feed-panel/feed-panel.service';

@Component({
  selector: 'feed-item',
  templateUrl: './feed-item.component.html',
  styleUrls: ['./feed-item.component.scss']
})
export class FeedItemComponent implements OnChanges {
  @Input() feed: Feed;
  @Input() item: StyledFeature;

  hasContent = false;
  timestamp: number;
  primary: string;
  secondary: string;
  iconUrl: string;
  mapFeature: StyledFeature;
  properties = []

  constructor(private feedPanelService: FeedPanelService, @Inject(MapService) private mapService: any) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.updateItem();
  }

  private updateItem(): void {
    if (!this.feed || !this.item) return;

    this.mapFeature = { ...this.item };
    this.mapFeature.style.iconUrl = '/assets/images/default_marker.png';

    if (!this.item.properties) return;

    if (this.feed.mapStyle) {
      this.iconUrl = this.feed.mapStyle.iconUrl;
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
    this.feedPanelService.deselectFeedItem(this.feed, this.item);
  }

  onLocationClick(): void {
    this.mapService.zoomToFeatureInLayer(this.item, `feed-${this.feed.id}`);
  }

}
