import { JsonSchemaFormModule } from '@ajsf/core';
import { Component } from '@angular/core'
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatAutocompleteModule, MatCheckboxModule, MatExpansionModule, MatFormFieldModule, MatInput, MatInputModule } from '@angular/material';
import { By } from '@angular/platform-browser'
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JsonSchemaComponent } from '../../../../json-schema/json-schema.component';
import { AdminFeedEditConfigurationComponent } from './admin-feed-edit-configuration.component';
import { FeedMetaData, FeedMetaDataNullable } from './feed-edit.service'

describe('FeedMetaDataComponent', () => {
  @Component({
    selector: 'test-feed-meta-data-host',
    template: `
      <app-feed-configuration #target [feedMetaData]="feedMetaData"></app-feed-configuration>
      `,
  })
  class TestFeedMetaDataHostComponent {
    feedMetaData: FeedMetaData
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
    let observedMetaData: FeedMetaData = null
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

    tick(250)

    expect(observedFormValue.title).toEqual('Test')
    expect(observedMetaData).toBeFalsy()

    tick(300)

    expect(observedFormValue).toBeTruthy()
    expect(observedMetaData.title).toEqual('Test')
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
      itemPrimaryProperty: 'prop1'
    }
    fixture.detectChanges()

    const expectedFormValue: FeedMetaDataNullable = {
      title: 'Test',
      summary: null,
      icon: null,
      itemPrimaryProperty: 'prop1',
      itemSecondaryProperty: null,
      itemTemporalProperty: null,
      itemsHaveIdentity: null,
      itemsHaveSpatialDimension: null
    }
    expect(target.feedMetaDataForm.value).toEqual(expectedFormValue)
    expect(target.feedMetaData).toEqual({
      title: 'Test',
      itemPrimaryProperty: 'prop1'
    })

    await fixture.whenStable()
  })

  xit('correctly maps undefined values of meta-data keys', () => {
    fail('todo')
  })
});
