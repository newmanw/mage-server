import express from 'express'
import { Router } from 'express'
import { PluginResourceUrl } from '../../entities/entities.global'
import { PluginUrlScheme } from '../url_schemes/adapters.url_schemes.plugin'

export function WebUiPluginRoutes(webUiPluginModules: string[]): Router {

  const pathOfPluginModule: { [pluginModule: string]: string } = {}
  const routes = Router()

  const webUiResolver = new PluginUrlScheme(webUiPluginModules)
  for (const moduleName of webUiPluginModules) {
    const moduleUrl = new PluginResourceUrl(moduleName + '/')
    const moduleBasePath = webUiResolver.localPathOfUrl(moduleUrl)
    if (typeof moduleBasePath === 'string') {
      pathOfPluginModule[moduleName] = moduleBasePath
      routes.use(`/${moduleName}`, express.static(moduleBasePath))
    }
    else {
      console.error('error resolving web ui plugin module', moduleBasePath)
    }
  }

  routes.route('/')
    .get(async (req, res, next) => {
      res.json(Object.keys(pathOfPluginModule))
    })

  return routes
}