import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { debounceTime } from 'rxjs/operators'

type JsonSchemaPropertyType = 'string' | 'number' | 'integer' | 'boolean' | 'null'
type JsonSchemaPropertyFormat = 'uri' | 'date-time'

interface SimplePropertyJsonSchema {
  type: JsonSchemaPropertyType | null
  title?: string | null
  description?: string | null
  format?: JsonSchemaPropertyFormat | null
}

export interface KeyedPropertySchema {
  key: string,
  schema: SimplePropertyJsonSchema
}

@Component({
  selector: 'app-feed-item-properties-configuration',
  templateUrl: './admin-feed-edit-item-properties.component.html',
  styleUrls: ['./admin-feed-edit-item-properties.component.scss']
})
export class AdminFeedEditItemPropertiesComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() itemPropertiesSchema: any = { properties: {} };
  @Output() itemPropertiesSchemaChanged = new EventEmitter<any>();
  @Output() itemPropertiesSchemaAccepted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();

  itemPropertiesSchemas: KeyedPropertySchema[] = [];
  itemPropertiesForm: FormGroup = new FormGroup({})
  newProperty: KeyedPropertySchema = {
    key: null,
    schema: {
      type: null,
      title: null,
      description: null,
      format: null
    }
  };
  valid: boolean = false;

  ngOnInit(): void {
    this.itemPropertiesForm.valueChanges.pipe(debounceTime(500)).subscribe({
      next: (formSchema) => {
        this.itemPropertiesSchemaChanged.emit(syncSchemaFormToSchema(formSchema, this.itemPropertiesSchema))
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemPropertiesSchema) {
      this.itemPropertiesSchemas = keyedPropertiesFromSchema(this.itemPropertiesSchema)
      this.itemPropertiesForm = syncPropertiesFormToSchemaProperties(this.itemPropertiesForm, this.itemPropertiesSchema)
    }
  }

  closed(): void { }

  isValid(valid: boolean): void {
    this.valid = valid;
  }

  addProperty(): void {
    // TODO
    // this.initialProperties.push(this.newProperty);
    // this.propertiesChanged(this.newProperty, this.initialProperties.length - 1);
    // this.newProperty = {};
  }

  prevStep(): void {
    // TODO should probably save properties changes here
    this.cancelled.emit();
  }

  nextStep(): void {
    const properties = this.itemPropertiesSchemas.reduce((properties, property) => {
      properties[property.key] = property.schema
      return properties
    }, {})
    this.itemPropertiesSchema.properties = properties
    this.itemPropertiesSchemaAccepted.emit(this.itemPropertiesSchema);
  }
}

function keyedPropertiesFromSchema(schema: any): KeyedPropertySchema[] {
  if (!schema || !schema.properties) {
    return []
  }
  return Object.getOwnPropertyNames(schema.properties).map(key => {
    return { key, schema: { ...schema.properties[key] }}
  })
}

function syncPropertiesFormToSchemaProperties(form: FormGroup, schema: any): FormGroup {
  const properties: { [key: string]: SimplePropertyJsonSchema } = schema ? schema.properties || {} : {}
  const propertiesKeys = Object.getOwnPropertyNames(properties)
  const formKeys = Object.getOwnPropertyNames(form.controls)
  for (const schemaKey of propertiesKeys) {
    if (!form.contains(schemaKey)) {
      form.addControl(schemaKey, formGroupForPropertySchema(properties[schemaKey]))
    }
  }
  for (const formKey of formKeys) {
    if (!properties.hasOwnProperty(formKey)) {
      form.removeControl(formKey)
    }
  }
  return form
}

function formGroupForPropertySchema(schema: SimplePropertyJsonSchema): FormGroup {
  const controls = {
    schema: new FormGroup({
      type: new FormControl(schema.type),
      title: new FormControl(schema.title),
      description: new FormControl(schema.description),
      format: new FormControl(schema.format)
    })
  }
  return new FormGroup(controls)
}

function syncSchemaFormToSchema(schemaFormValue: any, schema: any): any {
  schema = schema || { type: 'object', properties: {} }
  const { properties, ...schemaCopy } = schema
  schemaCopy.properties = {}
  for (const key of Object.getOwnPropertyNames(schemaFormValue)) {
    const formPropertySchema = schemaFormValue[key].schema
    const propertySchema = properties[key]
    schemaCopy.properties[key] = Object.assign({}, propertySchema, formPropertySchema)
  }
  return schemaCopy
}
