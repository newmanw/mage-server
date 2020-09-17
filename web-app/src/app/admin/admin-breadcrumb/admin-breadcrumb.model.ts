import { RawParams, StateOrName } from '@uirouter/angular';

export interface Breadcrumb {
  title: string
  icon?: string
  state?: BreadcrumbState
}

export interface BreadcrumbState {
  name: StateOrName,
  params?: RawParams
}