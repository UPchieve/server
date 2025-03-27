/**
 * TestEnvironment is sandboxed to a test suite - meaning the following setup and teardown is performed for each test suite.
 * In the setup, we create a connection to the test database, and expose it as a global variable. In a later
 * Jest setup step, we mock `getClient` from our db utils to return this pool connection.
 * In the teardown, we simply end the connection.
 */
const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool
class DbTestEnvironment extends NodeEnvironment {
  static POSTGRES_USER = process.env.POSTGRES_USER || 'admin'
  static POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'Password123'
  static POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
  static POSTGRES_PORT = process.env.DB_PORT || (process.env.CI ? 5432 : 5500)
  static DEFAULT_DB = process.env.POSTGRES_DB || 'upchieve'

  async setup() {
    await super.setup()

    try {
      this.testPool = new Pool({
        database: DbTestEnvironment.DEFAULT_DB,
        user: DbTestEnvironment.POSTGRES_USER,
        password: DbTestEnvironment.POSTGRES_PASSWORD,
        port: DbTestEnvironment.POSTGRES_PORT,
        host: DbTestEnvironment.POSTGRES_HOST,
      })

      this.testPool.on('connect', async (client) => {
        await client.query('SET search_path TO upchieve;')
      })
      this.global.__TEST_DB_CLIENT__ = this.testPool
    } catch (error) {
      console.error('Error setting up test database:', error)
      throw error
    }
  }

  async teardown() {
    try {
      this.testPool?.end()
    } catch (error) {
      console.error('Error tearing down test database:', error)
    }
    await super.teardown()
  }
}

module.exports = DbTestEnvironment
