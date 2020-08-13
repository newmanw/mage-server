import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedItemSummaryComponent } from './feed-item-summary.component';
import { MatIconModule, MatListModule } from '@angular/material';
import { MageModule } from 'src/app/mage/mage.module';

@NgModule({
  declarations: [FeedItemSummaryComponent],
  exports: [FeedItemSummaryComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MageModule
  ]
})
export class FeedItemSummaryModule { }
