import { Component, ChangeDetectorRef } from '@angular/core';
import {JsonSchemaFormService, JsonSchemaFormComponent, FrameworkLibraryService, WidgetLibraryService } from '@ajsf/core';
import { AutocompleteMaterialSelectComponent } from '../autocomplete-material-select/autocomplete-material-select.component';

@Component({
  selector: 'app-json-schema',
  template: `<form [autocomplete]="jsf?.formOptions?.autocomplete ? 'on' : 'off'" class="json-schema-form" (ngSubmit)="submitForm()">
    <root-widget [layout]="jsf?.layout"></root-widget>
  </form>
  <div *ngIf="debug || jsf?.formOptions?.debug">
    Debug output:
    <pre>{{debugOutput}}</pre>
  </div>`,
  providers: [JsonSchemaFormService]
})
export class JsonSchemaComponent extends JsonSchemaFormComponent {

  constructor(
    changeDetector: ChangeDetectorRef,
    frameworkLibrary: FrameworkLibraryService,
    widgetLibrary: WidgetLibraryService,
    jsf: JsonSchemaFormService) {
    super(changeDetector, frameworkLibrary, widgetLibrary, jsf);
    widgetLibrary.registerWidget('autocomplete', AutocompleteMaterialSelectComponent);
  }
}
