import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedItemMapPopupComponent } from './feed-item-map-popup.component';

describe('ItemMapPopupComponent', () => {
  let component: FeedItemMapPopupComponent;
  let fixture: ComponentFixture<FeedItemMapPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeedItemMapPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedItemMapPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
