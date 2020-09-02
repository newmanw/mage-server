import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompleteMaterialSelectComponent } from './autocomplete-material-select.component';

describe('AutocompleteMaterialSelectComponent', () => {
  let component: AutocompleteMaterialSelectComponent;
  let fixture: ComponentFixture<AutocompleteMaterialSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
