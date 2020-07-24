import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FeedItem } from './item.model';
import { Feed } from '../feed.model';

export enum FeedAction {
  Select,
  Deselect
}

export interface FeedItemEvent {
  feed: Feed;
  item: FeedItem;
  action: FeedAction;
}

@Injectable({
  providedIn: 'root'
})
export class FeedItemService {
  private itemSource = new Subject<FeedItemEvent>();

  item$ = this.itemSource.asObservable();

  select(feed: Feed, item: FeedItem): void {
    this.itemSource.next({
      feed: feed,
      item: item,
      action: FeedAction.Select
    });
  }

  deselect(feed: Feed, item: FeedItem): void {
    this.itemSource.next({
      feed: feed,
      item: item,
      action: FeedAction.Deselect
    });
  }
}
