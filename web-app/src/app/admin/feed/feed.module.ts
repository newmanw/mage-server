import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSnackBarModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import { UpgradeModule } from '@angular/upgrade/static';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FeedItemSummaryModule } from 'src/app/feed/feed-item/feed-item-summary/feed-item-summary.module';
import { MomentModule } from 'src/app/moment/moment.module';
import { JsonSchemaWidgetsModule } from '../../json-schema-widgets/json-schema-widgets.module';
import { AdminServiceComponent } from '../admin-service/admin-service.component';
import { AdminFeedDeleteComponent } from './admin-feed/admin-feed-delete.component';
import { AdminFeedComponent } from './admin-feed/admin-feed.component';
import { AdminServiceDeleteComponent } from './admin-feed/admin-service-delete.component';
import { AutocompleteMaterialSelectComponent } from './autocomplete-material-select/autocomplete-material-select.component';
import { ChooseServiceTopicComponent } from './feed-edit/choose-service-topic/choose-service-topic.component';
import { CreateServiceComponent } from './feed-edit/create-service/create-service.component';
import { FeedConfigurationComponent } from './feed-edit/feed-configuration/feed-configuration.component';
import { FeedEditComponent } from './feed-edit/feed-edit.component';
import { FeedItemPropertiesConfigurationComponent } from './feed-edit/feed-item-properties-configuration/feed-item-properties-configuration.component';
import { TopicConfigurationComponent } from './feed-edit/topic-configuration/topic-configuration.component';
import { FeedsComponent } from './feeds/feeds.component';
import { JsonSchemaComponent } from './json-schema/json-schema.component';

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
    FeedConfigurationComponent,
    ChooseServiceTopicComponent,
    AdminServiceComponent,
    AdminServiceDeleteComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    JsonSchemaWidgetsModule,
    UpgradeModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatSnackBarModule,
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
    MatPaginatorModule,
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
    AdminServiceDeleteComponent,
    FeedEditComponent,
    AdminServiceComponent,
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
