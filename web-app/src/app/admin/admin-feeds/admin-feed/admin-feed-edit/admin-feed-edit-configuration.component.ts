import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { debounceTime } from 'rxjs/operators'
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

  @Input() expanded: boolean;
  @Input() itemPropertiesSchema: any;
  @Input() topicMetaData: FeedMetaData | null;
  @Input() feedMetaData: FeedMetaData | null;
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

  ngOnInit(): void {
    this.feedMetaDataForm.valueChanges.pipe(debounceTime(500)).subscribe({
      next: formValue => {
        formValue = formValueWithoutCheckboxValuesAssignedFromTopicOfForm(this.feedMetaDataForm)
        this.feedMetaData = feedMetaDataLean(formValue)
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
        const clear = formValueForMetaData({})
        this.feedMetaDataForm.reset(clear, { emitEvent: false })
      }
    }
    if (changes.topicMetaData || changes.feedMetaData) {
      this.updateCheckboxesFromTopicForUnspecifiedMetaDataKeys()
    }
  }

  onPreviousStep(): void {
    this.cancelled.emit();
  }

  onAccepted(): void {
    this.feedMetaDataAccepted.emit(this.feedMetaData);
  }

  /**
   * Use the topic values to initialize the checkboxes to avoid using the
   * potentially user-confusing `indeterminate` state on checkboxes.
   */
  private updateCheckboxesFromTopicForUnspecifiedMetaDataKeys() {
    const topicMetaData = this.topicMetaData || {}
    const feedMetaData = this.feedMetaData || {}
    const checkboxes: Pick<FeedMetaData, keyof typeof checkboxKeys> = {}
    for (const key of Object.getOwnPropertyNames(checkboxKeys)) {
      if (typeof feedMetaData[key] === 'boolean') {
        checkboxes[key] = feedMetaData[key]
      }
      else if (typeof topicMetaData[key] === 'boolean') {
        checkboxes[key] = topicMetaData[key]
      }
    }
    this.feedMetaDataForm.patchValue(checkboxes, { emitEvent: false })
  }
}

function formValueForMetaData(metaData: FeedMetaData): Required<FeedMetaDataNullable> {
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

type FeedMetaDataBooleanKeys = { [K in keyof FeedMetaData]: FeedMetaData[K] extends boolean ? K : never }[keyof FeedMetaData]

const checkboxKeys: Record<FeedMetaDataBooleanKeys, null> = {
  itemsHaveIdentity: null,
  itemsHaveSpatialDimension: null
}

function formValueWithoutCheckboxValuesAssignedFromTopicOfForm(feedMetaDataForm: FormGroup): FeedMetaDataNullable {
  const formValue = { ...feedMetaDataForm.value }
  for (const checkboxKey of Object.getOwnPropertyNames(checkboxKeys)) {
    const checkbox = feedMetaDataForm.get(checkboxKey)
    if (checkbox.pristine) {
      delete formValue[checkboxKey]
    }
  }
  return formValue
}
