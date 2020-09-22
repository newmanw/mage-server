import { JsonSchemaFormModule } from '@ajsf/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatCardModule, MatDividerModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatSelectModule } from '@angular/material';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StateService } from '@uirouter/angular';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AdminBreadcrumbModule } from 'src/app/admin/admin-breadcrumb/admin-breadcrumb.module';
import { FeedItemSummaryComponent } from 'src/app/feed/feed-item/feed-item-summary/feed-item-summary.component';
import { JsonSchemaWidgetAutocompleteComponent } from 'src/app/json-schema/json-schema-widget/json-schema-widget-autocomplete.component';
import { JsonSchemaModule } from 'src/app/json-schema/json-schema.module';
import { MomentModule } from 'src/app/moment/moment.module';
import { AdminServiceEditComponent } from '../../admin-service/admin-service-edit/admin-service-edit.component';
import { AdminFeedEditConfigurationComponent } from './admin-feed-edit-configuration.component';
import { AdminFeedEditItemPropertiesComponent } from './admin-feed-edit-item-properties/admin-feed-edit-item-properties.component';
import { AdminFeedEditTopicConfigurationComponent } from './admin-feed-edit-topic/admin-feed-edit-topic-configuration.component';
import { AdminFeedEditTopicComponent } from './admin-feed-edit-topic/admin-feed-edit-topic.component';
import { AdminFeedEditComponent } from './admin-feed-edit.component';

class MockStateService {
  get params(): any {
    return {};
  }
}

describe('FeedEditComponent', () => {
  let component: AdminFeedEditComponent;
  let fixture: ComponentFixture<AdminFeedEditComponent>;

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
        JsonSchemaModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MomentModule,
        MatAutocompleteModule,
        AdminBreadcrumbModule
      ],
      declarations: [
        AdminFeedEditComponent,
        AdminServiceEditComponent,
        AdminFeedEditTopicComponent,
        AdminFeedEditTopicConfigurationComponent,
        AdminFeedEditConfigurationComponent,
        AdminFeedEditItemPropertiesComponent,
        FeedItemSummaryComponent,
        JsonSchemaWidgetAutocompleteComponent
      ]
    }).overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [JsonSchemaWidgetAutocompleteComponent]}})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFeedEditComponent);
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
