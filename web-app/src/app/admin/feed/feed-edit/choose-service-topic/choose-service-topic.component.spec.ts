import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Service } from 'src/app/feed/feed.model';
import { ChooseServiceTopicComponent } from './choose-service-topic.component';


describe('ChooseServiceTopicComponent', () => {
  @Component({
    selector: 'app-host-component',
    template: '<app-choose-service-topic [defaultService]="defaultService"></app-choose-service-topic>'
  })
  class TestHostComponent {
    defaultService: Service;

    @ViewChild(ChooseServiceTopicComponent, { static: true })
    public chooseServiceTopicComponent: ChooseServiceTopicComponent;
  }

  let httpMock: HttpTestingController;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  // let testElement: HTMLElement;
  let component: ChooseServiceTopicComponent;
  // let fixture: ComponentFixture<ChooseServiceTopicComponent>;
  let element: HTMLElement;

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
        ChooseServiceTopicComponent,
        TestHostComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = hostComponent.chooseServiceTopicComponent;
    element = fixture.nativeElement;
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should create', () => {
    const serviceReq = httpMock.expectOne('/api/feeds/services');
    expect(serviceReq.request.method).toEqual('GET');
    serviceReq.flush([{
      id: 'serviceId',
      serviceType: 'type',
      summary: 'summary',
      title: 'Hello',
      config: {}
    }, {
      id: 'serviceId2',
      serviceType: 'type2',
      summary: 'summary2',
      title: 'Hello2',
      config: {}
    }]);

    expect(component).toBeTruthy();
  });

  it('should set the service if a default is passed in', async(() => {

    const serviceReq = httpMock.expectOne('/api/feeds/services');
    expect(serviceReq.request.method).toEqual('GET');
    serviceReq.flush([{
      id: 'serviceId',
      serviceType: 'type',
      summary: 'summary',
      title: 'Hello',
      config: {}
    }, {
      id: 'serviceId2',
      serviceType: 'type2',
      summary: 'summary2',
      title: 'Hello2',
      config: {}
    }]);

    const service: Service = {
      id: 'serviceId2',
      serviceType: 'type2',
      summary: 'summary2',
      title: 'Hello2',
      config: {}
    };

    hostComponent.defaultService = service;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
    expect(element.querySelector('mat-panel-description').innerHTML).toEqual('Hello2 : ');
    });
  }));
});
