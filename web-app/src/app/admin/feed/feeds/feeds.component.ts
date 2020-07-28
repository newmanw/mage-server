import _ from 'underscore';
import { Component, OnInit, SimpleChanges, Inject } from '@angular/core';
import { UserService } from '../../../upgrade/ajs-upgraded-providers';
import { FeedService } from '../../../feed/feed.service';
import { Feed } from 'src/app/feed/feed.model';

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss']
})
export class FeedsComponent implements OnInit {

  allFeeds: Array<Feed> = [];
  feeds: Array<Feed> = [];
  feedSearch = '';
  page = 0;
  itemsPerPage = 10;

  hasFeedCreatePermission: boolean;
  hasFeedEditPermission: boolean;
  hasFeedDeletePermission: boolean;

  constructor(
    private feedService: FeedService,
    @Inject(UserService) private userService: { myself: { role: {permissions: Array<string>}}}
  ) {
    this.hasFeedCreatePermission = _.contains(userService.myself.role.permissions, 'CREATE_LAYER');
    this.hasFeedEditPermission = _.contains(userService.myself.role.permissions, 'UPDATE_LAYER');
    this.hasFeedDeletePermission = _.contains(userService.myself.role.permissions, 'DELETE_LAYER');
  }

  ngOnInit() {
    this.feedService.fetchAllFeeds().subscribe(feeds => {
      this.allFeeds = feeds;
      this.updateFilteredFeeds();
    });
  }

  searchChanged(): void {
    this.page = 0;
    this.updateFilteredFeeds();
  }

  reset(): void {
    this.page = 0;
    this.feedSearch = '';
    this.updateFilteredFeeds();
  }

  updateFilteredFeeds(): void {
    this.feeds = this.allFeeds.filter((feed) => {
      return feed.title.toLowerCase().indexOf(this.feedSearch.toLowerCase()) !== -1
      || feed.summary.toLowerCase().indexOf(this.feedSearch.toLowerCase()) !== -1;
    }).sort((a: Feed, b: Feed) => {
      if (a.title < b.title) { return -1; }
      if (a.title > b.title) { return 1; }
      return 0;
    });
  }

  goToFeed(feed: Feed): void {
    console.log('feed', feed);
  }

}
