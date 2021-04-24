import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticIconImgComponent } from './static-icon-img.component';

describe('StaticIconImgComponent', () => {
  let component: StaticIconImgComponent;
  let fixture: ComponentFixture<StaticIconImgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticIconImgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticIconImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
