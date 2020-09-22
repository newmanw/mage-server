import { JsonSchemaFormModule } from '@ajsf/core';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatCardModule,
  MatDividerModule,
  MatExpansionModule
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FeedTopic } from 'src/app/feed/feed.model';
import { JsonSchemaModule } from 'src/app/json-schema/json-schema.module';
import { AdminFeedEditItemPropertiesComponent } from './admin-feed-edit-item-properties.component';

describe('FeedItemPropertiesConfigurationComponent', () => {
  @Component({
    selector: 'app-host-component',
    template: `
      <app-feed-item-properties-configuration
        [topic]="topic"
        [expanded]="expanded"
        [itemPropertiesSchema]="itemPropertiesSchema"
      >
      </app-feed-item-properties-configuration>
    `
  })
  class TestHostComponent {
    topic: FeedTopic;
    expanded: boolean;
    itemPropertiesSchema: any;

    @ViewChild(AdminFeedEditItemPropertiesComponent, { static: true })
    public feedItemPropertiesConfigurationComponent: AdminFeedEditItemPropertiesComponent;
  }

  let hostComponent: TestHostComponent;
  let component: AdminFeedEditItemPropertiesComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;

  const feedItemPropertiesSchema = {
    type: 'object',
    properties: {
      newProperty: {
        title: 'New Property',
        type: 'string'
      },
      date: {
        title: 'Date It Happened',
        type: 'string',
        format: 'date',
        pattern: 'dddd-dd-dd'
      },
      reference: { title: 'Reference Number', type: 'string' },
      subreg: { title: 'Geographical Subregion', type: 'number' },
      description: { title: 'Description', type: 'string' },
      hostilityVictim: { title: 'Aggressor-Victim', type: 'string' },
      hostility: { title: 'Agressor', type: 'string' },
      victim: { title: 'Victim', type: 'string' },
      navArea: { title: 'Navigation Area', type: 'string' },
      position: {
        title: 'Position',
        type: 'string',
        format: 'latlondeg'
      },
      timestamp: {
        title: 'Date Of Occurrence',
        type: 'number',
        format: 'date'
      }
    }
  };

  const topicItemPropertiesSchema = {
    type: 'object',
    properties: {
      date: {
        title: 'Date Of Occurrence',
        type: 'string',
        format: 'date',
        pattern: 'dddd-dd-dd'
      },
      reference: { title: 'Reference Number', type: 'string' },
      subreg: { title: 'Geographical Subregion', type: 'number' },
      description: { title: 'Description', type: 'string' },
      hostilityVictim: { title: 'Aggressor-Victim', type: 'string' },
      hostility: { title: 'Agressor', type: 'string' },
      victim: { title: 'Victim', type: 'string' },
      navArea: { title: 'Navigation Area', type: 'string' },
      position: {
        title: 'Position',
        type: 'string',
        format: 'latlondeg'
      },
      timestamp: {
        title: 'Date Of Occurrence',
        type: 'number',
        format: 'date'
      }
    }
  };

  const service = {
    serviceType: '5f2873266119c2e49d0348af',
    title: 'NGA MSI',
    summary: 'NGA Maritime Safety Information service',
    config: 'https://msi.gs.mil/',
    id: '5f355e6e03e1e98f081f9f4e'
  };

  const topic = {
    id: 'asam',
    title: 'ASAMs',
    summary: 'summary',
    paramsSchema: {
      type: 'object',
      properties: {
        newerThanDays: {
          type: 'number',
          default: 56
        }
      }
    },
    itemsHaveIdentity: true,
    itemsHaveSpatialDimension: true,
    itemPrimaryProperty: 'description',
    itemSecondaryProperty: 'hostilityVictim',
    itemTemporalProperty: 'timestamp',
    updateFrequencySeconds: 915,
    mapStyle: {
      iconUrl: 'https://mage-msi.geointservices.io/icons/asam.png'
    },
    itemPropertiesSchema: topicItemPropertiesSchema
  };

  const feed = {
    service,
    topic,
    title: 'ASAMsasdfasdf',
    summary:
      'Anti-Shipping Acitivty Messages (ASAMs) include the locations and descriptive accounts of specific hostile acts against ships and mariners and may be useful for recognition, prevention and avoidance of potential hostile activity.',
    itemPropertiesSchema: feedItemPropertiesSchema,
    constantParams: { newerThanDays: 56 },
    itemsHaveIdentity: true,
    itemsHaveSpatialDimension: true,
    itemPrimaryProperty: 'hostilityVictim',
    itemSecondaryProperty: 'navArea',
    itemTemporalProperty: 'timestamp',
    updateFrequencySeconds: 915,
    mapStyle: {
      iconUrl: 'https://mage-msi.geointservices.io/icons/asam.png'
    },
    id: '127wk7mrkelrqg49'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatExpansionModule,
        MatDividerModule,
        MatCardModule,
        JsonSchemaFormModule,
        JsonSchemaModule,
        NoopAnimationsModule
      ],
      declarations: [
        TestHostComponent,
        AdminFeedEditItemPropertiesComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = hostComponent.feedItemPropertiesConfigurationComponent;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should populate with the topic itemPropertiesSchema', () => {
    fixture.detectChanges();

    hostComponent.topic = topic;
    fixture.detectChanges();
    console.log('component item properties', component.itemProperties);
    expect(component.itemProperties.length).toEqual(Object.keys(topic.itemPropertiesSchema.properties).length);
  });

  it('should populate with the itemPropertiesSchema', () => {
    fixture.detectChanges();
    hostComponent.itemPropertiesSchema = feedItemPropertiesSchema;
    fixture.detectChanges();
    expect(component.itemProperties.length).toEqual(Object.keys(feedItemPropertiesSchema.properties).length);
  });

  it('should populate with the itemPropertiesSchema even if topic is passed in', () => {
    fixture.detectChanges();
    hostComponent.topic = topic;
    hostComponent.itemPropertiesSchema = feedItemPropertiesSchema;
    fixture.detectChanges();
    expect(component.itemProperties.length).toEqual(Object.keys(feedItemPropertiesSchema.properties).length);
  });
});
