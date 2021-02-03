import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticIconSelectComponent } from './static-icon-select.component';

describe('StaticIconSelectComponent', () => {

  let component: StaticIconSelectComponent;
  let fixture: ComponentFixture<StaticIconSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticIconSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticIconSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
