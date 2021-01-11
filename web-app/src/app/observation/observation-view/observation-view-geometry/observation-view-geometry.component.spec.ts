import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationViewGeometryComponent } from './observation-view-geometry.component';

describe('ObservationViewGeometryComponent', () => {
  let component: ObservationViewGeometryComponent;
  let fixture: ComponentFixture<ObservationViewGeometryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObservationViewGeometryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationViewGeometryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
