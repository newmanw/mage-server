import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MapSelectWidgetComponent } from './map-select-widget.component';


describe('MapSelectWidgetComponent', () => {
  let component: MapSelectWidgetComponent;
  let fixture: ComponentFixture<MapSelectWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        FormsModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatInputModule,
        NoopAnimationsModule
      ],
      declarations: [ MapSelectWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapSelectWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
