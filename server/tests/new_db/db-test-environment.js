const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool

const POSTGRES_USER = 'admin'
const POSTGRES_PASSWORD = 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = process.env.CI ? 5432 : 5500
const DEFAULT_DB = 'upchieve'
const TEST_DB = 'upchieve_testdb'
class DbTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    this.adminPool
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
        await this.testPool.end()
      }

    } catch (error) {
      console.error('Error tearing down test database:', error)
    }

    await super.teardown()
  }
}

module.exports = DbTestEnvironment
