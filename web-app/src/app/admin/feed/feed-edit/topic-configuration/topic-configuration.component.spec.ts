import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicConfigurationComponent } from './topic-configuration.component';

describe('TopicConfigurationComponent', () => {
  let component: TopicConfigurationComponent;
  let fixture: ComponentFixture<TopicConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopicConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
