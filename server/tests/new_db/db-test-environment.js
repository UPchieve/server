const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool


const POSTGRES_USER = 'admin'
const POSTGRES_PASSWORD = 'Password123'
const POSTGRES_HOST = 'postgres'
const POSTGRES_PORT = 5432
const DEFAULT_DB = 'postgres' // Default database to connect to for admin operations
const TEST_DB = 'upchieve_test_ci_db'

let adminPool;

class DbTestEnvironment extends NodeEnvironment {
  async setup() {
    super.setup()
    console.log('****set up?????')
    
    // const client = this.createTestClient(
    //   process.env.__TEST_DB_CONNECTION_STRING__
    // )
    // await client.query('SET search_path TO upchieve')
    // this.global.__TEST_DB_CLIENT__ = client
    const client = this.connectToDefault()
    console.log('****client??', client)
    
    this.global.__TEST_DB_CLIENT__ = client
  }

  async teardown() {
    this.global.__TEST_DB_CLIENT__?.end()
    super.teardown()
  }

  connectToDefault = () => { 
  return adminPool = new Pool({
    user: POSTGRES_USER,
    host: 'localhost',
    database: DEFAULT_DB,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
  })

  // try {
  //   await adminPool.query(`CREATE DATABASE ${TEST_DB};`)
  //   console.log(`Database ${TEST_DB} created.`)
  // } catch (err) {
  //   if (err.code === '42P04') {
  //     console.log(`Database ${TEST_DB} already exists.`)
  //   } else {
  //     console.error(`Error creating database: ${err.message}`)
  //     throw err
  //   }
  // }
}

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
