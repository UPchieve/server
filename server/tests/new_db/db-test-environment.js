// const NodeEnvironment = require('jest-environment-node').TestEnvironment
// const Pool = require('pg').Pool


// const POSTGRES_USER = 'admin'
// const POSTGRES_PASSWORD = 'Password123'
// const POSTGRES_HOST = 'postgres'
// const POSTGRES_PORT = 5432
// const DEFAULT_DB = 'postgres' // Default database to connect to for admin operations
// const TEST_DB = 'upchieve_testdb'

// let adminPool;

// class DbTestEnvironment extends NodeEnvironment {
//   async setup() {
//     super.setup()

//     adminPool = this.connectToDefault()
//     const client = await this.testPool()
//     console.log('****client??', client)

    
//     this.global.__TEST_DB_CLIENT__ = client
//   }

//   async teardown() {
//     adminPool.end()
//     this.global.__TEST_DB_CLIENT__?.end()
//     super.teardown()
//   }

//   connectToDefault = () => { 
//     return new Pool({
//       user: POSTGRES_USER,
//       host: 'localhost',
//       database: DEFAULT_DB,
//       password: POSTGRES_PASSWORD,
//       port: POSTGRES_PORT,
//     })
//   }

//   testPool = async () => {
//     await adminPool.query(`SELECT 'CREATE DATABASE ${TEST_DB}'
//       WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${TEST_DB}')`)
//     return new Pool({
//       user: POSTGRES_USER,
//       host: POSTGRES_HOST,
//       database: TEST_DB,
//       password: POSTGRES_PASSWORD,
//       port: POSTGRES_PORT
//     })
//   }
// }

// module.exports = DbTestEnvironment

//   // createTestClient(connectionString) {
//   //   return new Pool({
//   //     connectionString,
//   //     allowExitOnIdle: true,
//   //     connectionTimeoutMillis: 0,
//   //     idleTimeoutMillis: 0,
//   //     ssl: false,
//   //   })
//   // }

const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool
const fs = require('fs')
const path = require('path')

// const POSTGRES_USER = 'admin'
// const POSTGRES_PASSWORD = 'Password123'
// const POSTGRES_HOST = 'localhost'
// const POSTGRES_PORT = 5432
// const DEFAULT_DB = 'postgres' // Default database to connect to for admin operations
// const TEST_DB = 'upchieve_testdb_123'

const POSTGRES_USER = process.env.POSTGRES_USER || 'admin'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : '127.0.0.1'
const POSTGRES_PORT = parseInt(process.env.DB_PORT || '5500')
const DEFAULT_DB = 'postgres'
const TEST_DB = 'upchieve_testdb_123'
class DbTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
    this.adminPool
    this.testPool
  }

  async setup() {
    await super.setup()

    console.log('*****1')
    console.log('***process.env.__TEST_DB_CONNECTION_STRING__', process.env.__TEST_DB_CONNECTION_STRING__)

    // this.adminPool = new Pool({
    //   user: POSTGRES_USER,
    //   host: POSTGRES_HOST,
    //   database: DEFAULT_DB,
    //   password: POSTGRES_PASSWORD,
    //   port: POSTGRES_PORT,
    // })

    this.adminPool = new Pool({
      database: DEFAULT_DB,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      port: POSTGRES_PORT,
      host: POSTGRES_HOST,
    })

    console.log('****1.5')
    this.adminPool.on('connect', async client => {
      await client.query('SET search_path TO upchieve;')
    })

    // await this.adminPool.query('SET search_path TO upchieve')

    console.log('*****2')

    // await this.createTestDatabase()

    // console.log('*****3')

    // this.testPool = new Pool({
    //   user: POSTGRES_USER,
    //   host: POSTGRES_HOST,
    //   database: TEST_DB,
    //   password: POSTGRES_PASSWORD,
    //   port: POSTGRES_PORT,
    // })

    // console.log('*****4')

    // await this.runSqlScripts()
    // console.log('*****5')
    // await client.query('SET search_path TO upchieve')
    this.global.__TEST_DB_CLIENT__ = this.adminPool
    console.log('****test db client', this.global.__TEST_DB_CLIENT__)
  }

  createTestClient(connectionString) {
    return new Pool({
      connectionString,
      allowExitOnIdle: true,
      connectionTimeoutMillis: 0,
      idleTimeoutMillis: 0,
      ssl: false,
    })
  }

  teardown() {
    // if (this.testPool) {
    //   this.testPool.end()
    // }

    if (this.adminPool) {
      this.adminPool.end()
    }

    super.teardown()
  }

  // async createTestDatabase() {
  //   try {
  //     await this.adminPool.query(`SELECT 'CREATE DATABASE ${TEST_DB}'
  //      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${TEST_DB}')`)
  //     console.log(`Test database "${TEST_DB}" created.`)
  //   } catch (err) {
  //     if (err.code === '42P04') {
  //       console.log(`Test database "${TEST_DB}" already exists.`)
  //     } else {
  //       throw err
  //     }
  //   }
  // }

  // async runSqlScripts() {
  //   const scriptsDir = path.resolve(__dirname, '../../../database/db_init')
  //   const scripts = [
  //     'schema.sql',
  //     'auth.sql',
  //     'test_seeds.sql',
  //     'seed_migrations.sql',
  //   ]

  //   for (const script of scripts) {
  //     const scriptPath = path.join(scriptsDir, script)
  //     const sql = fs.readFileSync(scriptPath, 'utf8')
  //     try {
  //       await this.adminPool.query(sql)
  //       console.log(`Executed SQL script: ${script}`)
  //     } catch (err) {
  //       console.error(`Error executing ${script}:`, err.message)
  //       throw err
  //     }
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
}

module.exports = DbTestEnvironment
