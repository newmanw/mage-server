import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminServiceDeleteComponent } from './admin-service-delete.component';

describe('AdminServiceDeleteComponent', () => {
  let component: AdminServiceDeleteComponent;
  let fixture: ComponentFixture<AdminServiceDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminServiceDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminServiceDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
