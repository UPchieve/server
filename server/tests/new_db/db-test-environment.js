const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool
const fs = require('fs').promises
const path = require('path')

const POSTGRES_USER = 'admin'
const POSTGRES_PASSWORD = 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = process.env.CI ? 5432 : 5500
const DEFAULT_DB = 'upchieve'

let isInitialized = false
let initializationPromise = null
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
        if (!initializationPromise) {
          initializationPromise = this.initializeDatabase(this.testPool).then(
            () => {
              isInitialized = true
            }
          )
        }
        await initializationPromise
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

  async initializeDatabase(pool) {
    const client = await pool.connect()
    try {
      const dropSchemas = ['upchieve', 'auth', 'basic_access', 'public']

      for (const schema of dropSchemas) {
        await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE;`)
      }

      for (const file of [
        'schema',
        'auth',
        'local_auth',
        'test_seeds',
        'seed_migrations',
        'refresh_materialized_views',
      ]) {
        const filePath = path.join('database', 'db_init', `${file}.sql`)
        console.log(`Executing ${filePath}...`)
        const sqlContent = await fs.readFile(filePath, 'utf-8')
        await client.query(sqlContent)
      }
    } catch (error) {
      console.error('Error initializing database:', error)
      throw error
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
