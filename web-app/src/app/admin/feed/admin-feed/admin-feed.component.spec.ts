import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFeedComponent } from './admin-feed.component';

describe('AdminFeedComponent', () => {
  let component: AdminFeedComponent;
  let fixture: ComponentFixture<AdminFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
