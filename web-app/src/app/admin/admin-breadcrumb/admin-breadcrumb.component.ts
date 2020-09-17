import { Component, Input } from '@angular/core';
import { Breadcrumb } from './admin-breadcrumb.model';
import { StateService } from '@uirouter/angular';

@Component({
  selector: 'admin-breadcrumb',
  templateUrl: './admin-breadcrumb.component.html',
  styleUrls: ['./admin-breadcrumb.component.scss']
})
export class AdminBreadcrumbComponent {
  @Input() icon: string
  @Input() breadcrumbs: Breadcrumb[]

  constructor(private stateService: StateService) {}

  goToBreadcrumb(breadcrumb: Breadcrumb): void {
    if (breadcrumb.state) {
      this.stateService.go(breadcrumb.state.name, breadcrumb.state.params)
    }
  }
}
