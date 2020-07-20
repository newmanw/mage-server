import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Feed } from './feed.model';
import { FeedItem } from './feed-item.model';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  constructor(private http: HttpClient) { }

  private _feeds = new BehaviorSubject<Array<Feed>>([]);
  readonly feeds = this._feeds.asObservable();

  private _feedItems = new Map<string, BehaviorSubject<Array<FeedItem>>>();
  feedItems(feedId: string): Observable<Array<FeedItem>> {
    return this._feedItems.get(feedId).asObservable();
  }

  fetchFeeds(eventId: number): Observable<Array<Feed>> {
    const subject = new Subject<Array<Feed>>();
    this.http.get<Array<Feed>>(`/api/events/${eventId}/feeds`).subscribe(feeds => {
      feeds.map(feed => {
        feed.id = feed.id.toString();
        return feed;
      });

      feeds.forEach(feed => {
        let feedItems = this._feedItems.get(feed.id);
        if (!feedItems) {
          feedItems = new BehaviorSubject<Array<FeedItem>>([]);
          this._feedItems.set(feed.id, feedItems);
        }
      })

      subject.next(feeds);
      this._feeds.next(feeds);
    });

    return subject;
  }

  fetchFeedItems(eventId: number, feedId: string): Observable<Array<FeedItem>> {
    const subject = new Subject<Array<FeedItem>>();

    const feedItems = this._feedItems.get(feedId);
    this.http.get<Array<FeedItem>>(`/api/events/${eventId}/feeds/${feedId}/items`).subscribe(items => {
      subject.next(items);
      feedItems.next(items);
    });

    return subject;    
  }

}
