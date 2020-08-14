import environment from './environment/env'
import log from './logger'
import { loadPlugins, PluginDependencies } from './main.impl/main.impl.plugins'
import http from 'http'
import fs from 'fs-extra'
import mongoose, { ConnectionOptions } from 'mongoose'
import express from 'express'
import { MongooseFeedServiceTypeRepository, FeedServiceTypeIdentityModel, MongooseFeedServiceRepository, FeedServiceModel, MongooseFeedRepository, FeedModel } from './adapters/feeds/adapters.feeds.db.mongoose'
import { waitForDefaultMongooseConnection } from './adapters/adapters.db.mongoose'
import { FeedServiceTypeRepository, FeedServiceRepository, FeedRepository } from './entities/feeds/entities.feeds'
import * as feedsApi from './app.api/feeds/app.api.feeds'
import * as feedsImpl from './app.impl/feeds/app.impl.feeds'
import * as eventsApi from './app.api/events/app.api.events'
import * as eventsImpl from './app.impl/events/app.impl.events'
import { PreFetchedUserRoleFeedsPermissionService } from './permissions/permissions.feeds'
import { FeedsRoutes } from './adapters/feeds/adapters.feeds.controllers.web'
import { WebAppRequestFactory } from './adapters/adapters.controllers.web'
import { AppRequest } from './app.api/app.api.global'
import { UserDocument } from './models/user'
import SimpleIdFactory from './adapters/adapters.simple_id_factory'
import { JsonSchemaService, JsonValidator, JSONSchema4 } from './entities/entities.json_types'
import { MageEventModel, MongooseMageEventRepository } from './adapters/events/adapters.events.db.mongoose'
import { MageEventRepository } from './entities/events/entities.events'
import { EventFeedsRoutes } from './adapters/events/adapters.events.controllers.web'
import { Z_UNKNOWN } from 'zlib'


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
  const appLayer = await intitializeAppLayer(models)

  // load routes the old way
  const app = await intializeRestInterface(appLayer)

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
    feed: FeedModel
  }
  events: {
    event: MageEventModel
  }
}

type AppLayer = {
  feeds: {
    serviceTypeRepo: FeedServiceTypeRepository
    serviceRepo: FeedServiceRepository
    feedRepo: FeedRepository
    jsonSchemaService: JsonSchemaService
    permissionService: feedsApi.FeedsPermissionService
    listServiceTypes: feedsApi.ListFeedServiceTypes
    previewTopics: feedsApi.PreviewTopics
    createService: feedsApi.CreateFeedService
    listServices: feedsApi.ListFeedServices
    listTopics: feedsApi.ListServiceTopics
    previewFeed: feedsApi.PreviewFeed
    createFeed: feedsApi.CreateFeed
    listAllFeeds: feedsApi.ListAllFeeds
    getFeed: feedsApi.GetFeed
  },
  events: {
    eventRepo: MageEventRepository
    addFeedToEvent: eventsApi.AddFeedToEvent
    listEventFeeds: eventsApi.ListEventFeeds
    removeFeedFromEvent: eventsApi.RemoveFeedFromEvent
    fetchFeedContent: feedsApi.FetchFeedContent
  }
}

async function initializeDatabase(): Promise<DatabaseModels> {
  const { uri, connectRetryDelay, connectTimeout, options } = environment.mongo
  const conn = await waitForDefaultMongooseConnection(mongoose, uri, connectTimeout, connectRetryDelay, options).then(() => mongoose.connection)
  // TODO: transition legacy model initialization
  // TODO: inject connection to migrations
  // TODO: explore performing migrations without mongoose models because current models may not be compatible with past migrations
  require('./models').initializeModels()
  const idFactory = new SimpleIdFactory()
  const migrate = await import('./migrate')
  await migrate.runDatabaseMigrations(uri, options)
  return {
    conn,
    feeds: {
      feedServiceTypeIdentity: FeedServiceTypeIdentityModel(conn),
      feedService: FeedServiceModel(conn),
      feed: FeedModel(conn)
    },
    events: {
      event: require('./models/event').Model
    }
  }
}

async function intitializeAppLayer(dbModels: DatabaseModels): Promise<AppLayer> {
  const feeds = await intializeFeedsAppLayer(dbModels)
  const events = await intializeEventsAppLayer(dbModels, feeds)
  return {
    events,
    feeds,
  }
}

async function intializeEventsAppLayer(dbModels: DatabaseModels, feeds: AppLayer['feeds']): Promise<AppLayer['events']> {
  const eventPermissions = await import('./permissions/permissions.events')
  const eventRepo: MageEventRepository = new MongooseMageEventRepository(dbModels.events.event)
  const eventFeedsPermissions = new eventPermissions.EventFeedsPermissionService(eventRepo, eventPermissions.defaultEventPermissionsSevice)
  return {
    eventRepo,
    addFeedToEvent: eventsImpl.AddFeedToEvent(eventPermissions.defaultEventPermissionsSevice, eventRepo),
    listEventFeeds: eventsImpl.ListEventFeeds(eventPermissions.defaultEventPermissionsSevice, eventRepo, feeds.feedRepo),
    removeFeedFromEvent: eventsImpl.RemoveFeedFromEvent(eventPermissions.defaultEventPermissionsSevice, eventRepo),
    fetchFeedContent: feedsImpl.FetchFeedContent(eventFeedsPermissions, feeds.serviceTypeRepo, feeds.serviceRepo, feeds.feedRepo, feeds.jsonSchemaService)
  }
}

function intializeFeedsAppLayer(dbModels: DatabaseModels): AppLayer['feeds'] {
  const serviceTypeRepo = new MongooseFeedServiceTypeRepository(dbModels.feeds.feedServiceTypeIdentity)
  const serviceRepo = new MongooseFeedServiceRepository(dbModels.feeds.feedService)
  const feedRepo = new MongooseFeedRepository(dbModels.feeds.feed, new SimpleIdFactory())
  // TODO: the real thing
  const jsonSchemaService: JsonSchemaService = {
    async validateSchema(schema: JSONSchema4): Promise<JsonValidator> {
      return {
        validate: async () => null
      }
    }
  }

  const permissionService = new PreFetchedUserRoleFeedsPermissionService()
  const listServiceTypes = feedsImpl.ListFeedServiceTypes(permissionService, serviceTypeRepo)
  const previewTopics = feedsImpl.PreviewTopics(permissionService, serviceTypeRepo)
  const createService = feedsImpl.CreateFeedService(permissionService, serviceTypeRepo, serviceRepo)
  const listServices = feedsImpl.ListFeedServices(permissionService, serviceRepo)
  const listTopics = feedsImpl.ListServiceTopics(permissionService, serviceTypeRepo, serviceRepo)
  const previewFeed = feedsImpl.PreviewFeed(permissionService, serviceTypeRepo, serviceRepo, jsonSchemaService)
  const createFeed = feedsImpl.CreateFeed(permissionService, serviceTypeRepo, serviceRepo, feedRepo, jsonSchemaService)
  const listAllFeeds = feedsImpl.ListAllFeeds(permissionService, feedRepo)
  const getFeed = feedsImpl.GetFeed(permissionService, serviceTypeRepo, serviceRepo, feedRepo)
  return {
    serviceTypeRepo,
    serviceRepo,
    feedRepo,
    jsonSchemaService,
    permissionService,
    listServiceTypes,
    previewTopics,
    createService,
    listServices,
    listTopics,
    previewFeed,
    createFeed,
    listAllFeeds,
    getFeed,
  }
}

async function intializeRestInterface(app: AppLayer): Promise<express.Application> {
  const webLayer = await import('./express')
  const webApp = webLayer.app
  const webAuth = webLayer.auth
  const appRequestFactory: WebAppRequestFactory = <Params = unknown>(req: express.Request, params: Params): AppRequest<UserDocument> & Params => {
    return {
      ...params as any,
      context: {
        requestToken: Symbol(),
        requestingPrincipal() {
          return req.user
        },
        event: req.event || req.eventEntity
      }
    }
  }
  const feedsRoutes = FeedsRoutes(app.feeds, appRequestFactory)
  const eventFeedsRoutes = EventFeedsRoutes(app.events, appRequestFactory)
  webApp.use('/api/feeds', [
    webAuth.passport.authenticate('bearer'),
    feedsRoutes
  ])
  webApp.use('/api/events', [
    webAuth.passport.authenticate('bearer'),
    eventFeedsRoutes
  ])
  return webApp
}
