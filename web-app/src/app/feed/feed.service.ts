import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, throwError } from 'rxjs';
import { Feed, FeedContent, StyledFeature, Service, ServiceType, FeedTopic } from './feed.model';
import { Feature } from 'geojson';
import { catchError } from 'rxjs/operators';

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

  fetchFeed(feedId: string): Observable<Feed> {
    return this.http.get<Feed>(`/api/feeds/${feedId}`);
  }

  fetchService(serviceId: string): Observable<Service> {
    return this.http.get<Service>(`/api/feeds/services/${serviceId}`);
  }

  createService(service: { title: string, summary?: string, serviceType: string, config: any}): Observable<Service> {
    return this.http.post<Service>(`/api/feeds/services`, service);
  }

  fetchServices(): Observable<Array<Service>> {
    return this.http.get<Array<Service>>(`/api/feeds/services`);
  }

  fetchServiceType(serviceTypeId: string): Observable<ServiceType> {
    return this.http.get<ServiceType>(`/api/feeds/service_types/${serviceTypeId}`);
  }

  fetchTopics(serviceId: string): Observable<Array<FeedTopic>> {
    return this.http.get<Array<FeedTopic>>(`api/feeds/services/${serviceId}/topics`);
  }

  previewFeed(serviceId: string, topicId: string, topicConfiguration: any): Observable<{content: FeedContent}> {
    return this.http.post<{content: FeedContent}>(
      `/api/feeds/services/${serviceId}/topics/${topicId}/feed_preview`,
      topicConfiguration);
  }

  fetchTopic(serviceId: string, topicId: string): Observable<FeedTopic> {
    return this.http.get<FeedTopic>(`/api/feeds/services/${serviceId}/topics/${topicId}`);
  }

  fetchServiceTypes(): Observable<Array<ServiceType>> {
    return this.http.get<Array<ServiceType>>(`/api/feeds/service_types`);
  }

  createFeed(serviceId: string, topicId: string, feedConfiguration: any): Observable<Feed> {
    return this.http.post<Feed>(`/api/feeds/services/${serviceId}/topics/${topicId}/feeds`, feedConfiguration);
  }

  updateFeed(feed: Feed): Observable<Feed> {
    return this.http.put<Feed>(`/api/feeds/${feed.id}`, feed);
  }

  deleteFeed(feed: Feed): Observable<{}> {
    return this.http.delete(`/api/feeds/${feed.id}`, {responseType: 'text'});
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
      const style = feed.mapStyle || {
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
