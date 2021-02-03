import { JsonSchemaFormModule } from '@ajsf/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JsonSchemaComponent } from '../../../../json-schema/json-schema.component';
import { AdminFeedEditConfigurationComponent } from './admin-feed-edit-configuration.component';

fdescribe('FeedMetaDataComponent', () => {

  let component: AdminFeedEditConfigurationComponent;
  let fixture: ComponentFixture<AdminFeedEditConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        JsonSchemaFormModule,
        NoopAnimationsModule
      ],
      declarations: [
        JsonSchemaComponent,
        AdminFeedEditConfigurationComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFeedEditConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
