const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const POSTGRES_USER = process.env.POSTGRES_USER || 'admin'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = process.env.DB_PORT || (process.env.CI ? 5432 : 5500)
const DEFAULT_DB = process.env.POSTGRES_DB || 'upchieve'

const ROOT_DIR = path.resolve(__dirname, '../../../') 
const DB_INIT_DIR = path.join(ROOT_DIR, 'database/db_init')
class DbTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    this.testPool
  }

  async setup() {
    await super.setup()

    console.log('***root dir', ROOT_DIR)

    if (process.env.CI) {
      try {
        execSync('apt-get update && apt-get install -y postgresql-client', {
          stdio: 'inherit',
        })

        const timeout = 30 // seconds
        let attempts = 0
        const waitForPostgres = async () => {
          try {
            execSync(
              `PGPASSWORD=${POSTGRES_PASSWORD} psql -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -d ${DEFAULT_DB} -c '\\q'`,
              { stdio: 'ignore' }
            )
          } catch (error) {
            if (attempts < timeout) {
              attempts++
              console.log(
                `Postgres is unavailable - retrying (${attempts}/${timeout})`
              )
              setTimeout(waitForPostgres, 1000) // Wait 1 second before retrying
            } else {
              console.error('Timeout waiting for Postgres')
              throw error
            }
          }
        }

        await waitForPostgres()

       try {
         const sqlFiles = fs.readdirSync(DB_INIT_DIR)

         for (const file of sqlFiles) {
           const filePath = path.join(DB_INIT_DIR, file)
           console.log(`Executing ${filePath}...`)
           execSync(
             `PGPASSWORD=${POSTGRES_PASSWORD} psql -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -d ${DEFAULT_DB} -f ${filePath}`,
             { stdio: 'inherit' }
           )
         }
       } catch (error) {
         console.error('Error executing SQL scripts:', error)
         throw error
       }

      } catch (error) {
        console.error('Error installing PostgreSQL client:', error)
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
