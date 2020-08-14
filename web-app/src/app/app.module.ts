import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';

import { UpgradeModule } from '@angular/upgrade/static';
import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { JsonSchemaWidgetsModule } from './json-schema-widgets/json-schema-widgets.module';

import { SaturationModule, HueModule, CheckboardModule, AlphaModule } from 'ngx-color';
import {
  MatIcon,
  MatButton,
  MatToolbar,
  MatSpinner,
  MatFormField,
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
  MatSidenav,
  MatSidenavContent,
  MatSidenavContainer,
  MatRadioModule,
  MatCheckboxModule,
  MatSliderModule,
  MatExpansionModule
} from '@angular/material';

import { TokenInterceptorService } from './http/token-interceptor.service'

import { ZoomComponent } from './map/controls/zoom.component';
import { AddObservationComponent } from './map/controls/add-observation.component';
import { SwaggerComponent } from './swagger/swagger.component';
import { ScrollWrapperComponent } from './wrapper/scroll/feed-scroll.component';
import { DropdownComponent } from './observation/edit/dropdown/dropdown.component';
import { MultiSelectDropdownComponent } from './observation/edit/multiselectdropdown/multiselectdropdown.component';

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

import { mapServiceProvider, localStorageServiceProvider, userServiceProvider, eventResourceProvider } from './upgrade/ajs-upgraded-providers';
import { BootstrapComponent } from './bootstrap/bootstrap.component';
import { FeedComponent } from './feed/feed.component';
import { FeedItemComponent } from './feed/feed-item/feed-item.component';
import { FeedItemService } from './feed/feed-item/feed-item.service';
import { FeedItemPopupService } from './feed/feed-item/feed-item-map/feed-item-map-popup.service';
import { FeedItemMapPopupComponent } from './feed/feed-item/feed-item-map/feed-item-map-popup.component';
import { FeedModule } from './admin/feed/feed.module';
import { FeedItemSummaryModule } from './feed/feed-item/feed-item-summary/feed-item-summary.module';

import { MapClipComponent } from './map/clip/clip.component';

import { FeedTabComponent } from './feed/feed-tab.component';
import { MomentModule } from './moment/moment.module';
import { GeometryModule } from './geometry/geometry.module';

@NgModule({
  declarations: [
    SwaggerComponent,
    DropdownComponent,
    MultiSelectDropdownComponent,
    ScrollWrapperComponent,
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
    FeedComponent,
    FeedItemComponent,
    MapClipComponent,
    FeedItemMapPopupComponent,
    FeedTabComponent
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
    MatSidenavModule,
    ScrollingModule,
    SaturationModule,
    HueModule,
    AlphaModule,
    CheckboardModule,
    JsonSchemaWidgetsModule,
    MomentModule,
    GeometryModule,
    FeedModule,
    FeedItemSummaryModule
  ],
  providers: [
    FeedItemService,
    FeedItemPopupService,
    mapServiceProvider,
    localStorageServiceProvider,
    userServiceProvider,
    eventResourceProvider,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true }
  ],
  bootstrap: [],
  entryComponents: [
    BootstrapComponent,
    MatIcon,
    MatButton,
    MatToolbar,
    MatSpinner,
    MatFormField,
    MatSidenav,
    MatSidenavContent,
    MatSidenavContainer,
    DropdownComponent,
    MultiSelectDropdownComponent,
    LeafletComponent,
    ZoomComponent,
    SearchComponent,
    LocationComponent,
    AddObservationComponent,
    LayersControlComponent,
    ScrollWrapperComponent,
    SwaggerComponent,
    ColorPickerComponent,
    FeedComponent,
    FeedTabComponent,
    FeedItemComponent,
    FeedItemMapPopupComponent
  ]
})
export class AppModule {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public ngDoBootstrap(appRef: ApplicationRef): void {
  }
}
