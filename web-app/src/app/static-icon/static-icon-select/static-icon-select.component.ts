import { Component, Input, OnInit } from '@angular/core';
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

  icons: StaticIconSelectItem[] = []

  private allIcons: StaticIconSelectItem[] | null = null

  constructor(
    private iconService: StaticIconService
  ) { }

  ngOnInit() {
    this.iconService.fetchIcons().subscribe()
  }

}
