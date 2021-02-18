import { JsonSchemaFormModule } from '@ajsf/core';
import { Component } from '@angular/core'
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule, MatCheckboxModule, MatExpansionModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { By } from '@angular/platform-browser'
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JsonSchemaComponent } from '../../../../json-schema/json-schema.component';
import { AdminFeedEditConfigurationComponent } from './admin-feed-edit-configuration.component';
import { FeedMetaData, FeedMetaDataNullable } from './feed-edit.model'
import { FeedMetaDataBooleanKeys } from './feed-edit.model.spec'

const debounceTime = 500

fdescribe('FeedMetaDataComponent', () => {
  @Component({
    selector: 'test-feed-meta-data-host',
    template: `
      <app-feed-configuration #target [topicMetaData]="topicMetaData" [feedMetaData]="feedMetaData"></app-feed-configuration>
      `,
  })
  class TestFeedMetaDataHostComponent {
    topicMetaData: FeedMetaData | null = null
    feedMetaData: FeedMetaData | null = null
  }

  let host: TestFeedMetaDataHostComponent;
  let target: AdminFeedEditConfigurationComponent;
  let fixture: ComponentFixture<TestFeedMetaDataHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        JsonSchemaFormModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      declarations: [
        JsonSchemaComponent,
        TestFeedMetaDataHostComponent,
        AdminFeedEditConfigurationComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFeedMetaDataHostComponent);
    host = fixture.componentInstance;
    target = fixture.debugElement.query(By.directive(AdminFeedEditConfigurationComponent)).references['target']
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(target).toBeTruthy();
  });

  it('emits a debounced event when the feed meta-data form value changes from input', fakeAsync(() => {

    let observedFormValue: any = null
    let observedMetaData: FeedMetaData | null = null
    target.feedMetaDataForm.valueChanges.subscribe(formValue => {
      observedFormValue = formValue
    })
    target.feedMetaDataChanged.subscribe(metaData => {
      observedMetaData = metaData
    })
    const input = fixture.debugElement.query(x => x.attributes.formControlName === 'title').nativeElement as HTMLInputElement
    input.value = 'Test'
    const event = new Event('input')
    input.dispatchEvent(event)

    tick(debounceTime / 2)

    expect(observedFormValue.title).toEqual('Test')
    expect(observedMetaData).toBeFalsy()

    tick(debounceTime / 2 + 50)

    expect(observedFormValue).toBeTruthy()
    expect(observedMetaData!.title).toEqual('Test')
  }))

  it('updates the form when the feed meta-data changes but does not emit another event', async () => {

    target.feedMetaDataForm.valueChanges.subscribe(x => {
      fail('unexpected form value change event')
    })
    target.feedMetaDataChanged.subscribe(x => {
      fail('unexpected meta-data change event')
    })
    host.feedMetaData = {
      title: 'Test',
      itemPrimaryProperty: 'prop1',
      updateFrequencySeconds: 90,
      itemsHaveIdentity: false
    }
    fixture.detectChanges()

    const expectedFormValue: FeedMetaDataNullable = {
      title: 'Test',
      summary: null,
      icon: null,
      itemPrimaryProperty: 'prop1',
      itemSecondaryProperty: null,
      itemTemporalProperty: null,
      itemsHaveIdentity: false,
      itemsHaveSpatialDimension: null,
      updateFrequencySeconds: 90
    }
    expect(target.feedMetaDataForm.value).toEqual(expectedFormValue)
    expect(target.feedMetaData).toEqual({
      title: 'Test',
      itemPrimaryProperty: 'prop1',
      itemsHaveIdentity: false,
      updateFrequencySeconds: 90,
    })

    await fixture.whenStable()
  })

  it('parses update frequency as a number', fakeAsync(() => {

    let observedFormValue: any = null
    let observedMetaData: FeedMetaData | null = null
    target.feedMetaDataForm.valueChanges.subscribe(formValue => {
      observedFormValue = formValue
    })
    target.feedMetaDataChanged.subscribe(metaData => {
      observedMetaData = metaData
    })

    const input = fixture.debugElement.query(x => x.attributes.formControlName === 'updateFrequencySeconds').nativeElement as HTMLInputElement
    input.value = '111'
    const event = new Event('input')
    input.dispatchEvent(event)
    tick(debounceTime + 50)

    expect(observedFormValue).toEqual({
      title: null,
      summary: null,
      icon: null,
      itemPrimaryProperty: null,
      itemSecondaryProperty: null,
      itemTemporalProperty: null,
      itemsHaveIdentity: null,
      itemsHaveSpatialDimension: null,
      updateFrequencySeconds: 111
    })
    expect(observedMetaData).toEqual({
      updateFrequencySeconds: 111
    })
  }))

  describe('boolean checkbox behavior to avoid using indeterminate checkboxes', () => {

    const nullNonCheckboxKeys: Omit<FeedMetaDataNullable, FeedMetaDataBooleanKeys> = Object.freeze({
      title: null,
      summary: null,
      icon: null,
      itemPrimaryProperty: null,
      itemSecondaryProperty: null,
      itemTemporalProperty: null,
      updateFrequencySeconds: null
    })

    it('parses boolean form values as booleans', fakeAsync(() => {

      let observedMetaData: FeedMetaData | null = null
      target.feedMetaDataChanged.subscribe(metaData => {
        observedMetaData = metaData
      })

      const itemsHaveIdentityCheck = fixture.debugElement
        .query(x => x.attributes.formControlName === 'itemsHaveIdentity')
        .query(x => x.name == 'input' && x.attributes.type == 'checkbox')
        .nativeElement as HTMLInputElement
      itemsHaveIdentityCheck.checked = true
      itemsHaveIdentityCheck.dispatchEvent(new Event('click'))

      tick(debounceTime + 50)

      expect(observedMetaData).toEqual({
        itemsHaveIdentity: true
      })

      const itemsHaveSpatialDimensionCheck = fixture.debugElement
        .query(x => x.attributes.formControlName === 'itemsHaveSpatialDimension')
        .query(x => x.name == 'input' && x.attributes.type == 'checkbox')
        .nativeElement as HTMLInputElement
      itemsHaveSpatialDimensionCheck.checked = true
      itemsHaveSpatialDimensionCheck.dispatchEvent(new Event('click'))

      tick(debounceTime + 50)

      expect(observedMetaData).toEqual({
        itemsHaveIdentity: true,
        itemsHaveSpatialDimension: true
      })
    }))

    it('sets boolean checkboxes from topic meta-data when not present in feed meta-data', () => {

      const topicMetaData: Required<Pick<FeedMetaData, FeedMetaDataBooleanKeys>> = {
        itemsHaveIdentity: true,
        itemsHaveSpatialDimension: true
      }
      host.topicMetaData = topicMetaData
      host.feedMetaData = {}
      fixture.detectChanges()

      expect(target.feedMetaDataForm.value).toEqual({
        ...nullNonCheckboxKeys,
        ...topicMetaData
      })
      for (const key of Object.getOwnPropertyNames(topicMetaData)) {
        const checkboxControl = target.feedMetaDataForm.get(key)
        expect(checkboxControl.pristine).toEqual(true, key)
        expect(checkboxControl.dirty).toEqual(false, key)
      }
    })

    it('does not set boolean checkboxes from topic meta-data when present in feed meta-data', fakeAsync(() => {

      target.feedMetaDataChanged.subscribe(x => {
        fail('unexpected meta-data change')
      })
      const topicMetaData: Required<Pick<FeedMetaData, FeedMetaDataBooleanKeys>> = {
        itemsHaveIdentity: true,
        itemsHaveSpatialDimension: true
      }
      const feedMetaData: Required<Pick<FeedMetaData, FeedMetaDataBooleanKeys>> = {
        itemsHaveIdentity: false,
        itemsHaveSpatialDimension: false
      }

      host.topicMetaData = topicMetaData
      host.feedMetaData = feedMetaData
      fixture.detectChanges()

      tick(debounceTime + 50)

      let expectedFormValue: FeedMetaDataNullable = {
        ...nullNonCheckboxKeys,
        ...feedMetaData
      }
      expect(target.feedMetaDataForm.value).toEqual(expectedFormValue)
    }))

    it('sets the checkboxes from the topic meta-data when feed meta-data changes and does not have the checkbox keys', () => {

      const topicMetaData: Pick<FeedMetaDataNullable, FeedMetaDataBooleanKeys> = {
        itemsHaveIdentity: true,
        itemsHaveSpatialDimension: true
      }
      const feedMetaDataWithCheckboxKeys: Pick<FeedMetaDataNullable, FeedMetaDataBooleanKeys> = {
        itemsHaveIdentity: false,
        itemsHaveSpatialDimension: false
      }
      host.topicMetaData = topicMetaData
      host.feedMetaData = feedMetaDataWithCheckboxKeys
      fixture.detectChanges()

      expect(target.feedMetaData).toEqual(feedMetaDataWithCheckboxKeys)
      expect(target.feedMetaDataForm.value).toEqual({
        ...nullNonCheckboxKeys,
        ...feedMetaDataWithCheckboxKeys
      })
      for (const key of Object.getOwnPropertyNames(feedMetaDataWithCheckboxKeys)) {
        const control = target.feedMetaDataForm.get(key)
        expect(control.pristine).toEqual(true, key)
        expect(control.dirty).toEqual(false, key)
      }

      const unspecifiedCheckboxKeys: Record<FeedMetaDataBooleanKeys, undefined> = {
        itemsHaveIdentity: undefined,
        itemsHaveSpatialDimension: undefined
      }
      host.feedMetaData = unspecifiedCheckboxKeys
      fixture.detectChanges()

      expect(target.feedMetaData).toEqual(unspecifiedCheckboxKeys)
      expect(target.feedMetaDataForm.value).toEqual({
        ...nullNonCheckboxKeys,
        ...topicMetaData
      })
      for (const key of Object.getOwnPropertyNames(feedMetaDataWithCheckboxKeys)) {
        const control = target.feedMetaDataForm.get(key)
        expect(control.pristine).toEqual(true, key)
        expect(control.dirty).toEqual(false, key)
      }
    })

    it('includes checkbox values in the meta-data only if dirty', fakeAsync(() => {

      const observedMetaData: FeedMetaData[] = []
      target.feedMetaDataChanged.subscribe(x => {
        observedMetaData.push(x)
      })
      const topicMetaData: Pick<FeedMetaDataNullable, FeedMetaDataBooleanKeys> = Object.freeze({
        itemsHaveIdentity: true,
        itemsHaveSpatialDimension: true
      })
      host.topicMetaData = topicMetaData
      fixture.detectChanges()

      expect(target.feedMetaData).toBeNull()
      expect(target.feedMetaDataForm.value).toEqual({
        ...nullNonCheckboxKeys,
        ...topicMetaData
      })
      for (const key of Object.getOwnPropertyNames(topicMetaData)) {
        const control = target.feedMetaDataForm.get(key)
        expect(control.pristine).toEqual(true, key)
        expect(control.dirty).toEqual(false, key)
      }
      expect(observedMetaData).toEqual([])

      const input = fixture.debugElement.query(x => x.attributes.formControlName === 'summary').nativeElement as HTMLInputElement
      input.value = 'No Checkboxes'
      input.dispatchEvent(new Event('input'))

      tick(debounceTime + 50)

      expect(observedMetaData).toEqual([
        { summary: 'No Checkboxes' }
      ])
      expect(target.feedMetaData).toEqual({ summary: 'No Checkboxes' })
      expect(target.feedMetaDataForm.value).toEqual({
        ...nullNonCheckboxKeys,
        ...topicMetaData,
        summary: 'No Checkboxes'
      })

      const checkbox = fixture.debugElement
        .query(x => x.attributes.formControlName === 'itemsHaveIdentity')
        .query(x => x.name === 'input' && x.attributes.type === 'checkbox')
        .nativeElement as HTMLInputElement
      checkbox.checked = false
      checkbox.dispatchEvent(new Event('click'))

      tick(debounceTime + 50)

      expect(observedMetaData).toEqual([
        { summary: 'No Checkboxes' },
        { summary: 'No Checkboxes', itemsHaveIdentity: false }
      ])
      expect(target.feedMetaData).toEqual({
        summary: 'No Checkboxes', itemsHaveIdentity: false
      })
    }))
  })

  it('clears the form when feed meta-data changes to null', fakeAsync(() => {

    expect(target.feedMetaDataForm.pristine).toEqual(true)
    expect(target.feedMetaDataForm.dirty).toEqual(false)

    const titleInput = fixture.debugElement.query(x => x.attributes.formControlName === 'title').nativeElement as HTMLInputElement
    titleInput.value = 'Dirty'
    titleInput.dispatchEvent(new Event('input'))

    expect(target.feedMetaDataForm.pristine).toEqual(false)
    expect(target.feedMetaDataForm.dirty).toEqual(true)
    let expectedFormValue: FeedMetaDataNullable = {
      title: 'Dirty',
      summary: null,
      icon: null,
      itemsHaveIdentity: null,
      itemsHaveSpatialDimension: null,
      itemPrimaryProperty: null,
      itemSecondaryProperty: null,
      itemTemporalProperty: null,
      updateFrequencySeconds: null,
    }
    expect(target.feedMetaDataForm.value).toEqual(expectedFormValue)
    expect(target.feedMetaData).toEqual(null)

    tick(debounceTime + 50)

    expect(target.feedMetaData).toEqual({ title: 'Dirty' })

    host.feedMetaData = target.feedMetaData
    fixture.detectChanges()

    expect(target.feedMetaData).toEqual({ title: 'Dirty' })

    host.feedMetaData = null
    fixture.detectChanges()

    for (const [ key, control ] of Object.entries(target.feedMetaDataForm.controls)) {
      expect(control.pristine).toEqual(true, key)
      expect(control.dirty).toEqual(false, key)
      expect(control.value).toBeNull(key)
    }
    expect(target.feedMetaDataForm.pristine).toEqual(true)
    expect(target.feedMetaDataForm.dirty).toEqual(false)
  }))
})
