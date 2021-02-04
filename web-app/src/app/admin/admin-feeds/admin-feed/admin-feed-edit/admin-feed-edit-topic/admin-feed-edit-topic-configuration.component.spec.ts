import { JsonSchemaFormModule } from '@ajsf/core';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Feed, FeedTopic } from '../../../../../feed/feed.model';
import { JsonSchemaModule } from '../../../../../json-schema/json-schema.module';
import { AdminFeedEditTopicConfigurationComponent } from './admin-feed-edit-topic-configuration.component';

describe('TopicConfigurationComponent', () => {

  @Component({
    selector: 'app-host-component',
    template: `<app-topic-configuration
                [expanded]="expanded"
                [showPrevious]="showPrevious"
                [fetchParametersSchema]="fetchParametersSchema"
                [initialFetchParameters]="initialFetchParameters">
              </app-topic-configuration>`
  })
  class TestHostComponent {
    expanded: boolean;
    showPrevious: boolean;
    fetchParametersSchema = { properties: { derp: { type: 'number' } } }
    initialFetchParameters = { derp: 100 }

    @ViewChild(AdminFeedEditTopicConfigurationComponent, { static: true })
    public topicConfigurationComponent: AdminFeedEditTopicConfigurationComponent;
  }

  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let component: AdminFeedEditTopicConfigurationComponent;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        JsonSchemaFormModule,
        JsonSchemaModule,
        NoopAnimationsModule
      ],
      declarations: [
        TestHostComponent,
        AdminFeedEditTopicConfigurationComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = hostComponent.topicConfigurationComponent;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create but not show the previous button', () => {
    hostComponent.showPrevious = false;
    fixture.detectChanges();
    expect(element.querySelectorAll('button').length).toEqual(1);

    element.querySelectorAll('button').forEach(button => {
      expect(button.innerText).not.toEqual('Previous');
    });
  });

  it('should create but and show the previous button', () => {
    hostComponent.showPrevious = true;
    fixture.detectChanges();
    expect(element.querySelectorAll('button').length).toEqual(2);
  });

  it('should show no buttons if a feed exists', () => {
    // hostComponent.feed = {
    //   id: 'feedId',
    //   title: 'feed title',
    //   updateFrequencySeconds: 1,
    //   service: {
    //     id: 'serviceId',
    //     title: 'title',
    //     summary: 'summary',
    //     serviceType: 'serviceType',
    //     config: {}
    //   },
    //   topic: {
    //     id: 'topicId',
    //     title: 'topic'
    //   }
    // };
    fixture.detectChanges();
    expect(element.querySelector('mat-action-row')).toBeNull();
    expect(element.querySelectorAll('button').length).toEqual(0);
  });

  it('should emit topicConfigurationChanged', () => {
    spyOn(component.fetchParametersChanged, 'emit');

    // hostComponent.topic = {
    //   id: 'topicId',
    //   title: 'Topic Title',
    //   paramsSchema: {
    //     type: 'object',
    //     properties: {
    //       newerThanDays: {
    //         type: 'number',
    //         default: 56
    //       }
    //     }
    //   }
    // };
    fixture.detectChanges();
    expect(component.fetchParametersChanged.emit).toHaveBeenCalledWith({newerThanDays: 56});
    expect(component.initialFetchParameters).toEqual({newerThanDays: 56});
  });

  it('should emit topicConfigured', () => {
    spyOn(component.fetchParametersAccepted, 'emit');
    spyOn(component.fetchParametersChanged, 'emit');

    // hostComponent.topic = {
    //   id: 'topicId',
    //   title: 'Topic Title',
    //   paramsSchema: {
    //     type: 'object',
    //     properties: {
    //       newerThanDays: {
    //         type: 'number',
    //         default: 56
    //       }
    //     }
    //   }
    // };
    fixture.detectChanges();
    component.finish();
    expect(component.fetchParametersChanged.emit).toHaveBeenCalledWith({newerThanDays: 56});
    expect(component.fetchParametersAccepted.emit).toHaveBeenCalledWith({newerThanDays: 56});
    expect(component.initialFetchParameters).toEqual({newerThanDays: 56});
  });

  it('should emit not topicConfigured and should emit cancelled', () => {
    spyOn(component.fetchParametersAccepted, 'emit');
    spyOn(component.fetchParametersChanged, 'emit');
    spyOn(component.cancelled, 'emit');

    // hostComponent.topic = {
    //   id: 'topicId',
    //   title: 'Topic Title',
    //   paramsSchema: {
    //     type: 'object',
    //     properties: {
    //       newerThanDays: {
    //         type: 'number',
    //         default: 56
    //       }
    //     }
    //   }
    // };
    fixture.detectChanges();
    component.cancel();
    expect(component.fetchParametersChanged.emit).toHaveBeenCalledWith({newerThanDays: 56});
    expect(component.fetchParametersAccepted.emit).not.toHaveBeenCalled();
    expect(component.cancelled.emit).toHaveBeenCalled();
    expect(component.initialFetchParameters).toEqual({newerThanDays: 56});
  });
});
