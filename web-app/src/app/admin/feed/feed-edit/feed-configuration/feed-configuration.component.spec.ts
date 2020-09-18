import { JsonSchemaFormModule } from '@ajsf/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JsonSchemaComponent } from '../../json-schema/json-schema.component';
import { FeedConfigurationComponent } from './feed-configuration.component';


describe('FeedConfigurationComponent', () => {
  let component: FeedConfigurationComponent;
  let fixture: ComponentFixture<FeedConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        JsonSchemaFormModule,
        NoopAnimationsModule
      ],
      declarations: [
        JsonSchemaComponent,
        FeedConfigurationComponent
      ]
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
