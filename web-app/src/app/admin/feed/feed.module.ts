import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonSchemaWidgetsModule } from '../../json-schema-widgets/json-schema-widgets.module';
import { JsonSchemaComponent } from './json-schema/json-schema.component';
import { FeedsComponent } from './feeds/feeds.component';
import { AdminFeedComponent } from './admin-feed/admin-feed.component';
import { UpgradeModule } from '@angular/upgrade/static';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { WidgetLibraryService } from '@ajsf/core';

import {
  MatIconModule,
  MatButtonModule,
  MatChipsModule,
  MatToolbarModule,
  MatProgressSpinnerModule,
  MatFormFieldModule,
  MatInputModule,
  MatAutocompleteModule,
  MatSelectModule,
  MatTooltipModule,
  MatCardModule,
  MatListModule,
  MatRippleModule,
  MatSidenavModule,
  MatRadioModule,
  MatCheckboxModule,
  MatSliderModule,
  MatExpansionModule,
  MatDialogModule
} from '@angular/material';

import { FeedEditComponent } from './feed-edit/feed-edit.component';
import { FeedItemSummaryModule } from 'src/app/feed/feed-item/feed-item-summary/feed-item-summary.module';
import { MomentModule } from 'src/app/moment/moment.module';
import { AdminFeedDeleteComponent } from './admin-feed/admin-feed-delete.component';
import { AutocompleteMaterialSelectComponent } from './autocomplete-material-select/autocomplete-material-select.component';
import { CreateServiceComponent } from './feed-edit/create-service/create-service.component';
import { FeedItemPropertiesConfigurationComponent } from './feed-edit/feed-item-properties-configuration/feed-item-properties-configuration.component';
import { TopicConfigurationComponent } from './feed-edit/topic-configuration/topic-configuration.component';
import { FeedConfigurationComponent } from './feed-edit/feed-configuration/feed-configuration.component';

@NgModule({
  declarations: [
    JsonSchemaComponent,
    FeedsComponent,
    AdminFeedComponent,
    AdminFeedDeleteComponent,
    FeedEditComponent,
    AutocompleteMaterialSelectComponent,
    CreateServiceComponent,
    FeedItemPropertiesConfigurationComponent,
    TopicConfigurationComponent,
    FeedConfigurationComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    JsonSchemaWidgetsModule,
    UpgradeModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatRadioModule,
    MatCheckboxModule,
    MatInputModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatSliderModule,
    MatExpansionModule,
    MatListModule,
    MatRippleModule,
    NgxMatSelectSearchModule,
    MatChipsModule,
    MatSidenavModule,
    MomentModule,
    FeedItemSummaryModule
  ],
  entryComponents: [
    FeedsComponent,
    AdminFeedComponent,
    AdminFeedDeleteComponent,
    FeedEditComponent,
    AutocompleteMaterialSelectComponent
  ],
  exports: [
    FeedsComponent,
    AdminFeedComponent,
    FeedEditComponent,
    CreateServiceComponent
  ]
})
export class FeedModule {
}
