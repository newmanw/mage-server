import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FeedTopic, Service } from 'src/app/feed/feed.model';
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
    component = hostComponent.chooseServiceTopicComponent;
    element = fixture.nativeElement;
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();

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
    spyOn(component, 'serviceSelected');
    fixture.detectChanges();

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
      expect(component.serviceSelected).toHaveBeenCalled();
      expect(component.selectedService.id).toEqual('serviceId2');
    });
  }));

  it('should set the service if a default is set on init', async(() => {
    spyOn(component, 'serviceSelected');
    const service: Service = {
      id: 'serviceId2',
      serviceType: 'type2',
      summary: 'summary2',
      title: 'Hello2',
      config: {}
    };
    hostComponent.defaultService = service;

    fixture.detectChanges();

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

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(element.querySelector('mat-panel-description').innerHTML).toEqual('Hello2 : ');
      expect(component.serviceSelected).toHaveBeenCalled();
      expect(component.selectedService.id).toEqual('serviceId2');
    });
  }));

  it('should set the service if only one exists', async(() => {
    spyOn(component, 'serviceSelected');
    fixture.detectChanges();

    const serviceReq = httpMock.expectOne('/api/feeds/services');
    expect(serviceReq.request.method).toEqual('GET');
    serviceReq.flush([{
      id: 'serviceId',
      serviceType: 'type',
      summary: 'summary',
      title: 'Hello',
      config: {}
    }]);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(element.querySelector('mat-panel-description').innerHTML).toEqual('Hello : ');
      expect(component.serviceSelected).toHaveBeenCalled();
      expect(component.selectedService.id).toEqual('serviceId');
    });
  }));

  it('should emit noServicesExist if none exist', () => {
    spyOn(component.noServicesExist, 'emit');

    fixture.detectChanges();

    const serviceReq = httpMock.expectOne('/api/feeds/services');
    expect(serviceReq.request.method).toEqual('GET');
    serviceReq.flush([]);

    expect(component.noServicesExist.emit).toHaveBeenCalled();
  });

  it('should set the service and topic if only one of each exists', async(() => {
    spyOn(component, 'serviceSelected').and.callThrough();
    fixture.detectChanges();

    const serviceReq = httpMock.expectOne('/api/feeds/services');
    expect(serviceReq.request.method).toEqual('GET');
    serviceReq.flush([{
      id: 'serviceId',
      serviceType: 'type',
      summary: 'summary',
      title: 'Hello',
      config: {}
    }]);

    const topic: FeedTopic = {
      id: 'topicId',
      title: 'Topic'
    };

    const topicReq = httpMock.expectOne('/api/feeds/services/serviceId/topics');
    expect(topicReq.request.method).toEqual('GET');
    topicReq.flush([topic]);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(element.querySelector('mat-panel-description').innerHTML).toEqual('Hello : Topic');
      expect(component.serviceSelected).toHaveBeenCalled();
      expect(component.selectedService.id).toEqual('serviceId');
    });
  }));

  it('should set the service and not set the topic if more than one topic exists', async(() => {
    spyOn(component, 'serviceSelected').and.callThrough();
    fixture.detectChanges();

    const serviceReq = httpMock.expectOne('/api/feeds/services');
    expect(serviceReq.request.method).toEqual('GET');
    serviceReq.flush([{
      id: 'serviceId',
      serviceType: 'type',
      summary: 'summary',
      title: 'Hello',
      config: {}
    }]);

    const topic: FeedTopic = {
      id: 'topicId',
      title: 'Topic'
    };

    const topic2: FeedTopic = {
      id: 'topicId2',
      title: 'Topic2'
    };

    const topicReq = httpMock.expectOne('/api/feeds/services/serviceId/topics');
    expect(topicReq.request.method).toEqual('GET');
    topicReq.flush([topic, topic2]);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(element.querySelector('mat-panel-description').innerHTML).toEqual('Hello : ');
      expect(component.serviceSelected).toHaveBeenCalled();
      expect(component.selectedService.id).toEqual('serviceId');
    });
  }));

  it('should emit serviceAndTopicSelected', () => {
    spyOn(component.serviceAndTopicSelected, 'emit');
    fixture.detectChanges();

    const service: Service = {
      id: 'serviceId',
      serviceType: 'type',
      summary: 'summary',
      title: 'Hello',
      config: {}
    };

    const serviceReq = httpMock.expectOne('/api/feeds/services');
    expect(serviceReq.request.method).toEqual('GET');
    serviceReq.flush([service, {
      id: 'serviceId2',
      serviceType: 'type2',
      summary: 'summary2',
      title: 'Hello2',
      config: {}
    }]);


    const topic: FeedTopic = {
      id: 'topicId',
      title: 'Topic'
    };

    component.selectedService = service;
    component.selectedTopic = topic;

    component.next();
    expect(component.serviceAndTopicSelected.emit).toHaveBeenCalled();
  });

  it('should not fetch topics if a service is not selected', async(() => {
    spyOn(component.serviceAndTopicSelected, 'emit');
    fixture.detectChanges();

    const service = {
      id: 'serviceId',
      serviceType: 'type',
      summary: 'summary',
      title: 'Hello',
      config: {}
    };

    const serviceReq = httpMock.expectOne('/api/feeds/services');
    expect(serviceReq.request.method).toEqual('GET');
    serviceReq.flush([service, {
      id: 'serviceId2',
      serviceType: 'type2',
      summary: 'summary2',
      title: 'Hello2',
      config: {}
    }]);

    httpMock.expectNone('/api/feeds/services/serviceId/topics');

    fixture.whenStable().then(() => {
      component.serviceSelected();
      httpMock.verify();
    });
  }));
});
