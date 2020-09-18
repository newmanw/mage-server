import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material';
import { RawParams, StateOrName, StateService, TransitionOptions, TransitionPromise } from '@uirouter/angular';
import { AdminBreadcrumbComponent } from './admin-breadcrumb.component';

class MockStateService {
  go(to: StateOrName, params?: RawParams, options?: TransitionOptions): TransitionPromise {
    
  }
}

describe('AdminBreadcrumbComponent', () => {
  let component: AdminBreadcrumbComponent;
  let fixture: ComponentFixture<AdminBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: StateService,
        useClass: MockStateService
      }],
      imports: [
        MatIconModule
      ],
      declarations: [ AdminBreadcrumbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
