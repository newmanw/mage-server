import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JsonSchemaWidgetsModule } from '../../json-schema-widgets/json-schema-widgets.module';
import { FeedConfigurationComponent } from './feed-configuration/feed-configuration.component';
import { FeedsComponent } from './feeds/feeds.component';
import { AdminFeedComponent } from './admin-feed/admin-feed.component';
import { UpgradeModule } from '@angular/upgrade/static';
import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';


@NgModule({
  declarations: [
    FeedConfigurationComponent,
    FeedsComponent,
    AdminFeedComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    JsonSchemaWidgetsModule,
    UpgradeModule,
    UIRouterUpgradeModule.forChild({ states: [{
      name: 'feed',
        url: '/feeds/:feedId',
        component: AdminFeedComponent
        // ,
        // parent: 'public'
        // ,
        // resolve: resolveAdmin()
      }
    ] })
  ],
  entryComponents: [
    FeedsComponent
  ],
  exports: [
    FeedsComponent
  ]
})
export class FeedModule { }
