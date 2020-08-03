import express from 'express'
import { AppRequest } from '../app.api/app.api.global';

export interface WebAppRequestFactory {
  <RequestParams>(webReq: express.Request, params?: RequestParams): AppRequest & RequestParams
}