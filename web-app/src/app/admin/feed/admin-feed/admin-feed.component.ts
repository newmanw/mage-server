import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { StateService } from '@uirouter/angular';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Feed, FeedTopic, Service, ServiceType } from 'src/app/feed/feed.model';
import { FeedService } from 'src/app/feed/feed.service';
import _ from 'underscore';
import { Event, UserService } from '../../../upgrade/ajs-upgraded-providers';
import { AdminFeedDeleteComponent } from './admin-feed-delete.component';

@Component({
  selector: 'app-admin-feed',
  templateUrl: './admin-feed.component.html',
  styleUrls: ['./admin-feed.component.scss']
})
export class AdminFeedComponent implements OnInit {
  feedLoaded: Promise<boolean>;
  feed: Feed;
  fullFeed: string;
  hasFeedCreatePermission: boolean;
  hasFeedEditPermission: boolean;
  hasFeedDeletePermission: boolean;
  hasUpdateEventPermission: boolean;

  eventsPerPage = 10;
  eventsPage = 0;
  editEvent = false;

  searchControl: FormControl = new FormControl();
  eventModel: any;
  filteredChoices: Observable<any[]>;
  events = [];
  nonFeedEvents: Array<Event> = [];
  feedEvents = [];

  service: Service;
  feedServiceType: ServiceType;
  feedTopic: FeedTopic;

  constructor(
    private feedService: FeedService,
    private stateService: StateService,
    public dialog: MatDialog,
    @Inject(UserService) private userService: { myself: { id: string, role: {permissions: Array<string>}}},
    @Inject(Event) private eventResource: any
    ) {
      this.hasFeedCreatePermission = _.contains(userService.myself.role.permissions, 'CREATE_LAYER');
      this.hasFeedEditPermission = _.contains(userService.myself.role.permissions, 'UPDATE_LAYER');
      this.hasFeedDeletePermission = _.contains(userService.myself.role.permissions, 'DELETE_LAYER');
      this.hasUpdateEventPermission = _.contains(userService.myself.role.permissions, 'UPDATE_EVENT');
    }

  ngOnInit(): void {
    if (this.stateService.params.feedId) {
      this.feedService.fetchFeed(this.stateService.params.feedId).subscribe(feed => {
        this.feed = feed;
        this.fullFeed = JSON.stringify(feed, null, 2);
        this.feedLoaded = Promise.resolve(true);
        this.service = this.feed.service;
        this.feedTopic = this.feed.topic;
        this.feedService.fetchServiceType(this.service.serviceType).subscribe(serviceType => {
          this.feedServiceType = serviceType;
        });
      });
    }

    this.eventResource.query(events => {
      this.events = events.sort((a: {name: string}, b: {name: string}) => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });

      this.feedEvents = _.filter(events, event => {
        return _.some(event.feedIds, feedId => {
          return this.feed.id === feedId;
        });
      });

      let chain = _.chain(events);
      if (!this.hasUpdateEventPermission) {
        // filter teams based on acl
        chain = chain.filter(event => {
          const permissions = event.acl[this.userService.myself.id]
            ? event.acl[this.userService.myself.id].permissions
            : [];
          return _.contains(permissions, 'update');
        });
      }

      chain = chain.reject(event => {
        return _.some(event.feedIds, feedId => {
          return this.feed.id === feedId;
        });
      });

      this.nonFeedEvents = chain.value();

      this.filteredChoices = this.searchControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          return !value || typeof value === 'string' ? value : value.title
        }),
        map(title => {
          return title ? this.filter(title) : this.events.slice()
        })
      );
    });
  }

  private filter(title: string): Event[] {
    const filterValue = title.toLowerCase();

    return this.events.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  addFeedToEvent(): void {
    this.eventResource.addFeed({ id: this.eventModel.id }, `"${this.feed.id}"`, event => {
      this.feedEvents.push(event);
      this.nonFeedEvents = _.reject(this.nonFeedEvents, e => {
        return e.id === event.id;
      });

      this.eventModel = null;
    });
  }

  removeEventFromFeed(event: any): void {
    this.eventResource.removeFeed({ id: event.id, feedId: this.feed.id }, removed => {
      console.log('removed event', removed);
      this.feedEvents = _.reject(this.feedEvents, e => {
        return e.id === event.id;
      });
      this.nonFeedEvents.push(event);
    });
  }

  editFeed(): void {
    this.stateService.go('admin.feedEdit', { feedId: this.feed.id });
  }

  deleteFeed(): void {

    this.dialog.open(AdminFeedDeleteComponent, {
      data: this.feed,
      autoFocus: false,
      disableClose: true
    }).afterClosed().subscribe(result => {
      if (result === true) {
        this.feedService.deleteFeed(this.feed).subscribe(() => {
          this.goToFeeds();
        })
      }
    });
  }

  goToFeeds(): void {
    this.stateService.go('admin.feeds');
  }

  goToEvent(event: any): void {
    this.stateService.go('admin.event', { eventId: event.id });
  }

}
