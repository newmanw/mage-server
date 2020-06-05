
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // interface Request {
    // }
  }
}

import { FeedTopic, FeedService } from '../../entities/feeds/entities.feeds'
import express, { Request, Response, NextFunction, RequestHandler, Router, Application } from 'express'
import { ListFeedServiceTypes, ListTopics, CreateFeedService, CreateFeedServiceRequest } from '../../app.api/feeds/app.api.feeds'
import { UserId } from '../../entities/authn/entities.authn'
import bodyParser from 'body-parser'
import { ErrPermissionDenied, MageError, PermissionDeniedError } from '../../app.api/app.api.global.errors'

export interface FeedsAppLayer {
  listServiceTypes: ListFeedServiceTypes
  createService: CreateFeedService
  listTopics: ListTopics
}

export interface AuthenticatedWebRequest extends express.Request {
  userId: UserId
}

export function FeedsRoutes(appLayer: FeedsAppLayer): Router {
  const routes = Router()
  routes.use(bodyParser.json())

  function errorHandler(err: PermissionDeniedError | any, req: express.Request, res: express.Response, next: express.NextFunction): any {
    if (!(err instanceof MageError)) {
      return next(err)
    }
    switch (err.code) {
      case ErrPermissionDenied:
        return res.status(403).json(`permission denied: ${(err as PermissionDeniedError).data.permission}`)
    }
    next(err)
  }

  routes.route('/service_types')
    .get(async (req, res, next): Promise<any> => {
      const authReq = req as AuthenticatedWebRequest
      const appReq = { user: authReq.userId }
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
      const appReq: CreateFeedServiceRequest = {
        user: authReq.userId,
        serviceType: body.serviceType,
        config: body.config,
        title: body.title,
        summary: body.summary
      }
      const appRes = await appLayer.createService(appReq)
      if (appRes.success) {
        return res.status(201).json(appRes.success)
      }
      next(appRes.error)
    })

  routes.route('/services/:serviceId/topics')

  routes.use(errorHandler)

  return routes
}
