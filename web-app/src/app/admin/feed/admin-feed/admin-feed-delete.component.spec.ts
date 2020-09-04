import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFeedDeleteComponent } from './admin-feed-delete.component';

describe('AdminFeedDeleteComponent', () => {
  let component: AdminFeedDeleteComponent;
  let fixture: ComponentFixture<AdminFeedDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminFeedDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFeedDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
