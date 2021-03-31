import { CollectionViewer, DataSource } from '@angular/cdk/collections'
import { BehaviorSubject, Observable, Subscription } from 'rxjs'


export interface PagingParameters {
  pageSize: number,
  pageIndex: number,
  includeTotalCount?: boolean | null
}

export interface PageOf<T> {
  pageSize: number,
  pageIndex: number,
  totalCount?: number | null,
  next?: PagingParameters | null
  prev?: PagingParameters | null
  items: T[]
}

export const pageForItemIndex = (itemIndex: number, pageSize: number): number => {
  return Math.floor(itemIndex / pageSize)
}
