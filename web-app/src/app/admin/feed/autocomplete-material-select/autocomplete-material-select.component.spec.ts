import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AutocompleteMaterialSelectComponent } from './autocomplete-material-select.component';


describe('AutocompleteMaterialSelectComponent', () => {
  let component: AutocompleteMaterialSelectComponent;
  let fixture: ComponentFixture<AutocompleteMaterialSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatIconModule,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        NoopAnimationsModule
      ],
      declarations: [ AutocompleteMaterialSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutocompleteMaterialSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
