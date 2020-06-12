
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // interface Request {
    // }
  }
}

import express from 'express'
import bodyParser from 'body-parser'
import { UserId } from '../../entities/authn/entities.authn'
import { ListFeedServiceTypes, ListServiceTopics, CreateFeedService, CreateFeedServiceRequest } from '../../app.api/feeds/app.api.feeds'
import { ErrPermissionDenied, MageError, PermissionDeniedError, ErrInvalidInput, invalidInput, ErrEntityNotFound } from '../../app.api/app.api.global.errors'
import { AppRequest } from '../../app.api/app.api.global'
import { AppRequestFactory } from '../adapters.controllers.global'

export interface FeedsAppLayer {
  listServiceTypes: ListFeedServiceTypes
  createService: CreateFeedService
  listTopics: ListServiceTopics
}

export interface AuthenticatedWebRequest extends express.Request {
  userId: UserId
}

export function FeedsRoutes(appLayer: FeedsAppLayer, createAppRequest: AppRequestFactory): express.Router {
  const routes = express.Router()
  routes.use(bodyParser.json())

  function errorHandler(err: PermissionDeniedError | any, req: express.Request, res: express.Response, next: express.NextFunction): any {
    if (!(err instanceof MageError)) {
      return next(err)
    }
    switch (err.code) {
      case ErrPermissionDenied:
        return res.status(403).json(`permission denied: ${(err as PermissionDeniedError).data.permission}`)
      case ErrInvalidInput:
        return res.status(400).json(err.message)
    }
    next(err)
  }

  routes.route('/service_types')
    .get(async (req, res, next): Promise<any> => {
      const appReq = createAppRequest()
      const appRes = await appLayer.listServiceTypes(appReq)
      if (appRes.success) {
        return res.json(appRes.success)
      }
      next(appRes.error)
    })

  routes.route('/services')
    .post(async (req, res, next): Promise<any> => {
      const authReq = req as AuthenticatedWebRequest
      const body = authReq.body
      const appReq = createAppRequest({
        serviceType: body.serviceType,
        config: body.config || null,
        title: body.title,
        summary: body.summary
      })
      if (!appReq.serviceType) {
        return next(invalidInput('missing service type'))
      }
      if (!appReq.title) {
        return next(invalidInput('missing title'))
      }
      const appRes = await appLayer.createService(appReq)
      if (appRes.success) {
        return res.status(201).json(appRes.success)
      }
      if (appRes.error?.code === ErrEntityNotFound) {
        return res.status(400).json('service type not found')
      }
      next(appRes.error)
    })

  routes.route('/services/:serviceId/topics')

  routes.use(errorHandler)

  return routes
}
