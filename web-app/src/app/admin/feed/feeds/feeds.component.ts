import _ from 'underscore';
import { Component, OnInit, Inject } from '@angular/core';
import { UserService } from '../../../upgrade/ajs-upgraded-providers';
import { FeedService } from '../../../feed/feed.service';
import { Feed } from 'src/app/feed/feed.model';
import { StateService } from '@uirouter/angular';
import { MatDialog } from '@angular/material';
import { AdminFeedDeleteComponent } from '../admin-feed/admin-feed-delete.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss'],
  animations: [trigger('deleteAnimation', [
    transition(':leave',
      [style({ opacity: 1 }), animate('250ms', style({ opacity: 0 }))]
    )
  ])]
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
    private stateService: StateService,
    public dialog: MatDialog,
    @Inject(UserService) private userService: { myself: { role: {permissions: Array<string>}}}
  ) {
    this.hasFeedCreatePermission = _.contains(userService.myself.role.permissions, 'CREATE_LAYER');
    this.hasFeedEditPermission = _.contains(userService.myself.role.permissions, 'UPDATE_LAYER');
    this.hasFeedDeletePermission = _.contains(userService.myself.role.permissions, 'DELETE_LAYER');
  }

  ngOnInit(): void {
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
    this.stateService.go('admin.feed', { feedId: feed.id });
  }

  newFeed(): void {
    this.stateService.go('admin.feedCreate');
  }

  editFeed(feed: Feed): void {
    
  }

  deleteFeed($event: MouseEvent, feed: Feed): void {
    $event.stopPropagation();

    this.dialog.open(AdminFeedDeleteComponent, {
      data: feed,
      autoFocus: false,
      disableClose: true
    }).afterClosed().subscribe(result => {
      if (result === true) {
        this.feedService.deleteFeed(feed).subscribe(() => {
          this.feeds = _.without(this.feeds, feed);
        });
      }
    });
  }

}
