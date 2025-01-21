const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool
const fs = require('fs')
const path = require('path')
const { readFile } = require('fs/promises')

const POSTGRES_USER = 'admin'
const POSTGRES_PASSWORD = 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = 5500
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

      // const sqlFiles = [
      //   'schema.sql',
      //   'auth.sql', 
      //   'test_seeds.sql',
      //   'seed_migrations.sql'
      // ];

      // for (const file of sqlFiles) {
      //   const filePath = path.join(process.cwd(), 'database', 'db_init', file);
      //   const sql = await readFile(filePath, 'utf8');
      //   await this.testPool.query(sql);
      // }

      // this.testPool = new Pool({
      //   database: TEST_DB,
      //   user: POSTGRES_USER,
      //   password: POSTGRES_PASSWORD,
      //   port: POSTGRES_PORT,
      //   host: POSTGRES_HOST,
      // })

      // await this.initializeTestDatabase()

      this.global.__TEST_DB_CLIENT__ = this.testPool
      this.global.__TEST_DB_NAME__ = this.testDbName
    } catch (error) {
      console.error('Error setting up test database:', error)
      throw error
    }

    // this.global.__TEST_DB_CLIENT__ = this.adminPool
  }

  // async initializeTestDatabase() {
  //   try {
  //     const sqlFiles = [
  //       'schema.sql',
  //       'auth.sql',
  //       'test_seeds.sql',
  //       'seed_migrations.sql',
  //     ]

  //     for (const file of sqlFiles) {
  //       const filePath = path.join(process.cwd(), 'database', 'db_init', file)
  //       const sql = fs.readFileSync(filePath, 'utf8')
  //       await this.testPool.query(sql)
  //     }
  //   } catch (error) {
  //     console.error('Error initializing test database:', error)
  //     throw error
  //   }
  // }

  // createTestClient(connectionString) {
  //   return new Pool({
  //     connectionString,
  //     allowExitOnIdle: true,
  //     connectionTimeoutMillis: 0,
  //     idleTimeoutMillis: 0,
  //     ssl: false,
  //   })
  // }

  // teardown() {
  //   this.global.__TEST_DB_CLIENT__?.end()
  //   super.teardown()
  // }

  async teardown() {
    try {
      if (this.testPool) {
        await this.testPool.end()
      }

      // if (this.adminPool) {
      //   await this.adminPool.query(
      //     `
      //     SELECT pg_terminate_backend(pid)
      //     FROM pg_stat_activity
      //     WHERE datname = $1
      //   `,
      //     [this.testDbName]
      //   )

      //   await this.adminPool.query(`DROP DATABASE IF EXISTS ${this.testDbName}`)
      //   await this.adminPool.end()
      // }
    } catch (error) {
      console.error('Error tearing down test database:', error)
    }

    await super.teardown()
  }
}

module.exports = DbTestEnvironment
