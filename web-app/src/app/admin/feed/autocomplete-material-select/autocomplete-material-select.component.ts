import { AbstractControl, FormControl } from '@angular/forms';
import {Component, Inject, Input, OnInit, OnChanges, Optional, SimpleChanges, KeyValueDiffers, KeyValueDiffer, DoCheck } from '@angular/core';
import { JsonSchemaFormService, buildTitleMap, isArray } from '@ajsf/core';
import { MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-autocomplete-material-select',
  templateUrl: './autocomplete-material-select.component.html',
  styleUrls: ['./autocomplete-material-select.component.scss']
})


export class AutocompleteMaterialSelectComponent implements OnInit {
  formControl: AbstractControl = new FormControl();
  controlName: string;
  controlValue: any;
  controlDisabled = false;
  boundControl = false;
  options: any;
  selectList: any[] = [];
  isArray = isArray;
  differ: any;
  boundDisplayValue: (value: string) => string;
  filteredTitleMap: Observable<any>;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  constructor(
    @Inject(MAT_FORM_FIELD_DEFAULT_OPTIONS) @Optional() public matFormFieldDefaultOptions,
    @Inject(MAT_LABEL_GLOBAL_OPTIONS) @Optional() public matLabelGlobalOptions,
    private jsf: JsonSchemaFormService,
    private differs: KeyValueDiffers
  ) {
    this.differ = differs.find({}).create();

  }

  private _filter(value: any): any[] {
    if (!value) {
      return this.selectList;
    }

    const filterValue = value.toLowerCase();
    return this.selectList.filter(option => {
      if (!option.name) {
        return false;
      }
      return option.name.toLowerCase().includes(filterValue);
    });
  }

  ngOnInit(): void {
    // console.log('on init', this.layoutNode.options);
    this.options = this.layoutNode.options || {};
    // console.log('on init titleMap', this.layoutNode.options.titleMap);

    this.selectList = buildTitleMap(
      this.options.titleMap || this.options.enumNames,
      this.options.enum, !!this.options.required, !!this.options.flatList
    );
    // console.log('this.selectList', this.selectList);
    this.jsf.initializeControl(this, !this.options.readonly);
    if (!this.options.notitle && !this.options.description && this.options.placeholder) {
      this.options.description = this.options.placeholder;
    }

    this.filteredTitleMap = this.formControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.boundDisplayValue = this.titleMapDisplay.bind(this);
  }

  updateValue(event): void {
    // console.log('event', event);
    if (!this.boundControl) {
      this.options.showErrors = true;
      this.jsf.updateValue(this, event.option.value);
    }
  }

  titleMapDisplay(selectedItem: string): string {
    // console.log('this', this);
    // console.log('selectedItem', selectedItem);
    if (this.selectList) {
      const found = this.selectList.find((value: any) => {
        return value.value === selectedItem;
      });
      // console.log('found', found);
      return found.name;
    }
    return '';
  }
}
