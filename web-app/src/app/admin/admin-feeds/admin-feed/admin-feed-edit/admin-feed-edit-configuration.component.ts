import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { debounceTime, map } from 'rxjs/operators'
import { FeedTopic } from 'src/app/feed/feed.model'
import { FeedMetaData, feedMetaDataLean, FeedMetaDataNullable } from './feed-edit.model'

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

  @Input() topic: FeedTopic | null;
  @Input() itemPropertiesSchema: any;
  @Input() feedMetaData: FeedMetaData | null;
  @Input() expanded: boolean;
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
    itemTemporalProperty: new FormControl(),
    updateFrequencySeconds: new FormControl()
  })
  itemSchemaPropertyTitles: { key: string, title: string }[] = [];
  readonly changeDebounceInterval = 500

  ngOnInit(): void {
    this.feedMetaDataForm.valueChanges.pipe(
      debounceTime(this.changeDebounceInterval),
      map(formValue => metaDataFromDirtyValues(this.feedMetaDataForm, this.feedMetaData)),
    ).subscribe({
      next: metaDataFromForm => {
        this.feedMetaData = metaDataFromForm
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
    if (changes.topic) {
      if (!changes.feedMetaData) {
        // leave feed meta-data if changing at the same time as the topic
        this.feedMetaData = null
      }
      this.feedMetaDataForm.reset(this.mergedMetaDataFormValue(), { emitEvent: false })
    }
    else if (changes.feedMetaData) {
      if (this.feedMetaData) {
        this.feedMetaDataForm.setValue(this.mergedMetaDataFormValue(), { emitEvent: false })
      }
      else {
        this.feedMetaDataForm.reset(this.mergedMetaDataFormValue(), { emitEvent: false })
      }
    }
  }

  onPreviousStep(): void {
    this.cancelled.emit()
  }

  onAccepted(): void {
    if (this.feedMetaDataForm.dirty) {
      this.feedMetaData = metaDataFromDirtyValues(this.feedMetaDataForm, this.feedMetaData)
      this.feedMetaDataAccepted.emit(this.feedMetaData)
    }
    else {
      this.feedMetaDataAccepted.emit(null)
    }
  }

  private mergedMetaDataFormValue() {
    const topicMetaData = feedMetaDataLean(this.topic || {})
    const feedMetaData = feedMetaDataLean(this.feedMetaData || {})
    const mergedMetaData = { ...topicMetaData, ...feedMetaData }
    return formValueForMetaData(mergedMetaData)
  }
}

export function formValueForMetaData(metaData: FeedMetaData): Required<FeedMetaDataNullable> {
  metaData = metaData || {}
  return {
    title: metaData.title || null,
    summary: metaData.summary || null,
    icon: metaData.icon || null,
    itemPrimaryProperty: metaData.itemPrimaryProperty || null,
    itemSecondaryProperty: metaData.itemSecondaryProperty || null,
    itemTemporalProperty: metaData.itemTemporalProperty || null,
    itemsHaveIdentity: typeof metaData.itemsHaveIdentity === 'boolean' ? metaData.itemsHaveIdentity : null,
    itemsHaveSpatialDimension: typeof metaData.itemsHaveSpatialDimension === 'boolean' ? metaData.itemsHaveSpatialDimension : null,
    updateFrequencySeconds: typeof metaData.updateFrequencySeconds === 'number' ? metaData.updateFrequencySeconds : null
  }
}

function metaDataFromDirtyValues(form: FormGroup, previousMetaData: FeedMetaData): FeedMetaData | null {
  if (form.pristine) {
    return previousMetaData
  }
  const metaData: FeedMetaData = Object.getOwnPropertyNames(form.value).reduce((metaData, key) => {
    const control = form.get(key)
    if (control.dirty && control.value !== null && control.value !== undefined) {
      metaData[key] = control.value
    }
    return metaData
  }, {})
  const merged = feedMetaDataLean({
    ...previousMetaData,
    ...metaData
  })
  return merged
}
