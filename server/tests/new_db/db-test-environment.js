const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool

const POSTGRES_USER = process.env.POSTGRES_USER || 'admin'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = process.env.DB_PORT || (process.env.CI ? 5432 : 5500)
const DEFAULT_DB = process.env.POSTGRES_DB || 'upchieve'

class DbTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    this.testPool
  }

  async setup() {
    await super.setup()

        try {
          this.testPool = new Pool({
            database: DEFAULT_DB,
            user: POSTGRES_USER,
            password: POSTGRES_PASSWORD,
            port: POSTGRES_PORT,
            host: POSTGRES_HOST,
          })

          this.testPool.on('connect', async client => {
            await client.query('SET search_path TO upchieve;')
          })
          this.global.__TEST_DB_CLIENT__ = this.testPool
          this.global.__TEST_DB_NAME__ = this.testDbName
        } catch (error) {
          console.error('Error setting up test database:', error)
          throw error
        }
  }

  async teardown() {
    try {
      if (this.testPool) {
        if (process.env.CI) {
          const client = await this.testPool.connect()
          try {
            await client.query('DROP SCHEMA IF EXISTS upchieve CASCADE;')
          } finally {
            client.release()
          }
        }
        await this.testPool.end()
      }
    } catch (error) {
      console.error('Error tearing down test database:', error)
    }
    await super.teardown()
  }
}

module.exports = DbTestEnvironment
