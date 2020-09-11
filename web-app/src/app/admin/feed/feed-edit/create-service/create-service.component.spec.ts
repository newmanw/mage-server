import { JsonSchemaFormModule } from '@ajsf/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule, MatFormFieldModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { JsonSchemaComponent } from '../../json-schema/json-schema.component';
import { CreateServiceComponent } from './create-service.component';


describe('CreateServiceComponent', () => {
  let component: CreateServiceComponent;
  let fixture: ComponentFixture<CreateServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        MatFormFieldModule,
        FormsModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        ReactiveFormsModule,
        JsonSchemaFormModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      declarations: [
        CreateServiceComponent,
        JsonSchemaComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateServiceComponent);
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
