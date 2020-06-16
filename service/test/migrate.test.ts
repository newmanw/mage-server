import { runDatabaseMigrations } from '../lib/migrate'
import waitForMongooseConnection from '../lib/utilities/waitForMongooseConnection'
import { mongoTestBeforeAllHook, mongoTestAfterAllHook } from './mongo.test'

/**
 * TODO: this should probably be an integration test
 */
describe.only('migration runner', function() {

  before(mongoTestBeforeAllHook())

  beforeEach('wait for mongoose', async function() {
    waitForMongooseConnection()
  })

  after(mongoTestAfterAllHook())


  it('runs the migrations successfully', async function() {

    await runDatabaseMigrations(this.mongo?.uri!, {})
  })
})