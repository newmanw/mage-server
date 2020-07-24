import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonSchemaWidgetsModule } from '../../json-schema-widgets/json-schema-widgets.module';
import { FeedConfigurationComponent } from './feed-configuration/feed-configuration.component';
import { FeedsComponent } from './feeds/feeds.component';

@NgModule({
  declarations: [
    FeedConfigurationComponent,
    FeedsComponent
  ],
  imports: [
    CommonModule,
    JsonSchemaWidgetsModule
  ],
  entryComponents: [
    FeedsComponent
  ],
  exports: [
    FeedsComponent
  ]
})
export class FeedModule { }
