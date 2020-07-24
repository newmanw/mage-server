import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedTabComponent } from './tab.component';

describe('IconComponent', () => {
  let component: FeedTabComponent;
  let fixture: ComponentFixture<FeedTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeedTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
