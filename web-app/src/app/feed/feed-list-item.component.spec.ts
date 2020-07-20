import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedListItemComponent } from './feed-list-item.component';

describe('FeedListItemComponent', () => {
  let component: FeedListItemComponent;
  let fixture: ComponentFixture<FeedListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
