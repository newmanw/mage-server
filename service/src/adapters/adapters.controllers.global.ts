import { AppRequest } from '../app.api/app.api.global';

export interface AppRequestFactory {
  <RequestParams>(params?: RequestParams): AppRequest & RequestParams
}