import { CollectionViewer, DataSource } from '@angular/cdk/collections'
import { FixedSizeVirtualScrollStrategy } from '@angular/cdk/scrolling'
import { Component, Input, OnInit } from '@angular/core'
import { VirtualScrollerModule } from 'ngx-virtual-scroller'
import { BehaviorSubject, Observable, Subscription } from 'rxjs'
import { PagingDataSource } from '../../paging.cdk-data-source.adapter'
import { pageForItemIndex, PagingParameters } from '../../paging.model'
import { StaticIcon } from '../static-icon.model'
import { StaticIconService } from '../static-icon.service'

export interface StaticIconSelectItem {
  id: string
  path: string
  title: string
  fileName: string
}

@Component({
  selector: 'static-icon-select',
  templateUrl: './static-icon-select.component.html',
  styleUrls: ['./static-icon-select.component.scss']
})
export class StaticIconSelectComponent implements OnInit {

  icons: StaticIcon[] | null = null
  dataSource: PagingDataSource<StaticIcon>

  constructor(
    private iconService: StaticIconService
  ) {
    this.dataSource = new PagingDataSource<StaticIcon>(250, (paging: PagingParameters) => {
      return this.iconService.fetchIcons(paging)
    })
  }

  ngOnInit() {
    this.iconService.fetchIcons().subscribe(x => {
      this.icons = x.items
    })
  }

  onBrowseForUploadIcon() {
    throw new Error('unimplemented')
  }
}

