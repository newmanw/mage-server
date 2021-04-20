import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { FeedItemSummaryComponent } from './feed-item-summary.component'
import { MomentModule } from '../../../moment/moment.module'
import { MageCommonModule } from '@ngageoint/mage.web-core-lib/common'

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
