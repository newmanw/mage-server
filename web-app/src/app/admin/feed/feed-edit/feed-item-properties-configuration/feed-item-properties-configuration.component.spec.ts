import { JsonSchemaFormModule } from '@ajsf/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule, MatDividerModule, MatExpansionModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JsonSchemaComponent } from '../../json-schema/json-schema.component';
import { FeedItemPropertiesConfigurationComponent } from './feed-item-properties-configuration.component';


describe('FeedItemPropertiesConfigurationComponent', () => {
  let component: FeedItemPropertiesConfigurationComponent;
  let fixture: ComponentFixture<FeedItemPropertiesConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        MatDividerModule,
        MatCardModule,
        JsonSchemaFormModule,
        NoopAnimationsModule
      ],
      declarations: [
        JsonSchemaComponent,
        FeedItemPropertiesConfigurationComponent
      ]
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
