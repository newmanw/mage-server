import _ from 'underscore';
import { Component, OnInit, Inject } from '@angular/core';
import { FeedService } from 'src/app/feed/feed.service';
import { StateService } from '@uirouter/angular';
import { Service, ServiceType, Feed } from 'src/app/feed/feed.model';
import { UserService } from 'src/app/upgrade/ajs-upgraded-providers';
import { MatDialog } from '@angular/material';
import { AdminServiceDeleteComponent } from '../feed/admin-feed/admin-service-delete.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-service',
  templateUrl: './admin-service.component.html',
  styleUrls: ['./admin-service.component.scss']
})
export class AdminServiceComponent implements OnInit {

  serviceLoaded: Promise<boolean>
  service: Service
  serviceType: ServiceType

  feeds: Feed[] = []
  feedPage = 0
  itemsPerPage = 5

  hasServiceEditPermission: boolean
  hasServiceDeletePermission: boolean

  configOptions = {
    addSubmit: false,
    defautWidgetOptions: {
      readonly: true,
    }
  }

  constructor(
    private feedService: FeedService, 
    private stateService: StateService,
    public dialog: MatDialog,
    @Inject(UserService) userService: { myself: { id: string, role: { permissions: Array<string> } } }) { 
    this.hasServiceEditPermission = _.contains(userService.myself.role.permissions, 'UPDATE_LAYER')
    this.hasServiceDeletePermission = _.contains(userService.myself.role.permissions, 'DELETE_LAYER')
  }

  ngOnInit(): void {
    forkJoin(
      this.feedService.fetchService(this.stateService.params.serviceId),
      this.feedService.fetchServiceFeeds(this.stateService.params.serviceId)
    ).subscribe(result => {
      this.service = result[0]
      this.feeds = result[1]

      const serviceType: ServiceType = this.service.serviceType as ServiceType
      this.feedService.fetchServiceType(serviceType.id).subscribe(serviceType => {
        this.serviceType = serviceType;
        this.serviceLoaded = Promise.resolve(true)
      });
    })
  }

  goToFeeds(): void {
    this.stateService.go('admin.feeds')
  }

  goToFeed(feed: Feed): void {
    this.stateService.go('admin.feed', { feedId: feed.id })
  }

  editService(): void {
    this.stateService.go('admin.serviceEdit')
  }

  deleteService(): void {
    this.dialog.open(AdminServiceDeleteComponent, {
      data: {
        service: this.service,
        feeds: this.feeds
      },
      autoFocus: false,
      disableClose: true
    }).afterClosed().subscribe(result => {
      if (result === true) {
        this.feedService.deleteService(this.service).subscribe(() => {
          this.goToFeeds()
        });
      }
    });
  }
}
