
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

  routes.route('/service_types')
    .get(async (req, res, next): Promise<any> => {
      const authReq = req as AuthenticatedWebRequest
      const appReq = { user: authReq.userId }
      const appRes = await appLayer.listServiceTypes(appReq)
      return res.json(appRes.success)
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
      return res.status(201).json(appRes.success)
    })

  routes.route('/services/:serviceId/topics')
  return routes
}
