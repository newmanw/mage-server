import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { UpgradeModule } from '@angular/upgrade/static';
import { UIRouterUpgradeModule } from '@uirouter/angular-hybrid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';

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

import { ZoomComponent } from './map/controls/zoom.component';
import { AddObservationComponent } from './map/controls/add-observation.component';
import { SwaggerComponent } from './swagger/swagger.component';
import { ScrollWrapperComponent } from './wrapper/scroll/feed-scroll.component';
import { MultiSelectDropdownComponent } from './observation/edit/multiselectdropdown/multiselectdropdown.component';

// import app from '../ng1/app.js';
import { LocationComponent } from './map/controls/location.component';
import { SearchComponent } from './map/controls/search.component';
import { HttpClientModule } from '@angular/common/http';
import { LayersComponent } from './map/layers/layers.component'
import { LayersControlComponent } from './map/controls/layers-control.component';
import { LeafletComponent } from './map/leaflet.component';
import { LeafletDirective } from './map/leaflet.upgrade.component';
import { LayerHeaderComponent } from './map/layers/layer-header.component';
import { LayerContentComponent } from './map/layers/layer-content.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';

import { mapServiceProvider } from './upgrade/ajs-upgraded-providers';
import { ObservationEditCheckboxComponent } from './observation/edit/checkbox/checkbox.component';
import { ObservationEditEmailComponent } from './observation/edit/email/email.component';
import { ObservationEditNumberComponent } from './observation/edit/number/number.component';
import { MinValueDirective } from './observation/edit/number/min-value.directive';
import { MaxValueDirective } from './observation/edit/number/max-value.directive';
import { ObservationEditDropdownComponent } from './observation/edit/dropdown/dropdown.component';
import { ObservationEditTextComponent } from './observation/edit/text/text.component';
import { ObservationEditTextareaComponent } from './observation/edit/textarea/textarea.component';
import { ObservationEditRadioComponent } from './observation/edit/radio/radio.component';

@NgModule({
  declarations: [
    SwaggerComponent,
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
    MinValueDirective,
    MaxValueDirective,
    ObservationEditCheckboxComponent,
    ObservationEditDropdownComponent,
    ObservationEditEmailComponent,
    ObservationEditNumberComponent,
    ObservationEditTextComponent,
    ObservationEditTextareaComponent,
    ObservationEditRadioComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    UpgradeModule,
    UIRouterUpgradeModule.forRoot({ states: [] }),
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
    CheckboardModule
  ],
  providers: [
    mapServiceProvider
  ],
  bootstrap: [],
  entryComponents: [
    MatIcon,
    MatButton,
    MatToolbar,
    MatSpinner,
    MatFormField,
    MatSidenav,
    MatSidenavContent,
    MatSidenavContainer,
    ObservationEditDropdownComponent, 
    ObservationEditCheckboxComponent,
    ObservationEditEmailComponent,
    ObservationEditNumberComponent,
    ObservationEditTextComponent,
    ObservationEditTextareaComponent,
    ObservationEditRadioComponent,
    MultiSelectDropdownComponent,
    LeafletComponent,
    ZoomComponent,
    SearchComponent,
    LocationComponent,
    AddObservationComponent,
    LayersControlComponent,
    ScrollWrapperComponent,
    SwaggerComponent,
    ColorPickerComponent
  ]
})
export class AppModule {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public ngDoBootstrap(): void {}
}
