import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalStorageService, MapService } from 'src/app/upgrade/ajs-upgraded-providers';
import { MapClipComponent } from './clip.component';

class MockLocalStorageService {
  getMapPosition(): {center: Array<number>} {
    return {
      center: [0, 0]
    };
  }
}

class MockMapService {
  addListener(listener: any): void {
    
  }

  removeListener(listener: any): void {
    
  }
}

describe('ClipComponent', () => {
  let component: MapClipComponent;
  let fixture: ComponentFixture<MapClipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: LocalStorageService,
        useClass: MockLocalStorageService
      }, {
        provide: MapService,
        useClass: MockMapService
      }],
      declarations: [ MapClipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapClipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
