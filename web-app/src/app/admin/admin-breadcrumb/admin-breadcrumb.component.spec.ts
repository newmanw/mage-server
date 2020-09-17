import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBreadcrumbComponent } from './admin-breadcrumb.component';

describe('AdminBreadcrumbComponent', () => {
  let component: AdminBreadcrumbComponent;
  let fixture: ComponentFixture<AdminBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
