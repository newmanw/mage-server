import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeedItemSummaryComponent } from './feed-item-summary.component'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MomentModule } from 'src/app/moment/moment.module'
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
