import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonSchemaWidgetsModule } from '../../json-schema-widgets/json-schema-widgets.module';
import { FeedConfigurationComponent } from './feed-configuration/feed-configuration.component';
import { FeedsComponent } from './feeds/feeds.component';
import { AdminFeedComponent } from './admin-feed/admin-feed.component';
import { UpgradeModule } from '@angular/upgrade/static';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';


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
  MatExpansionModule
} from '@angular/material';
import { FeedEditComponent } from './feed-edit/feed-edit.component';
import { FeedListItemComponent } from 'src/app/feed/item/list-item.component';


@NgModule({
  declarations: [
    FeedConfigurationComponent,
    FeedsComponent,
    AdminFeedComponent,
    FeedEditComponent,
    // FeedListItemComponent,
  ],
  imports: [
    // FeedListItemComponent,
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
    MatSidenavModule
  ],
  entryComponents: [
    FeedsComponent,
    AdminFeedComponent,
    FeedEditComponent
  ],
  exports: [
    FeedsComponent,
    AdminFeedComponent,
    FeedEditComponent
  ]
})
export class FeedModule { }
