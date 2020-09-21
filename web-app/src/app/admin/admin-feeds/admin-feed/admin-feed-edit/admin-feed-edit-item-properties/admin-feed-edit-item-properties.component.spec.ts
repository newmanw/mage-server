import { JsonSchemaFormModule } from '@ajsf/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule, MatDividerModule, MatExpansionModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AdminFeedEditItemPropertiesComponent } from './admin-feed-edit-item-properties.component';
import { JsonSchemaModule } from 'src/app/json-schema/json-schema.module';
import { JsonSchemaComponent } from 'src/app/json-schema/json-schema.component';

describe('FeedItemPropertiesConfigurationComponent', () => {
  let component: AdminFeedEditItemPropertiesComponent;
  let fixture: ComponentFixture<AdminFeedEditItemPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        MatDividerModule,
        MatCardModule,
        JsonSchemaFormModule,
        JsonSchemaModule,
        NoopAnimationsModule
      ],
      declarations: [
        JsonSchemaComponent,
        AdminFeedEditItemPropertiesComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFeedEditItemPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
