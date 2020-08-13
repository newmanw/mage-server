import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedItemSummaryComponent } from './feed-item-summary.component';
import { MatIconModule, MatListModule } from '@angular/material';

@NgModule({
  declarations: [FeedItemSummaryComponent],
  exports: [FeedItemSummaryComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule
  ]
})
export class FeedItemSummaryModule { }
