import environment from './environment/env'
import log from './logger'
import { loadPlugins } from './main.impl/main.impl.plugins'
import http from 'http'
import fs from 'fs-extra'
import mongoose from 'mongoose'
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
import { MongooseStaticIconRepository, StaticIconModel } from './adapters/icons/adapters.icons.db.mongoose'
import { StaticIconRepository } from './entities/icons/entities.icons'
import { FileSystemIconContentStore } from './adapters/icons/adapters.icons.content_store.file_system'


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

  const models = await initDatabase()
  const repos = await initRepositories(models)
  const appLayer = await initAppLayer(repos)

  // load routes the old way
  const app = await initRestInterface(repos, appLayer)

  await loadPlugins(config.plugins, {
    feeds: {
      serviceTypeRepo: repos.feeds.serviceTypeRepo
    },
    icons: {
      staticIconRepo: repos.icons.staticIconRepo
    }
  })

  await import('./schedule').then(jobSchedule => {
    return new Promise<void>((resolve, reject) => {
      jobSchedule.initialize(app, (err: any) => {
        if (!err) {
          return resolve()
        }
        reject(err)
      })
    })
  })

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
  icons: {
    staticIcon: StaticIconModel
  }
}

type AppLayer = {
  feeds: {
    jsonSchemaService: JsonSchemaService
    permissionService: feedsApi.FeedsPermissionService
    listServiceTypes: feedsApi.ListFeedServiceTypes
    previewTopics: feedsApi.PreviewTopics
    createService: feedsApi.CreateFeedService
    listServices: feedsApi.ListFeedServices
    getService: feedsApi.GetFeedService
    listTopics: feedsApi.ListServiceTopics
    previewFeed: feedsApi.PreviewFeed
    createFeed: feedsApi.CreateFeed
    listAllFeeds: feedsApi.ListAllFeeds
    listServiceFeeds: feedsApi.ListServiceFeeds
    deleteService: feedsApi.DeleteFeedService
    getFeed: feedsApi.GetFeed
    updateFeed: feedsApi.UpdateFeed
    deleteFeed: feedsApi.DeleteFeed
  },
  events: {
    addFeedToEvent: eventsApi.AddFeedToEvent
    listEventFeeds: eventsApi.ListEventFeeds
    removeFeedFromEvent: eventsApi.RemoveFeedFromEvent
    fetchFeedContent: feedsApi.FetchFeedContent
  }
}

async function initDatabase(): Promise<DatabaseModels> {
  const { uri, connectRetryDelay, connectTimeout, options } = environment.mongo
  const conn = await waitForDefaultMongooseConnection(mongoose, uri, connectTimeout, connectRetryDelay, options).then(() => mongoose.connection)
  // TODO: transition legacy model initialization
  // TODO: inject connection to migrations
  // TODO: explore performing migrations without mongoose models because current models may not be compatible with past migrations
  require('./models').initializeModels()
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
    },
    icons: {
      staticIcon: StaticIconModel(conn)
    }
  }
}

type Repositories = {
  events: {
    eventRepo: MageEventRepository
  },
  feeds: {
    serviceTypeRepo: FeedServiceTypeRepository,
    serviceRepo: FeedServiceRepository,
    feedRepo: FeedRepository
  },
  icons: {
    staticIconRepo: StaticIconRepository
  }
}

  // TODO: the real thing
const jsonSchemaService: JsonSchemaService = {
  async validateSchema(schema: JSONSchema4): Promise<JsonValidator> {
    return {
      validate: async () => null
    }
  }
}

async function initRepositories(models: DatabaseModels): Promise<Repositories> {
  const serviceTypeRepo = new MongooseFeedServiceTypeRepository(models.feeds.feedServiceTypeIdentity)
  const serviceRepo = new MongooseFeedServiceRepository(models.feeds.feedService)
  const feedRepo = new MongooseFeedRepository(models.feeds.feed, new SimpleIdFactory())
  const eventRepo = new MongooseMageEventRepository(models.events.event)
  const staticIconRepo = new MongooseStaticIconRepository(models.icons.staticIcon, new SimpleIdFactory(), new FileSystemIconContentStore(), [])
  return {
    feeds: {
      serviceTypeRepo, serviceRepo, feedRepo
    },
    events: {
      eventRepo
    },
    icons: {
      staticIconRepo
    }
  }
}

async function initAppLayer(repos: Repositories): Promise<AppLayer> {
  const feeds = await initFeedsAppLayer(repos)
  const events = await initEventsAppLayer(repos)
  return {
    events,
    feeds,
  }
}

async function initEventsAppLayer(repos: Repositories): Promise<AppLayer['events']> {
  const eventPermissions = await import('./permissions/permissions.events')
  const eventFeedsPermissions = new eventPermissions.EventFeedsPermissionService(repos.events.eventRepo, eventPermissions.defaultEventPermissionsSevice)
  return {
    addFeedToEvent: eventsImpl.AddFeedToEvent(eventPermissions.defaultEventPermissionsSevice, repos.events.eventRepo),
    listEventFeeds: eventsImpl.ListEventFeeds(eventPermissions.defaultEventPermissionsSevice, repos.events.eventRepo, repos.feeds.feedRepo),
    removeFeedFromEvent: eventsImpl.RemoveFeedFromEvent(eventPermissions.defaultEventPermissionsSevice, repos.events.eventRepo),
    fetchFeedContent: feedsImpl.FetchFeedContent(eventFeedsPermissions, repos.feeds.serviceTypeRepo, repos.feeds.serviceRepo, repos.feeds.feedRepo, jsonSchemaService)
  }
}

function initFeedsAppLayer(repos: Repositories): AppLayer['feeds'] {
  const { serviceTypeRepo, serviceRepo, feedRepo } = repos.feeds
  const permissionService = new PreFetchedUserRoleFeedsPermissionService()
  const listServiceTypes = feedsImpl.ListFeedServiceTypes(permissionService, serviceTypeRepo)
  const previewTopics = feedsImpl.PreviewTopics(permissionService, serviceTypeRepo)
  const createService = feedsImpl.CreateFeedService(permissionService, serviceTypeRepo, serviceRepo)
  const listServices = feedsImpl.ListFeedServices(permissionService, serviceTypeRepo, serviceRepo)
  const getService = feedsImpl.GetFeedService(permissionService, serviceTypeRepo, serviceRepo)
  const listTopics = feedsImpl.ListServiceTopics(permissionService, serviceTypeRepo, serviceRepo)
  const previewFeed = feedsImpl.PreviewFeed(permissionService, serviceTypeRepo, serviceRepo, jsonSchemaService, repos.icons.staticIconRepo)
  const createFeed = feedsImpl.CreateFeed(permissionService, serviceTypeRepo, serviceRepo, feedRepo, jsonSchemaService, repos.icons.staticIconRepo)
  const listAllFeeds = feedsImpl.ListAllFeeds(permissionService, feedRepo)
  const listServiceFeeds = feedsImpl.ListServiceFeeds(permissionService, serviceRepo, feedRepo)
  const deleteService = feedsImpl.DeleteFeedService(permissionService, serviceRepo, feedRepo, repos.events.eventRepo)
  const getFeed = feedsImpl.GetFeed(permissionService, serviceTypeRepo, serviceRepo, feedRepo)
  const updateFeed = feedsImpl.UpdateFeed(permissionService, serviceTypeRepo, serviceRepo, feedRepo, repos.icons.staticIconRepo)
  const deleteFeed = feedsImpl.DeleteFeed(permissionService, feedRepo, repos.events.eventRepo)
  return {
    jsonSchemaService,
    permissionService,
    listServiceTypes,
    previewTopics,
    createService,
    listServices,
    getService,
    listTopics,
    previewFeed,
    createFeed,
    listAllFeeds,
    listServiceFeeds,
    deleteService,
    getFeed,
    updateFeed,
    deleteFeed,
  }
}

async function initRestInterface(repos: Repositories, app: AppLayer): Promise<express.Application> {
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
  const eventFeedsRoutes = EventFeedsRoutes({ ...app.events, eventRepo: repos.events.eventRepo }, appRequestFactory)
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
