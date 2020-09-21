import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JsonSchemaWidgetAutocompleteComponent } from './json-schema-widget-autocomplete.component';
import { JsonSchemaModule } from '../json-schema.module';


describe('AutocompleteMaterialSelectComponent', () => {
  let component: JsonSchemaWidgetAutocompleteComponent;
  let fixture: ComponentFixture<JsonSchemaWidgetAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatIconModule,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        JsonSchemaModule,
        NoopAnimationsModule
      ],
      declarations: [JsonSchemaWidgetAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonSchemaWidgetAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
