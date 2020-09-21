import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialDesignFrameworkModule } from '@ajsf/material';
import { JsonSchemaComponent } from './json-schema.component';

@NgModule({
  declarations: [
    JsonSchemaComponent
  ],
  imports: [
    CommonModule,
    MaterialDesignFrameworkModule
  ],
  exports: [
    JsonSchemaComponent
  ]
})
export class JsonSchemaModule { }
