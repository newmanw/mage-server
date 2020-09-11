import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { StateService } from '@uirouter/angular';
import { UserService } from 'src/app/upgrade/ajs-upgraded-providers';
import { FeedsComponent } from './feeds.component';

class MockUserService {
  get myself(): any {
    return {
      role: {
        permissions: []
      }
    };
  }
}

describe('FeedsComponent', () => {
  let component: FeedsComponent;
  let fixture: ComponentFixture<FeedsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: StateService
      }, {
        provide: UserService,
        useClass: MockUserService
      }, {
        provide: MatDialogRef, useValue: {}
      }, {
        provide: MAT_DIALOG_DATA, useValue: {}
      }],
      imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      declarations: [ FeedsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    inject([HttpTestingController], (httpMock: HttpTestingController) => {
      const serviceReq = httpMock.expectOne('http://.../api/feeds/services');
      expect(serviceReq.request.method).toEqual('GET');
      serviceReq.flush([]);

      const serviceTypesReq = httpMock.expectOne('http://.../api/feeds/serviceTypes');
      expect(serviceTypesReq.request.method).toEqual('GET');
      serviceTypesReq.flush([]);

      const feedsReq = httpMock.expectOne('http://.../api/feeds');
      expect(feedsReq.request.method).toEqual('GET');
      feedsReq.flush([]);
    });
    expect(component).toBeTruthy();
  });
});
