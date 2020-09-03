import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseServiceTopicComponent } from './choose-service-topic.component';

describe('ChooseServiceTopicComponent', () => {
  let component: ChooseServiceTopicComponent;
  let fixture: ComponentFixture<ChooseServiceTopicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseServiceTopicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseServiceTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
