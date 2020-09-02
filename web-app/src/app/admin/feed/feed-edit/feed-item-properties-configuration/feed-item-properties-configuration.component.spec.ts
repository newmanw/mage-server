import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedItemPropertiesConfigurationComponent } from './feed-item-properties-configuration.component';

describe('FeedItemPropertiesConfigurationComponent', () => {
  let component: FeedItemPropertiesConfigurationComponent;
  let fixture: ComponentFixture<FeedItemPropertiesConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedItemPropertiesConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedItemPropertiesConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
