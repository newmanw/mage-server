// declare global {
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      pluginDescriptor: PluginDescriptor | undefined
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {

  }
}

import express from 'express'
import { PluginRepository } from "../application/plugins.app.contracts"
import { PluginDescriptor } from '../entities/plugins.entities'
import { ListPluginsFn } from '../application/plugins.app.fn'

export type PluginsWebControllerInjection = {
  pluginRepository: PluginRepository
}


export function PluginsWebController(injection: PluginsWebControllerInjection): Promise<express.Router> {

  const routes = express.Router()
  const pluginRouters = new Map<string, express.Router>()

  routes.use(async (req, res, next) => {
    if (req.params.pluginId) {
      // const desc = await funcs.getPlugin(req.params.pluginId as string)
      // req.pluginDescriptor = desc
    }
  })

  routes.route('/plugins')
    .get(async (req, res) => {
      const descriptors = await ListPluginsFn(injection.pluginRepository)()
      return res.json(descriptors)
    })

  routes.route('/:pluginId/enabled')
    .put(async (req, res) => {
      res.status(500).send('unimplemented')
      // const pluginId = req.params.pluginId as string
      // const desc = await funcs.getPlugin(pluginId)
      // if (!desc) {
      //   return res.status(404).send('not found')
      // }
      // const enable = req.body as boolean
      // if (typeof enable !== 'boolean') {
      //   return res.status(400).send('request body must be boolean')
      // }
      // if (enable === desc.enabled) {
      //   return res.status(200).json(desc)
      // }
      // let updated: PluginDescriptor = desc
      // if (enable === true) {
      //   updated = await funcs.enablePlugin(desc.id)
      // }
      // else if (enable === false) {
      //   updated = await funcs.disablePlugin(desc.id)
      // }
      // return res.json(updated)
    })

  routes.route('/:pluginId/settings')
    .get(async (req, res) => {
      return res.status(500).send('unimplemented')
    })
    .put(async (req, res) => {
      return res.status(500).send('unimplemented')
    })

  // routes.route('/:pluginId/*')
  //   .all(async (req, res, next) => {
  //     const desc = req.pluginDescriptor
  //     if (!desc) {
  //       return res.status(404).send('not found')
  //     }
  //     const pluginRoutes = pluginRouters.get(desc.id)
  //     if (!pluginRoutes) {
  //       const err = new Error(`no routes exist for plugin ${desc.id}`)
  //       console.log(err)
  //       return next(err)
  //     }
  //     return pluginRoutes(req, res, next)
  //   })

  return Promise.resolve(routes)
}