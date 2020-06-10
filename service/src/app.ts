import environment from './environment/env'
import log from './logger'
import { loadPlugins, PluginDependencies } from './main.impl/main.impl.plugins'
import http from 'http'
import fs from 'fs-extra'
import mongoose from 'mongoose'
import express from 'express'
import { MongooseFeedServiceTypeRepository, FeedServiceTypeIdentityModel } from './adapters/feeds/adapters.feeds.db.mongoose'
import waitForMongooseConnection from './utilities/waitForMongooseConnection'


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
  // load routes the old way
  const app = require('./express.js') as express.Application
  const pluginDeps: PluginDependencies = {
    feeds: {
      serviceTypeRepo: new MongooseFeedServiceTypeRepository(models.feedServiceTypeIdentity)
    }
  }

  await loadPlugins(config.plugins, pluginDeps)

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

type Models = {
  feedServiceTypeIdentity: FeedServiceTypeIdentityModel
}

async function initializeDatabase(): Promise<Models> {
  const conn = await waitForMongooseConnection().then(() => mongoose.connection)
  // TODO: transition legacy model initialization
  require('./models').initializeModels()
  return {
    feedServiceTypeIdentity: FeedServiceTypeIdentityModel(conn)
  }
}
