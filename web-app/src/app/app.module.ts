import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef, DoBootstrap } from '@angular/core';

import { UpgradeModule } from '@angular/upgrade/static';
import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { SaturationModule, HueModule, CheckboardModule, AlphaModule } from 'ngx-color';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatDatetimepickerModule } from '@nader-eloshaiker/mat-datetimepicker'
import { MatMomentDatetimeModule } from '@nader-eloshaiker/mat-datetimepicker-moment'

import { ZoomComponent } from './map/controls/zoom.component';
import { AddObservationComponent } from './map/controls/add-observation.component';
import { SwaggerComponent } from './swagger/swagger.component';

import { LocationComponent } from './map/controls/location.component';
import { SearchComponent } from './map/controls/search.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LayersComponent } from './map/layers/layers.component'
import { LayersControlComponent } from './map/controls/layers-control.component';
import { LeafletComponent } from './map/leaflet.component';
import { LeafletDirective } from './map/leaflet.upgrade.component';
import { LayerHeaderComponent } from './map/layers/layer-header.component';
import { LayerContentComponent } from './map/layers/layer-content.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { ExportComponent } from './export/export.component';
import { ExportDialogComponent } from "./export/export-dialog.component";

import { MapClipComponent } from './map/clip/clip.component';
import { GeometryModule } from './geometry/geometry.module';
import { ObservationDeleteComponent } from './observation/observation-delete/observation-delete.component';
import { ObservationListItemComponent } from './observation/observation-list/observation-list-item.component';
import { MomentModule } from './moment/moment.module';
import { BootstrapComponent } from './bootstrap/bootstrap.component';
import { AttachmentComponent } from './observation/attachment/attachment.component';
import { FilenamePipe } from './filename/filename.pipe';
import { AttachUploadComponent } from './observation/attachment/attachment-upload/attachment-upload.component';
import { ObservationViewFormComponent } from './observation/observation-view/observation-view-form.component';
import { ObservationViewComponent } from './observation/observation-view/observation-view.component';
import { ObservationFavoritesComponent } from './observation/observation-favorites/observation-favorites.component';
import { UserAvatarComponent } from './user/user-avatar/user-avatar.component';
import { TokenInterceptorService } from './http/token-interceptor.service';
import { ObservationFormComponent } from './observation/observation-form/observation-form.component';
import { ObservationListComponent } from './observation/observation-list/observation-list.component';
import { UserViewComponent } from './user/user-view/user-view.component';
import { UserListItemComponent } from './user/user-list/user-list-item.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { FeedListComponent } from './feed/feed-list/feed-list.component';
import { FeedPanelComponent } from './feed-panel/feed-panel.component';

import {
  mapServiceProvider,
  eventResourceProvider,
  eventServiceProvider,
  localStorageServiceProvider,
  geometryServiceProvider,
  observationServiceProvider,
  filterServiceProvider,
  userServiceProvider,
} from './upgrade/ajs-upgraded-providers';

import {
  ObservationViewCheckboxComponent,
  ObservationViewDateComponent,
  ObservationViewGeometryComponent,
  ObservationViewMultiselectdropdownComponent,
  ObservationViewTextComponent,
  ObservationViewTextareaComponent
} from './observation/observation-view/observation-view';

import {
  MinValueDirective,
  MaxValueDirective,
  MGRSValidatorDirective,
  ObservationEditCheckboxComponent,
  ObservationEditDateComponent,
  ObservationEditSelectComponent,
  ObservationEditEmailComponent,
  ObservationEditGeometryComponent,
  ObservationEditGeometryFormComponent,
  ObservationEditGeometryMapComponent,
  ObservationEditMultiselectComponent,
  ObservationEditNumberComponent,
  ObservationEditRadioComponent,
  ObservationEditTextComponent,
  ObservationEditTextareaComponent,
  ObservationEditFormComponent,
  ObservationEditComponent
} from './observation/observation-edit/observation-edit';

import { FeedItemComponent } from './feed/feed-item/feed-item.component';
import { FeedItemMapPopupComponent } from './feed/feed-item/feed-item-map/feed-item-map-popup.component';
import { FeedItemSummaryModule } from './feed/feed-item/feed-item-summary/feed-item-summary.module';

import { FeedPanelTabComponent } from './feed-panel/feed-panel-tab.component';
import { AdminFeedsModule } from './admin/admin-feeds/admin-feeds.module';
import { ObservationPopupComponent } from './observation/observation-popup/observation-popup.component';
import { UserPopupComponent } from './user/user-popup/user-popup.component';
import { StaticIconModule } from '@ngageoint/mage.web-core-lib/static-icon'
import { MageCommonModule } from '@ngageoint/mage.web-core-lib/common'
import { AdminModule } from './admin/admin.module'
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';

@NgModule({
  declarations: [
    SwaggerComponent,
    ZoomComponent,
    AddObservationComponent,
    LocationComponent,
    SearchComponent,
    LayersControlComponent,
    LeafletComponent,
    LeafletDirective,
    LayersComponent,
    LayerHeaderComponent,
    LayerContentComponent,
    ColorPickerComponent,
    BootstrapComponent,
    FeedItemComponent,
    MapClipComponent,
    FeedItemMapPopupComponent,
    FeedPanelTabComponent,
    MinValueDirective,
    MaxValueDirective,
    MGRSValidatorDirective,
    ObservationListItemComponent,
    ObservationEditComponent,
    ObservationDeleteComponent,
    ObservationEditFormComponent,
    ObservationEditMultiselectComponent,
    ObservationEditCheckboxComponent,
    ObservationEditSelectComponent,
    ObservationEditEmailComponent,
    ObservationEditNumberComponent,
    ObservationEditTextComponent,
    ObservationEditTextareaComponent,
    ObservationEditRadioComponent,
    ObservationEditGeometryComponent,
    ObservationEditGeometryMapComponent,
    ObservationEditGeometryFormComponent,
    ObservationEditDateComponent,
    ObservationViewComponent,
    ObservationViewTextComponent,
    ObservationViewTextareaComponent,
    ObservationViewCheckboxComponent,
    ObservationViewDateComponent,
    ObservationViewGeometryComponent,
    ObservationViewMultiselectdropdownComponent,
    ObservationViewFormComponent,
    ObservationFavoritesComponent,
    ObservationFormComponent,
    ObservationListComponent,
    MapClipComponent,
    BootstrapComponent,
    AttachmentComponent,
    FilenamePipe,
    AttachUploadComponent,
    UserAvatarComponent,
    UserViewComponent,
    UserListItemComponent,
    UserListComponent,
    FeedListComponent,
    FeedPanelComponent,
    ObservationPopupComponent,
    UserPopupComponent,
    ColorPickerComponent,
    ExportComponent,
    ExportDialogComponent,
    DatetimePickerComponent,
    FeedPanelComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    UpgradeModule,
    UIRouterUpgradeModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatBadgeModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatMomentDatetimeModule,
    MatDatetimepickerModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
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
    MatChipsModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MageCommonModule,
    MomentModule,
    GeometryModule,
    ScrollingModule,
    SaturationModule,
    HueModule,
    AlphaModule,
    CheckboardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatDatepickerModule,
    NgxMatSelectSearchModule,
    AdminModule,
    AdminFeedsModule,
    FeedItemSummaryModule,
    StaticIconModule,
  ],
  providers: [
    mapServiceProvider,
    userServiceProvider,
    filterServiceProvider,
    eventResourceProvider,
    eventServiceProvider,
    geometryServiceProvider,
    observationServiceProvider,
    localStorageServiceProvider,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true }
  ]
})
export class AppModule implements DoBootstrap {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public ngDoBootstrap(appRef: ApplicationRef): void {
  }
}
