import { JsonSchemaFormService, WidgetLibraryService } from '@ajsf/core';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AutocompleteMaterialSelectComponent } from '../autocomplete-material-select/autocomplete-material-select.component';

@Component({
  selector: 'app-json-schema',
  template: `<json-schema-form
  framework="material-design"
  [schema]="taskSchema"
  [form]="taskForm"
  [layout]="taskLayout"
  [data]="taskData"
  [options]="taskOptions"
  (onSubmit)="submitUserTaskForm($event)"
  (onChanges)="userTaskFormChanges($event)"
  (isValid)="isValidTask($event)"
  (dataChange)="taskDataChange($event)">
</json-schema-form>`,
  providers: [JsonSchemaFormService]
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

  constructor(
    widgetLibrary: WidgetLibraryService,
    ) {
    widgetLibrary.registerWidget('autocomplete', AutocompleteMaterialSelectComponent);
  }

  ngOnInit(): void {
    this.taskSchema = this.schema;
    this.taskForm = this.form;
    this.taskLayout = this.layout;
    this.taskData = this.data;
    this.taskOptions = this.options;
  }

  ngOnChanges(): void {}

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
