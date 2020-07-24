import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSelectWidgetComponent } from './map-select-widget.component';

describe('MapSelectWidgetComponent', () => {
  let component: MapSelectWidgetComponent;
  let fixture: ComponentFixture<MapSelectWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
