import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Feed, FeedContent, StyledFeature } from './feed.model';
import { Feature } from 'geojson';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  constructor(private http: HttpClient) { }

  private _allFeeds = new BehaviorSubject<Array<Feed>>([]);
  readonly allFeeds = this._allFeeds.asObservable();

  private _feeds = new BehaviorSubject<Array<Feed>>([]);
  readonly feeds = this._feeds.asObservable();

  private _feedItems = new Map<string, BehaviorSubject<Array<Feature>>>();
  feedItems(feedId: string): Observable<Array<Feature>> {
    return this._feedItems.get(feedId).asObservable();
  }

  fetchAllFeeds(): Observable<Array<Feed>> {
    const subject = new Subject<Array<Feed>>();
    this.http.get<Array<Feed>>(`/api/feeds`).subscribe(feeds => {
      feeds.map(feed => {
        feed.id = feed.id.toString();
        return feed;
      });
      subject.next(feeds);
      this._allFeeds.next(feeds);
    });

    return subject;
  }

  fetchFeed(feedId: number): Observable<Feed> {
    return this.http.get<Feed>(`/api/feeds/${feedId}`);
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
          feedItems = new BehaviorSubject<Array<Feature>>([]);
          this._feedItems.set(feed.id, feedItems);
        }
      })

      subject.next(feeds);
      this._feeds.next(feeds);
    });

    return subject;
  }

  fetchFeedItems(event: any, feed: Feed): Observable<FeedContent> {
    const subject = new Subject<FeedContent>();

    const feedItems = this._feedItems.get(feed.id);
    this.http.post<FeedContent>(`/api/events/${event.id}/feeds/${feed.id}/content`, {}).subscribe(content => {
      const style = feed.style || {
        iconUrl: '/assets/images/default_marker.png'
      }

      const features = content.items.features;
      features.map((feature: StyledFeature) => {
        feature.id = feature.id.toString();
        feature.properties = feature.properties || {};
        feature.style = style;

        return feature;
      });

      subject.next(content);
      feedItems.next(features);
    });

    return subject;
  }

}
