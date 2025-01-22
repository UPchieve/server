const NodeEnvironment = require('jest-environment-node').TestEnvironment
const { Pool } = require('pg')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)
const fs = require('fs').promises
const path = require('path')

const POSTGRES_USER = process.env.POSTGRES_USER || 'admin'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = process.env.DB_PORT || (process.env.CI ? 5432 : 5500)
const DEFAULT_DB = process.env.POSTGRES_DB || 'upchieve'

const ROOT_DIR = path.resolve(__dirname, '../../../')
const DB_INIT_DIR = path.join(ROOT_DIR, 'database/db_init')

const pools = new Set()

class DbTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    this.testPool = null
  }

  async setup() {
    await super.setup()

    if (process.env.CI) {
      try {
        await execAsync(
          'apt-get update && apt-get install -y postgresql-client'
        )

        let timeout = 30
        while (timeout > 0) {
          try {
            await execAsync(
              `PGPASSWORD=${POSTGRES_PASSWORD} psql -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -d ${DEFAULT_DB} -c '\\q'`
            )
            break
          } catch (error) {
            timeout--
            if (timeout === 0) throw new Error('Timeout waiting for Postgres')
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log(
              `Postgres is unavailable - retrying (${timeout} attempts left)`
            )
          }
        }

        const sqlFiles = [
          'schema.sql',
          'auth.sql',
          'local_auth.sql',
          'test_seeds.sql',
          'seed_migrations.sql',
          'refresh_materialized_views.sql',
        ]

        for (const file of sqlFiles) {
          const filePath = path.join(DB_INIT_DIR, file)
          await fs.access(filePath)
          console.log(`Executing ${filePath}...`)
          await execAsync(
            `PGPASSWORD=${POSTGRES_PASSWORD} psql -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -d ${DEFAULT_DB} -f ${filePath}`
          )
        }
      } catch (error) {
        console.error('Setup error:', error)
        throw error
      }
    }

    try {
      this.testPool = new Pool({
        database: DEFAULT_DB,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        port: POSTGRES_PORT,
        host: POSTGRES_HOST,
      })
      pools.add(this.testPool)

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
        pools.delete(this.testPool)
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

    for (const pool of pools) {
      try {
        await pool.end()
      } catch (error) {
        console.error('Error cleaning up pool:', error)
      }
    }
    pools.clear()

    await super.teardown()
  }
}

module.exports = DbTestEnvironment
