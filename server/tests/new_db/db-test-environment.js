const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool
const fs = require('fs').promises

const POSTGRES_USER = 'admin'
const POSTGRES_PASSWORD = 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = process.env.CI ? 5432 : 5500
const DEFAULT_DB = 'upchieve'

let isInitialized = false
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

          if (process.env.CI && !isInitialized) {
            await this.initializeCiDatabase()
            isInitialized = true
          }

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

  async initializeCIDatabase() {
    let timeout = 30
    while (timeout > 0) {
      try {
        await this.testPool.query('SELECT 1')
        console.log('PostgreSQL is ready')
        break
      } catch (error) {
        console.log('Postgres is unavailable')
        timeout--
        if (timeout === 0) {
          throw new Error('Timeout waiting for Postgres')
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    const sqlFiles = [
      'schema',
      'auth',
      'local_auth',
      'test_seeds',
      'seed_migrations',
      'refresh_materialized_views',
    ]

    const client = await this.testPool.connect()
    try {
      for (const file of sqlFiles) {
        const filePath = `database/db_init/${file}.sql`
        console.log(`Executing db file ${filePath}`)
        const sqlContent = await fs.readFile(filePath, 'utf-8')
        await client.query(sqlContent)
      }
    } finally {
      client.release()
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
