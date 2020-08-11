import { Component } from '@angular/core';
import {JsonSchemaFormService, JsonSchemaFormComponent } from '@ajsf/core';

@Component({
  selector: 'app-feed-configuration',
  template: `<form [autocomplete]="jsf?.formOptions?.autocomplete ? 'on' : 'off'" class="json-schema-form" (ngSubmit)="submitForm()">
    <root-widget [layout]="jsf?.layout"></root-widget>
  </form>
  <div *ngIf="debug || jsf?.formOptions?.debug">
    Debug output:
    <pre>{{debugOutput}}</pre>
  </div>`,
  providers: [JsonSchemaFormService]
})
export class FeedConfigurationComponent extends JsonSchemaFormComponent {
}
