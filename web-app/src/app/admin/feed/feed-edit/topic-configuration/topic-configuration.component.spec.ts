import { JsonSchemaFormModule } from '@ajsf/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JsonSchemaComponent } from '../../json-schema/json-schema.component';
import { TopicConfigurationComponent } from './topic-configuration.component';


describe('TopicConfigurationComponent', () => {
  let component: TopicConfigurationComponent;
  let fixture: ComponentFixture<TopicConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        JsonSchemaFormModule,
        NoopAnimationsModule
      ],
      declarations: [
        TopicConfigurationComponent,
        JsonSchemaComponent
      ]
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
