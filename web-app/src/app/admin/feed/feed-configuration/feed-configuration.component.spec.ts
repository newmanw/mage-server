import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedConfigurationComponent } from './feed-configuration.component';

describe('FeedConfigurationComponent', () => {
  let component: FeedConfigurationComponent;
  let fixture: ComponentFixture<FeedConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
