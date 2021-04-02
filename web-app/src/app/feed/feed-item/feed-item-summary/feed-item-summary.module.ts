import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedItemSummaryComponent } from './feed-item-summary.component';
import { MatIconModule, MatListModule } from '@angular/material';
import { MomentModule } from 'src/app/moment/moment.module';
import { MageCommonModule } from 'src/app/common/mage-common.module'

@NgModule({
  declarations: [FeedItemSummaryComponent],
  exports: [FeedItemSummaryComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MomentModule,
    MageCommonModule
  ]
})
export class FeedItemSummaryModule { }
