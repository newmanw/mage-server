import _ from 'underscore';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Feed } from 'src/app/feed/feed.model';
import { StateService } from '@uirouter/angular';
import { UserService, Event } from '../../../upgrade/ajs-upgraded-providers';
import { FeedService } from 'src/app/feed/feed.service';

@Component({
  selector: 'app-admin-feed',
  templateUrl: './admin-feed.component.html',
  styleUrls: ['./admin-feed.component.scss']
})
export class AdminFeedComponent implements OnInit {
  feedLoaded: Promise<boolean>;
  feed: Feed = {} as Feed;
  fullFeed: string;
  hasFeedCreatePermission: boolean;
  hasFeedEditPermission: boolean;
  hasFeedDeletePermission: boolean;
  hasUpdateEventPermission: boolean;

  searchControl: FormControl = new FormControl();
  eventModel: any;
  filteredChoices: Observable<any[]>;
  events = [];
  nonFeedEvents: Array<Event> = [];
  feedEvents = [];

  constructor(
    private feedService: FeedService,
    private stateService: StateService,
    @Inject(UserService) private userService: { myself: { id: string, role: {permissions: Array<string>}}},
    @Inject(Event) private eventResource: any
    ) {
      this.hasFeedCreatePermission = _.contains(userService.myself.role.permissions, 'CREATE_LAYER');
      this.hasFeedEditPermission = _.contains(userService.myself.role.permissions, 'UPDATE_LAYER');
      this.hasFeedDeletePermission = _.contains(userService.myself.role.permissions, 'DELETE_LAYER');
      this.hasUpdateEventPermission = _.contains(userService.myself.role.permissions, 'UPDATE_EVENT');
    }

  ngOnInit(): void {
    console.log('on init')
    this.feedService.fetchFeed(this.stateService.params.feedId).subscribe(feed => {
      this.feed = feed;
      console.log('feed', feed);
      this.fullFeed = JSON.stringify(feed, null, 2);
      this.feedLoaded = Promise.resolve(true);
    });

    this.eventResource.query(events => {
      console.log('events', events);
      this.events = events.sort((a: {name: string}, b: {name: string}) => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });

      this.feedEvents = _.filter(events, event => {
        return _.some(event.feeds, feed => {
          return this.feed.id === feed.id;
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
        return _.some(event.feeds, feed => {
          return this.feed.id === feed.id;
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

  addEventToFeed(): void {
    console.log('add event', this.eventModel);
    this.eventResource.addFeed({ id: this.eventModel.id }, this.feed, event => {
      this.feedEvents.push(event);
      this.nonFeedEvents = _.reject(this.nonFeedEvents, e => {
        return e.id === event.id;
      });

      this.eventModel = null;
    });
  }

  removeEventFromFeed() {
    // this.eventResource.removeFeed({ id: event.id, feedId: this.feed.id }, event => {
      
    // })
  }

  editFeed(): void {
    
  }

  goToFeeds(): void {
    this.stateService.go('admin.feeds');
  }

}
