import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Feed } from 'src/app/feed/feed.model';
import { FeedService } from 'src/app/feed/feed.service';

@Component({
  selector: 'app-admin-feed-delete',
  templateUrl: './admin-feed-delete.component.html',
  styleUrls: ['./admin-feed-delete.component.scss']
})
export class AdminFeedDeleteComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public feed: Feed, 
    private feedService: FeedService) { 
  }

  ngOnInit(): void {
    console.log('delete feed', this.feed);
  }

}
