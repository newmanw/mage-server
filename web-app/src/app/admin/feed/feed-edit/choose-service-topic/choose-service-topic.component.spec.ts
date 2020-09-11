import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ChooseServiceTopicComponent } from './choose-service-topic.component';


describe('ChooseServiceTopicComponent', () => {
  let component: ChooseServiceTopicComponent;
  let fixture: ComponentFixture<ChooseServiceTopicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        MatSelectModule,
        FormsModule,
        NgxMatSelectSearchModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      declarations: [
        ChooseServiceTopicComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseServiceTopicComponent);
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
