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
import { MomentModule } from 'src/app/moment/moment.module';
import { AdminBreadcrumbModule } from '../admin-breadcrumb/admin-breadcrumb.module';
import { AdminFeedsComponent } from './admin-feeds.component';
import { AdminFeedComponent } from './admin-feed/admin-feed.component';
import { AdminFeedDeleteComponent } from './admin-feed/admin-feed-delete/admin-feed-delete.component';
import { AdminFeedEditComponent } from './admin-feed/admin-feed-edit/admin-feed-edit.component';
import { JsonSchemaWidgetAutocompleteComponent } from 'src/app/json-schema/json-schema-widget/json-schema-widget-autocomplete.component';
import { AdminServiceEditComponent } from './admin-service/admin-service-edit/admin-service-edit.component';
import { AdminFeedEditItemPropertiesComponent } from './admin-feed/admin-feed-edit/admin-feed-edit-item-properties/admin-feed-edit-item-properties.component';
import { AdminFeedEditTopicComponent } from './admin-feed/admin-feed-edit/admin-feed-edit-topic/admin-feed-edit-topic.component';
import { AdminFeedEditConfigurationComponent } from './admin-feed/admin-feed-edit/admin-feed-edit-configuration.component';
import { AdminServiceComponent } from './admin-service/admin-service.component';
import { AdminServiceDeleteComponent } from './admin-service/admin-service-delete/admin-service-delete.component';
import { AdminFeedEditTopicConfigurationComponent } from './admin-feed/admin-feed-edit/admin-feed-edit-topic/admin-feed-edit-topic-configuration.component';
import { JsonSchemaModule } from 'src/app/json-schema/json-schema.module';
import { FeedItemSummaryModule } from 'src/app/feed/feed-item/feed-item-summary/feed-item-summary.module';

@NgModule({
  declarations: [
    AdminFeedsComponent,
    AdminFeedComponent,
    AdminFeedDeleteComponent,
    AdminFeedEditComponent,
    JsonSchemaWidgetAutocompleteComponent,
    AdminServiceEditComponent,
    AdminFeedEditItemPropertiesComponent,
    AdminFeedEditTopicComponent,
    AdminFeedEditConfigurationComponent,
    AdminFeedEditTopicConfigurationComponent,
    AdminFeedEditTopicComponent,
    AdminServiceComponent,
    AdminServiceDeleteComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    UpgradeModule,
    AdminBreadcrumbModule,
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
    FeedItemSummaryModule,
    JsonSchemaModule
  ],
  entryComponents: [
    AdminFeedsComponent,
    AdminFeedComponent,
    AdminFeedDeleteComponent,
    AdminServiceDeleteComponent,
    AdminFeedEditComponent,
    AdminServiceComponent,
    JsonSchemaWidgetAutocompleteComponent
  ],
  exports: [
    AdminFeedsComponent,
    AdminFeedComponent,
    AdminFeedEditComponent,
    AdminServiceEditComponent
  ]
})
export class AdminFeedsModule {
}
