import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';

import { UpgradeModule } from '@angular/upgrade/static';
import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UIRouter } from '@uirouter/core';

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

// import app from '../ng1/app.js';
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
import { FeedListItemComponent } from './feed/item/list-item.component';
import { FeedModule } from './admin/feed/feed.module';
import { MomentPipe } from './moment/moment.pipe';
import { FeedItemComponent } from './feed/item/item.component';
import { FeedItemService } from './feed/item/item.service';
import { MapClipComponent } from './map/clip/clip.component';
import { GeometryPipe } from './geometry/geometry.pipe';
import { FeedItemMapPopupComponent } from './feed/item/map/popup.component';
import { FeedItemPopupService } from './feed/item/map/popup.service';
import { FeedTabComponent } from './feed/tab.component';

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
    FeedListItemComponent,
    MomentPipe,
    FeedItemComponent,
    MapClipComponent,
    GeometryPipe,
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
    FeedModule
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
    FeedItemMapPopupComponent,
    FeedListItemComponent
  ],
  exports: [
    FeedListItemComponent
  ]
})
export class AppModule {

  constructor(private router: UIRouter) {

  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public ngDoBootstrap(appRef: ApplicationRef): void {
    // this.upgrade.bootstrap(document.body, ["app"], { strictDi: true });
  }
}

// platformBrowserDynamic().bootstrapModule(AppModule).then(platformRef => {
//   const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
//   upgrade.bootstrap(document.body, ['myApp'], { strictDi: true });
//   });

// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .then(platformRef => {
//     // const url: UrlService = getUIRouter(injector).urlService;
//     // const upgrade = platformRef.injector.get(UpgradeModule) as UpgradeModule;
//     // upgrade.bootstrap(document.body, ['myApp'], { strictDi: true });

//     // Intialize the Angular Module
//     // get() the UIRouter instance from DI to initialize the router
//     const urlService: UrlService = getUIRouter(platformRef.injector).urlService;
//     // Instruct UIRouter to listen to URL changes
//     const startUIRouter = (): void => {
//       urlService.listen();
//       urlService.sync();
//     };

//     platformRef.injector.get<NgZone>(NgZone).run(startUIRouter);

//   });
