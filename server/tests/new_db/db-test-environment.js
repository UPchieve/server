const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool
const fs = require('fs').promises
const path = require('path')

const POSTGRES_USER = process.env.POSTGRES_USER || 'admin'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = process.env.DB_PORT || (process.env.CI ? 5432 : 5500)
const POSTGRES_DB = process.env.POSTGRES_DB || 'upchieve'

let isInitialized = false
class DbTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    this.testPool
  }

  async setup() {
    await super.setup()

    if (process.env.CI && !isInitialized) {
      await this.initializeDatabase()
    }

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

  async initializeDatabase() {
    if (isInitialized) return

    const pool = new Pool({
      database: POSTGRES_DB,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      port: POSTGRES_PORT,
      host: POSTGRES_HOST,
    })

    try {
      for (const file of [
        'schema',
        'auth',
        'local_auth',
        'test_seeds',
        'seed_migrations',
        'refresh_materialized_views',
      ]) {
        const filePath = path.join('database', 'db_init', `${file}.sql`)
        console.log(`Reading ${filePath}...`)
        const sqlContent = await fs.readFile(filePath, 'utf-8')

        console.log(`Executing ${filePath}...`)
        const statements = sqlContent
          .replace(/\r\n/g, '\n')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0)

        for (const statement of statements) {
          await pool.query(statement)
        }
      }
      isInitialized = true
    } catch (error) {
      console.error('Error initializing database:', error)
      throw error
    } finally {
      await pool.end()
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
