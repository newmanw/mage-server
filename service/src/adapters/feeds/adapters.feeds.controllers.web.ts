
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      manifold: {
        contextFeed?: Feed
        feedType?: FeedType
        readonly requiredFeedType: FeedType
      }
    }
  }
}

import { FeedServiceTypeRepository, FeedRepository } from '../../entities/feeds/entities.feeds'
import { FeedType, Feed } from '../../entities/feeds/entities.feeds'
import { Request, Response, NextFunction, RequestHandler, Router, Application } from 'express'

export type ManifoldController = {
  getManifoldDescriptor(req: Request, res: Response, next: NextFunction): Promise<Response>
  createSource(req: Request, res: Response, next: NextFunction): Promise<Response>
  getSource(req: Request, res: Response, next: NextFunction): Promise<Response>
  getSourceApi(req: Request, res: Response, next: NextFunction): Promise<Response>
}

export type Injection = {
  adapterRepo: FeedServiceTypeRepository
  sourceRepo: FeedRepository
}

const sourceRouter = Router()
sourceRouter.route('/conformance')
sourceRouter.route('/collections')
sourceRouter.route('/collections/:collectionId')
  // .get(async (req, res, next) => {
  //   const adapter = req.manifold.requiredFeedType
  //   const collectionId = req.params.collectionId as string
  //   const conn = await adapter.connectTo(req.manifold.contextFeed!)
  //   const collections = await conn.getCollections()
  //   const collectionDesc = collections.get(collectionId)
  //   return res.json(collectionDesc)
  // })
sourceRouter.route('/collections/:collectionId/items')
  // .get(async (req, res, next) => {
  //   const adapter = req.manifold.requiredFeedType
  //   const collectionId = req.params.collectionId as string
  //   const conn = await adapter.connectTo(req.manifold.contextFeed!)
  //   const page = await conn.getItemsInCollection(collectionId)
  //   return res.type('application/geo+json').json(page.items)
  // })
sourceRouter.route('/collections/:collectionId/items/:featureId')

function manifoldController(injection: Injection): ManifoldController {
  const { adapterRepo, sourceRepo } = injection
  return {
    async getManifoldDescriptor(req: Request, res: Response, next: NextFunction): Promise<any> {
      throw new Error('unimplemented')
    },

    async createSource(req: Request, res: Response, next: NextFunction): Promise<any> {
      throw new Error('unimplemented')
      // const created = await repo.create(req.body)
      // return res.status(201).location(`${req.baseUrl}/sources/${created.id}`).send(created)
    },

    async getSource(req: Request, res: Response, next: NextFunction): Promise<any> {
      throw new Error('unimplemented')
      // if (!req.manifold.contextSource) {
      //   return res.status(404).json('not found')
      // }
      // return res.send(req.manifold.contextSource)
    },

    async getSourceApi(req: Request, res: Response, next: NextFunction): Promise<any> {
      throw new Error('unimplemented')
      // return res.send({})
    }
  }
}

// function contextSourceParamHandler(injection: Injection): RequestHandler {
//   const { sourceRepo, adapterRepo, manager } = injection
//   return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//     if (!req.params.hasOwnProperty('sourceId')) {
//       return next()
//     }
//     const sourceId = req.params.sourceId
//     const sourceDesc = sourceId ? await sourceRepo.findById(sourceId) : null
//     if (sourceDesc === null) {
//       return res.status(404).json('not found')
//     }
//     req.manifold.contextSource = sourceDesc
//     const adapter = await manifoldService.getAdapterForSource(sourceDesc)
//     req.manifold.adapter = adapter
//     next()
//   }
// }

export function createRouter(injection: Injection): Router {
  const controller = manifoldController(injection)
  const main = Router()
  main.route('/descriptor')
    .get(controller.getManifoldDescriptor)
  main.route('/sources')
    .post(controller.createSource)
  main.route('/sources/:sourceId')
    .get(controller.getSource)
  main.route('/sources/:sourceId/api')
    .get(controller.getSourceApi)
  // const setContextSource = contextSourceParamHandler(injection)
  const root = Router()
  // root.use((req: Request, res: Response, next: NextFunction) => {
  //   req.manifold = {
  //     get requiredAdapter(): ManifoldAdapter {
  //       const adapter = req.manifold.adapter
  //       if (!adapter) {
  //         throw new Error(`no adapter on request ${req.path}`)
  //       }
  //       return adapter
  //     }
  //   }
  //   next()
  // })
  // root.use('/sources/:sourceId', setContextSource)
  root.use('/sources/:sourceId/', sourceRouter)
  root.use(main)
  return root
}
