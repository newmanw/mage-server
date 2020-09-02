import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ViewChild, ViewContainerRef } from '@angular/core';
import { FeedService } from 'src/app/feed/feed.service';
import { ServiceType, Service } from 'src/app/feed/feed.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss']
})
export class CreateServiceComponent implements OnInit, OnChanges {

  @Input() expanded: boolean;
  @Output() serviceCreated = new EventEmitter<Service>();
  @Output() cancelled = new EventEmitter();
  @Output() opened = new EventEmitter();
  @ViewChild('template', {static: true}) template;

  serviceTitleSummarySchema: any;
  serviceConfiguration: any;
  serviceTitleSummary: any;
  serviceConfigurationSchema: any;
  selectedServiceType: ServiceType;
  serviceFormReady = false;
  formOptions: any;
  searchControl: FormControl = new FormControl();
  serviceTypes: Array<ServiceType>;
  services: Array<Service>;

  constructor(
    private feedService: FeedService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.formOptions = {
      addSubmit: false
    };
  }

  ngOnInit(): void {
    this.viewContainerRef.createEmbeddedView(this.template);

    this.feedService.fetchServiceTypes().subscribe(serviceTypes => {
      this.serviceTypes = serviceTypes;
    });

    this.feedService.fetchServices().subscribe(services => {
      this.services = services;

    });
  }

  ngOnChanges(): void {

  }

  createService(): void {
    this.serviceTitleSummary.config = this.serviceConfiguration;
    this.serviceTitleSummary.serviceType = this.selectedServiceType.id;
    this.feedService.createService(this.serviceTitleSummary).subscribe(service => {
      this.serviceCreated.emit(service);
    });
  }

  serviceTypeSelected(): void {
    this.serviceTitleSummarySchema = {
      title: {
        type: 'string',
        title: 'Service Title',
        default: this.selectedServiceType.title
      },
      summary: {
        type: 'string',
        title: 'Summary',
        default: this.selectedServiceType.summary
      }
    };
    this.serviceConfigurationSchema = { ...this.selectedServiceType.configSchema };
    this.serviceFormReady = true;
  }

  serviceTitleSummaryChanged($event: any): void {
    this.serviceTitleSummary = $event;
  }

  serviceConfigurationChanged($event: any): void {
    this.serviceConfiguration = $event;
  }

  cancel(): void {
    this.cancelled.emit();
  }

}
