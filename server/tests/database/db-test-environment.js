const NodeEnvironment = require('jest-environment-node').TestEnvironment //TestEnvironment is sandboxed to each test suite
const Pool = require('pg').Pool

const POSTGRES_USER = process.env.POSTGRES_USER || 'admin'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = process.env.DB_PORT || (process.env.CI ? 5432 : 5500)
const DEFAULT_DB = process.env.POSTGRES_DB || 'upchieve'

let testPool
class DbTestEnvironment extends NodeEnvironment {

  async setup() {
    await super.setup()

    try {
      testPool = new Pool({
        database: DEFAULT_DB,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        port: POSTGRES_PORT,
        host: POSTGRES_HOST,
      })

      testPool.on('connect', async client => {
        await client.query('SET search_path TO upchieve;')
      })
      this.global.__TEST_DB_CLIENT__ = testPool
    } catch (error) {
      console.error('Error setting up test database:', error)
      throw error
    }
  }

  async teardown() {
    try {
      if (testPool) {
        await testPool.end()
      }
    } catch (error) {
      console.error('Error tearing down test database:', error)
    }
    await super.teardown()
  }
}

module.exports = DbTestEnvironment
