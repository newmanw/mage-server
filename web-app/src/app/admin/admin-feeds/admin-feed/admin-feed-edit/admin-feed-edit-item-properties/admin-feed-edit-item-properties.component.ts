import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms'
import * as _ from 'lodash'
import { Subscription } from 'rxjs'
import { debounceTime, filter } from 'rxjs/operators'

type JsonSchemaPropertyType = 'string' | 'number' | 'integer' | 'boolean' | 'null'
type JsonSchemaPropertyFormat = 'uri' | 'date-time'

export interface SimplePropertyJsonSchema {
  type?: JsonSchemaPropertyType | null
  title?: string | null
  description?: string | null
  format?: JsonSchemaPropertyFormat | null
}

export interface SimpleJsonSchema {
  type?: 'object',
  properties?: SimpleJsonSchemaProperties
}

export interface SimpleJsonSchemaProperties {
  [PropertyKey: string]: SimplePropertyJsonSchema
}

export interface KeyedPropertySchema {
  key: string,
  schema: SimplePropertyJsonSchema
}

export type KeyedPropertySchemaFormValue = {
  key: KeyedPropertySchema['key'],
  schema: Pick<SimplePropertyJsonSchema, 'type'> & {
    [K in keyof Omit<SimplePropertyJsonSchema, 'type'>]-?: SimplePropertyJsonSchema[K] | null
  }
}

export type SchemaFormValue = KeyedPropertySchemaFormValue[]

@Component({
  selector: 'app-feed-item-properties-configuration',
  templateUrl: './admin-feed-edit-item-properties.component.html',
  styleUrls: ['./admin-feed-edit-item-properties.component.scss']
})
export class AdminFeedEditItemPropertiesComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() topicSchema: any = null;
  @Input() feedSchema: any = null;
  @Output() feedSchemaChanged = new EventEmitter<SimpleJsonSchema>();
  @Output() feedSchemaAccepted = new EventEmitter<SimpleJsonSchema>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  newProperty: KeyedPropertySchema = {
    key: '',
    schema: {
      type: null,
      title: null,
      description: null,
      format: null
    }
  }
  valid: boolean = false
  readonly schemaForm: FormArray = new FormArray([])
  readonly changeDebounceInterval = 500

  private schemaChangesEnabled = true

  ngOnInit(): void {
    this.schemaForm.valueChanges
      .pipe(
        filter(() => this.schemaChangesEnabled),
        debounceTime(500)
      )
      .subscribe((x: SchemaFormValue) => {
        this.feedSchema = applyFormValueToSchema(x, this.feedSchema)
        this.feedSchemaChanged.emit(this.feedSchema)
      })
    this.buildFreshForm()
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.schemaChangesEnabled = false
    if (changes.feedSchema) {
      if (changes.feedSchema.previousValue && this.feedSchema) {
        // updating same schema; sync to existing form
        syncPropertiesFormToSchemaProperties(this.schemaForm, this.feedSchema)
      }
      else {
        this.buildFreshForm()
      }
    }
    else if (changes.topicSchema && !this.feedSchema) {
      this.buildFreshForm()
    }
    this.schemaChangesEnabled = true
  }

  closed(): void { }

  isValid(valid: boolean): void {
    this.valid = valid;
  }

  addProperty(): void {
    // TODO: revisit this later if we find it is necessary
    // this.initialProperties.push(this.newProperty);
    // this.propertiesChanged(this.newProperty, this.initialProperties.length - 1);
    // this.newProperty = {};
  }

  prevStep(): void {
    // TODO should probably save properties changes here
    this.cancelled.emit();
  }

  nextStep(): void {
    this.feedSchemaAccepted.emit(this.feedSchema);
  }

  private buildFreshForm() {
    this.schemaForm.clear()
    syncPropertiesFormToSchemaProperties(this.schemaForm, this.feedSchema || this.topicSchema)
  }
}

function syncPropertiesFormToSchemaProperties(form: FormArray, schema: SimpleJsonSchema): FormArray {
  const properties: SimpleJsonSchemaProperties = schema ? schema.properties || {} : {}
  const propertyKeys: string[] = Object.getOwnPropertyNames(properties).sort()
  const retainedFormKeys: { [key: string]: true } = {}
  let pos = form.controls.length
  while (pos--) {
    const currentPropertyFormValue: KeyedPropertySchema = form.controls[pos].value
    const key = currentPropertyFormValue.key
    if (properties.hasOwnProperty(key)) {
      retainedFormKeys[key] = true
      const incomingPropertySchema = schema.properties[key]
      const incomingPropertyFormValue = formValueForPopertySchema(key, incomingPropertySchema)
      form.get([ pos, 'schema' ]).setValue(incomingPropertyFormValue.schema, { emitEvent: false })
    }
    else {
      form.removeAt(pos)
    }
  }
  for (pos = 0; pos < propertyKeys.length; pos++) {
    const key = propertyKeys[pos]
    const propertySchema = properties[key]
    if (!retainedFormKeys[key]) {
      const propertyForm = formGroupForPropertySchema(key, propertySchema)
      form.insert(pos, propertyForm)
    }
  }
  return form
}

function formGroupForPropertySchema(key: string, schema: SimplePropertyJsonSchema): FormGroup {
  const controls = {
    key: new FormControl(key),
    schema: new FormGroup({
      type: new FormControl(schema.type),
      title: new FormControl(schema.title),
      description: new FormControl(schema.description),
      format: new FormControl(schema.format)
    })
  }
  const schemaForm = new FormGroup(controls)
  return schemaForm
}

function applyFormValueToSchema(schemaFormValue: SchemaFormValue, schema: SimpleJsonSchema | null): SimpleJsonSchema {
  schema = { ...schema } || { type: 'object', properties: {} }
  const properties = schema.properties = { ...schema.properties } || {}
  for (const propertyFormValue of schemaFormValue) {
    const key = propertyFormValue.key
    const formPropertySchema = propertySchemaForFormValue(propertyFormValue)
    const existingPropertySchema = properties[key]
    schema.properties[key] = { ...existingPropertySchema, ...formPropertySchema }
  }
  return schema
}

function formValueForPopertySchema(key: string, propertySchema: SimplePropertyJsonSchema): KeyedPropertySchemaFormValue {
  // TODO: validate type is present
  return {
    key,
    schema: {
      type: propertySchema.type || null,
      title: propertySchema.title || null,
      description: propertySchema.description || null,
      format: propertySchema.format || null
    }
  }
}

function propertySchemaForFormValue(formValue: KeyedPropertySchemaFormValue): SimplePropertyJsonSchema {
  return _.omitBy(formValue.schema, _.isNil)
}