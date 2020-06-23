import environment from './environment/env'
import log from './logger'
import { loadPlugins, PluginDependencies } from './main.impl/main.impl.plugins'
import http from 'http'
import fs from 'fs-extra'
import mongoose, { ConnectionOptions } from 'mongoose'
import express from 'express'
import { MongooseFeedServiceTypeRepository, FeedServiceTypeIdentityModel, MongooseFeedServiceRepository, FeedServiceModel } from './adapters/feeds/adapters.feeds.db.mongoose'
import { waitForDefaultMongooseConnection } from './adapters/adapters.db.mongoose'
import { FeedServiceTypeRepository } from './entities/feeds/entities.feeds'
import * as feedsApi from './app.api/feeds/app.api.feeds'
import * as feedsImpl from './app.impl/feeds/app.impl.feeds'
import { env } from 'process'
import { PreFetchedUserRoleFeedsPerissionService } from './permissions/permissions.feeds'
import { FeedsRoutes } from './adapters/feeds/adapters.feeds.controllers.web'
import { WebAppRequestFactory } from './adapters/adapters.controllers.web'
import { AppRequest } from './app.api/app.api.global'
import { UserJson, UserDocument } from './models/user'


export interface MageService {
  app: express.Application
  server: http.Server
  open(): this
}

/**
 * The Express Application will emit this event when
 */
export const MageReadyEvent = 'comingOfMage'
export type BootConfig = {
  /**
   * An array of plugin package names
   */
  plugins: string[]
}

let service: MageService | null = null

export const boot = async function(config: BootConfig): Promise<MageService> {
  if (service) {
    return service as MageService
  }

  const mongooseLogger = log.loggers.get('mongoose')
  mongoose.set('debug', function(this: mongoose.Collection, collection: any, method: any, query: any, doc: any, options: any) {
    mongooseLogger.log('mongoose', "%s.%s(%s, %s, %s)", collection, method, this.$format(query), this.$format(doc), this.$format(options))
  })

  mongoose.Error.messages.general.required = "{PATH} is required."

  log.info('Starting MAGE Server ...')

  // Create directory for storing media attachments
  const attachmentBase = environment.attachmentBaseDirectory
  log.info(`creating attachments directory at ${attachmentBase}`)
  try {
    await fs.mkdirp(attachmentBase)
  }
  catch (err) {
    log.error(`error creating attachments directory ${attachmentBase}: `, err)
    throw err
  }

  const iconBase = environment.iconBaseDirectory
  log.info(`creating icon directory at ${iconBase}`)
  try {
    await fs.mkdirp(iconBase)
  }
  catch (err) {
    log.error(`error creating icon directory ${iconBase}: `, err)
    throw err
  }

  const models = await initializeDatabase()
  const appLayer = intitializeAppLayer(models)

  // load routes the old way
  const app = intializeRestInterface(appLayer)

  await loadPlugins(config.plugins, appLayer)

  const server = http.createServer(app)
  service = {
    app,
    server,
    open(): MageService {
      server.listen(environment.port, environment.address,
        () => log.info(`MAGE Server listening at address ${environment.address} on port ${environment.port}`))
      app.emit(MageReadyEvent, service)
      return this
    }
  }
  return service
}

type DatabaseModels = {
  conn: mongoose.Connection
  feeds: {
    feedServiceTypeIdentity: FeedServiceTypeIdentityModel
    feedService: FeedServiceModel
  }
}

type AppLayer = {
  feeds: {
    serviceTypeRepo: FeedServiceTypeRepository
    permissionService: feedsApi.FeedsPermissionService
    listServiceTypes: feedsApi.ListFeedServiceTypes
    createService: feedsApi.CreateFeedService
    listTopics: feedsApi.ListServiceTopics
  }
}

async function initializeDatabase(): Promise<DatabaseModels> {
  const { uri, connectRetryDelay, connectTimeout, options } = environment.mongo
  const conn = await waitForDefaultMongooseConnection(uri, connectTimeout, connectRetryDelay, options).then(() => mongoose.connection)
  // TODO: transition legacy model initialization
  // TODO: inject connection to migrations
  // TODO: explore performing migrations without mongoose models because current models may not be compatible with past migrations
  require('./models').initializeModels()
  await require('./migrate').runDatabaseMigrations()
  return {
    conn,
    feeds: {
      feedServiceTypeIdentity: FeedServiceTypeIdentityModel(conn),
      feedService: FeedServiceModel(conn)
    }
  }
}

function intitializeAppLayer(dbModels: DatabaseModels): AppLayer {
  const feeds = intializeFeedsAppLayer(dbModels)
  return {
    feeds
  }
}

function intializeFeedsAppLayer(dbModels: DatabaseModels): AppLayer['feeds'] {
  const serviceTypeRepo = new MongooseFeedServiceTypeRepository(dbModels.feeds.feedServiceTypeIdentity)
  const serviceRepo = new MongooseFeedServiceRepository(dbModels.feeds.feedService)
  const permissionService = new PreFetchedUserRoleFeedsPerissionService()
  const listServiceTypes = feedsImpl.ListFeedServiceTypes(permissionService, serviceTypeRepo)
  const createService = feedsImpl.CreateFeedService(permissionService, serviceTypeRepo, serviceRepo)
  const listTopics = feedsImpl.ListServiceTopics(permissionService, serviceTypeRepo, serviceRepo)
  return {
    serviceTypeRepo,
    permissionService,
    listServiceTypes,
    createService,
    listTopics
  }
}

function intializeRestInterface(app: AppLayer): express.Application {
  const webApp = require('./express.js') as express.Application
  const appRequestFactory: WebAppRequestFactory = <Params = unknown>(req: express.Request, params: Params): AppRequest<UserDocument> & Params => {
    return {
      ...params as any,
      context: {
        requestToken: Symbol(),
        requestingPrincipal() {
          return req.user
        }
      }
    }
  }
  const feedsRoutes = FeedsRoutes(app.feeds, appRequestFactory)
  webApp.use('/api/feeds', feedsRoutes)
  return webApp
}
