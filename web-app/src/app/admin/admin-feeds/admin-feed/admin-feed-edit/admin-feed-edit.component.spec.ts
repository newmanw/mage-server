import { JsonSchemaFormModule } from '@ajsf/core';
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatCardModule, MatCheckboxModule, MatDividerModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StateService } from '@uirouter/angular';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BehaviorSubject, of } from 'rxjs'
import { AdminBreadcrumbModule } from 'src/app/admin/admin-breadcrumb/admin-breadcrumb.module';
import { MageCommonModule } from 'src/app/common/mage-common.module'
import { FeedItemSummaryComponent } from 'src/app/feed/feed-item/feed-item-summary/feed-item-summary.component';
import { ServiceType } from 'src/app/feed/feed.model'
import { FeedService } from 'src/app/feed/feed.service'
import { JsonSchemaWidgetAutocompleteComponent } from 'src/app/json-schema/json-schema-widget/json-schema-widget-autocomplete.component';
import { JsonSchemaModule } from 'src/app/json-schema/json-schema.module';
import { MomentModule } from 'src/app/moment/moment.module';
import { StaticIconModule } from 'src/app/static-icon/static-icon.module'
import { AdminServiceEditComponent } from '../../admin-service/admin-service-edit/admin-service-edit.component';
import { AdminFeedEditConfigurationComponent } from './admin-feed-edit-configuration.component';
import { AdminFeedEditItemPropertiesComponent } from './admin-feed-edit-item-properties/admin-feed-edit-item-properties.component';
import { AdminFeedEditTopicConfigurationComponent } from './admin-feed-edit-topic/admin-feed-edit-topic-configuration.component';
import { AdminFeedEditTopicComponent } from './admin-feed-edit-topic/admin-feed-edit-topic.component';
import { AdminFeedEditComponent } from './admin-feed-edit.component';
import { FeedEditState, freshEditState } from './feed-edit.model'
import { FeedEditService } from './feed-edit.service'

class MockStateService {
  get params(): any {
    return {};
  }
}

type MockFeedEditService = Partial<jasmine.SpyObj<FeedEditService>> & {
  state$: BehaviorSubject<FeedEditState>
}

describe('FeedEditComponent', () => {

  let component: AdminFeedEditComponent;
  let fixture: ComponentFixture<AdminFeedEditComponent>
  let mockEditService: MockFeedEditService
  let mockFeedService: jasmine.SpyObj<FeedService>

  beforeEach(async(() => {
    mockEditService = {
      state$: new BehaviorSubject<FeedEditState>(freshEditState()),
      newFeed: jasmine.createSpy<FeedEditService['newFeed']>(),
      editFeed: jasmine.createSpy<FeedEditService['editFeed']>(),
      get currentState() {
        return this.state$.value
      }
    }
    mockFeedService = jasmine.createSpyObj<FeedService>('MockFeedService', [
      'fetchServiceTypes',
      'fetchServices',
      'createService'
    ])
    TestBed.configureTestingModule({
      providers: [
        {
          provide: StateService,
          useClass: MockStateService
        },
        {
          provide: FeedService,
          useValue: mockFeedService
        }
      ],
      imports: [
        MatExpansionModule,
        MatDividerModule,
        MatListModule,
        MatFormFieldModule,
        MatCheckboxModule,
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
        NoopAnimationsModule,
        MomentModule,
        MageCommonModule,
        StaticIconModule,
        MatAutocompleteModule,
        AdminBreadcrumbModule,
        HttpClientTestingModule
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
    })
    .overrideComponent(AdminFeedEditComponent, {
      set: {
        providers: [
          { provide: FeedEditService, useValue: mockEditService }
        ]
      }
    })
    .compileComponents();
  }));

  const serviceTypes: ServiceType[] = [
    {
      id: 'type1',
      title: 'Type 1',
      summary: 'Type 1 for testing',
      configSchema: {
        properties: {
          url: { type: 'string' }
        }
      }
    }
  ]

  beforeEach(() => {
    mockFeedService.fetchServiceTypes.and.returnValue(of(serviceTypes))
    mockFeedService.fetchServices.and.returnValue(of([]))
    fixture = TestBed.createComponent(AdminFeedEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.debugElement.nativeElement.remove()
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
