import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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

import { WidgetLibraryService } from '@ajsf/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';
import {
  StyleUtils,
  StylesheetMap,
  MediaMarshaller,
  ɵMatchMedia,
  BreakPointRegistry,
  PrintHook,
  LayoutStyleBuilder,
  FlexStyleBuilder,
  ShowHideStyleBuilder,
  FlexOrderStyleBuilder,
  LayoutGapStyleBuilder,
  LayoutAlignStyleBuilder,
  FlexOffsetStyleBuilder,
  FlexAlignStyleBuilder
} from '@angular/flex-layout';
import { JsonSchemaFormModule } from '@ajsf/core';
import { MaterialDesignFrameworkModule } from '@ajsf/material';

import { MapSelectWidgetComponent } from './map-select-widget/map-select-widget.component';

@NgModule({
  imports: [
    CommonModule,
    JsonSchemaFormModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialDesignFrameworkModule,
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
    // NgxMatSelectSearchModule,
    MatChipsModule,
    MatSidenavModule
  ],
  declarations: [
    MapSelectWidgetComponent
  ],
  entryComponents: [
    MatIcon,
    MatButton,
    MatToolbar,
    MatSpinner,
    MatFormField,
    MatSidenav,
    MatSidenavContent,
    MatSidenavContainer,
    MapSelectWidgetComponent
  ],
  exports: [
    FlexLayoutModule,
    JsonSchemaFormModule,
    MapSelectWidgetComponent
  ],
  providers: [
    StyleUtils,
    StylesheetMap,
    MediaMarshaller,
    ɵMatchMedia,
    BreakPointRegistry,
    PrintHook,
    LayoutStyleBuilder,
    FlexStyleBuilder,
    ShowHideStyleBuilder,
    FlexOrderStyleBuilder,
    LayoutGapStyleBuilder,
    LayoutAlignStyleBuilder,
    FlexOffsetStyleBuilder,
    FlexAlignStyleBuilder
  ]
})
export class JsonSchemaWidgetsModule {
  constructor(private widgetLibrary: WidgetLibraryService) {
    widgetLibrary.registerWidget('map-select-widget', MapSelectWidgetComponent);
  }
}
