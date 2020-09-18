import { JsonSchemaFormModule } from '@ajsf/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatCardModule, MatDividerModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatSelectModule } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StateService } from '@uirouter/angular';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FeedItemSummaryComponent } from 'src/app/feed/feed-item/feed-item-summary/feed-item-summary.component';
import { MomentModule } from 'src/app/moment/moment.module';
import { AdminBreadcrumbModule } from '../../admin-breadcrumb/admin-breadcrumb.module';
import { AutocompleteMaterialSelectComponent } from '../autocomplete-material-select/autocomplete-material-select.component';
import { JsonSchemaComponent } from '../json-schema/json-schema.component';
import { ChooseServiceTopicComponent } from './choose-service-topic/choose-service-topic.component';
import { CreateServiceComponent } from './create-service/create-service.component';
import { FeedConfigurationComponent } from './feed-configuration/feed-configuration.component';
import { FeedEditComponent } from './feed-edit.component';
import { FeedItemPropertiesConfigurationComponent } from './feed-item-properties-configuration/feed-item-properties-configuration.component';
import { TopicConfigurationComponent } from './topic-configuration/topic-configuration.component';

class MockStateService {
  get params(): any {
    return {};
  }
}

describe('FeedEditComponent', () => {
  let component: FeedEditComponent;
  let fixture: ComponentFixture<FeedEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: StateService,
        useClass: MockStateService
      }],
      imports: [
        MatExpansionModule,
        MatDividerModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCardModule,
        MatIconModule,
        NgxMatSelectSearchModule,
        FormsModule,
        NgxMatSelectSearchModule,
        ReactiveFormsModule,
        JsonSchemaFormModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MomentModule,
        MatAutocompleteModule,
        AdminBreadcrumbModule
      ],
      declarations: [
        FeedEditComponent,
        CreateServiceComponent,
        ChooseServiceTopicComponent,
        TopicConfigurationComponent,
        FeedConfigurationComponent,
        FeedItemPropertiesConfigurationComponent,
        FeedItemSummaryComponent,
        JsonSchemaComponent,
        AutocompleteMaterialSelectComponent
      ]
    }).overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [AutocompleteMaterialSelectComponent]}})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    inject([HttpTestingController], (httpMock: HttpTestingController) => {
      const serviceReq = httpMock.expectOne('http://.../api/feeds/services');
      expect(serviceReq.request.method).toEqual('GET');
      serviceReq.flush([]);

      const serviceTypesReq = httpMock.expectOne('http://.../api/feeds/serviceTypes');
      expect(serviceTypesReq.request.method).toEqual('GET');
      serviceTypesReq.flush([]);

      const feedsReq = httpMock.expectOne('http://.../api/feeds');
      expect(feedsReq.request.method).toEqual('GET');
      feedsReq.flush([]);
    });
    expect(component).toBeTruthy();
  });
});
