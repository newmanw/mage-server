import { runDatabaseMigrations } from '../lib/migrate'
import { waitForDefaultMongooseConnection } from '../lib/adapters/adapters.db.mongoose'
import { mongoTestBeforeAllHook, mongoTestAfterAllHook } from './mongo.test'

/**
 * TODO: this should probably be an integration test
 */
describe.only('migration runner', function() {

  before(mongoTestBeforeAllHook())

  beforeEach('wait for mongoose', async function() {
    waitForDefaultMongooseConnection(this.mongo?.uri!, {
      useMongoClient: true
    })
  })

  after(mongoTestAfterAllHook())

  it('runs the migrations successfully', async function() {

    await runDatabaseMigrations(this.mongo?.uri!, {})
  })
})