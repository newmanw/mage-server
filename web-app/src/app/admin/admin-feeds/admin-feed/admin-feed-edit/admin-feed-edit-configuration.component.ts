import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { debounceTime } from 'rxjs/operators'
import { FeedMetaData, FeedMetaDataNullable } from './feed-edit.service'

export type IconModel = Readonly<
  | { iconFile: string }
  | { iconUrl: string }
  | { iconId: string }
  >

export interface MapStyle {
  icon: IconModel
}
@Component({
  selector: 'app-feed-configuration',
  templateUrl: './admin-feed-edit-configuration.component.html',
  styleUrls: ['./admin-feed-edit-configuration.component.scss']
})
export class AdminFeedEditConfigurationComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Input() itemPropertiesSchema: any;
  @Input() feedMetaData: FeedMetaData;
  @Input() buttonText: string;
  @Output() feedMetaDataAccepted = new EventEmitter<any>();
  @Output() feedMetaDataChanged = new EventEmitter<FeedMetaData>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();

  feedMetaDataForm: FormGroup = new FormGroup({
    title: new FormControl(),
    summary: new FormControl(),
    icon: new FormControl(),
    itemsHaveIdentity: new FormControl(),
    itemsHaveSpatialDimension: new FormControl(),
    itemPrimaryProperty: new FormControl(),
    itemSecondaryProperty: new FormControl(),
    itemTemporalProperty: new FormControl()
  })
  itemSchemaPropertyTitles: { key: string, title: string }[] = [];

  ngOnInit(): void {
    this.feedMetaDataForm.valueChanges.pipe(debounceTime(500)).subscribe({
      next: formValue => {
        this.feedMetaData = metaDataForFormValue(formValue)
        this.feedMetaDataChanged.emit(this.feedMetaData)
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemPropertiesSchema) {
      const schema = this.itemPropertiesSchema || {}
      const schemaProperties = schema.properties || {}
      this.itemSchemaPropertyTitles = Object.getOwnPropertyNames(schemaProperties).map(key => {
        const schemaProperty = schemaProperties[key] || {}
        return { key, title: schemaProperty.title || key }
      })
    }
    if (changes.feedMetaData) {
      if (this.feedMetaData) {
        this.feedMetaDataForm.setValue(formValueForMetaData(this.feedMetaData), { emitEvent: false })
      }
      else {
        this.feedMetaDataForm.reset({ emitEvent: false })
      }
    }
  }

  onPreviousStep(): void {
    this.cancelled.emit();
  }

  onAccepted(): void {
    this.feedMetaDataAccepted.emit(this.feedMetaData);
  }
}

function metaDataForFormValue(formValue: FeedMetaDataNullable): FeedMetaData {
  return {
    title: formValue.title,
    summary: formValue.summary || void(0),
    icon: formValue.icon || void(0),
    itemPrimaryProperty: formValue.itemPrimaryProperty || void(0),
    itemSecondaryProperty: formValue.itemSecondaryProperty || void(0),
    itemTemporalProperty: formValue.itemTemporalProperty || void(0),
    itemsHaveIdentity: formValue.itemsHaveIdentity === null ? void(0) : formValue.itemsHaveIdentity,
    itemsHaveSpatialDimension: formValue.itemsHaveSpatialDimension === null ? void(0) : formValue.itemsHaveSpatialDimension,
  }
}

function formValueForMetaData(metaData: FeedMetaData): Required<FeedMetaDataNullable> {
  return {
    title: metaData.title,
    summary: metaData.summary || null,
    icon: metaData.icon || null,
    itemPrimaryProperty: metaData.itemPrimaryProperty || null,
    itemSecondaryProperty: metaData.itemSecondaryProperty || null,
    itemTemporalProperty: metaData.itemTemporalProperty || null,
    itemsHaveIdentity: metaData.itemsHaveIdentity === void(0) ? null : metaData.itemsHaveIdentity,
    itemsHaveSpatialDimension: metaData.itemsHaveSpatialDimension === void(0) ? null : metaData.itemsHaveSpatialDimension
  }
}
