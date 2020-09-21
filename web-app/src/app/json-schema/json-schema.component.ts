import { JsonSchemaFormService, WidgetLibraryService } from '@ajsf/core';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { JsonSchemaWidgetAutocompleteComponent } from './json-schema-widget/json-schema-widget-autocomplete.component';

@Component({
  selector: 'app-json-schema',
  templateUrl: './json-schema.component.html',
  providers: [ JsonSchemaFormService ]
})
export class JsonSchemaComponent implements OnInit, OnChanges {
  @Input() schema: any;
  @Input() form: any;
  @Input() layout: any;
  @Input() data: any;
  @Input() options: any;
  @Output() onSubmit = new EventEmitter<any>();
  @Output() onChanges = new EventEmitter<any>();
  @Output() isValid = new EventEmitter<any>();
  @Output() dataChange = new EventEmitter<any>();

  taskSchema: any;
  taskForm: any;
  taskLayout: any;
  taskData: any;
  taskOptions: any;

  constructor(widgetLibrary: WidgetLibraryService) {
    widgetLibrary.registerWidget('autocomplete', JsonSchemaWidgetAutocompleteComponent);
  }

  ngOnInit(): void {
    this.taskSchema = this.schema;
    this.taskForm = this.form;
    this.taskLayout = this.layout;
    this.taskData = this.data;
    this.taskOptions = this.options;
  }

  ngOnChanges(): void {
    this.taskSchema = this.schema;
    this.taskForm = this.form;
    this.taskLayout = this.layout;
    this.taskData = this.data;
    this.taskOptions = this.options;
  }

  submitUserTaskForm($event): void {
    this.onSubmit.emit($event);
  }

  userTaskFormChanges($event): void {
    this.onChanges.emit($event);
  }

  isValidTask($event): void {
    this.isValid.emit($event);
  }

  taskDataChange($event): void {
    this.dataChange.emit($event);
  }
}
