
import mongoose from 'mongoose'
import Mocha from 'mocha'
import { MongoMemoryServer } from 'mongodb-memory-server'


declare module 'mocha' {
  namespace Mocha {
    export class Context {
      mongo: MongoTestContext | undefined
    }
  }
}

export interface MongoTestContext {
  readonly server: MongoMemoryServer
  readonly uri: string
  readonly conn: mongoose.Connection
}

export function mongoTestBeforeAllHook(): () => Promise<void> {
  const mongo = {
    server: new MongoMemoryServer(),
    uri: <string | null>null,
    conn: <mongoose.Connection | null>null
  }
  return async function setupMongoServer(this: Mocha.Context) {
    mongo.uri = await mongo.server.getUri()
    mongo.conn = await mongoose.createConnection(mongo.uri, {
      useMongoClient: true,
      promiseLibrary: Promise
    })
    this.mongo = mongo
  }
}

export function mongoTestAfterAllHook(): () => Promise<void> {
  return async function destroyMongoServer(this: Mocha.Context) {
    await this.mongo.conn.close()
    await this.mongo.server.stop()
  }
}
