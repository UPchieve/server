
const { Pool } = require('pg')

const POSTGRES_USER = 'test_user'
const POSTGRES_PASSWORD = 'test_password'
const POSTGRES_HOST = 'postgres'
const POSTGRES_PORT = 5432
const DEFAULT_DB = 'postgres' // Default database to connect to for admin operations
const TEST_DB = 'upchieve_test_ci_db'

let adminPool
let testPool

// beforeAll(async () => {
  // Connect to the default 'postgres' database to create the test database
async function connectToDefault () { 
  adminPool = new Pool({
    user: POSTGRES_USER,
    host: POSTGRES_HOST,
    database: DEFAULT_DB,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
  })

  try {
    await adminPool.query(`CREATE DATABASE ${TEST_DB};`)
    console.log(`Database ${TEST_DB} created.`)
  } catch (err) {
    if (err.code === '42P04') {
      console.log(`Database ${TEST_DB} already exists.`)
    } else {
      console.error(`Error creating database: ${err.message}`)
      throw err
    }
  }
}

  // testPool = new Pool({
  //   user: POSTGRES_USER,
  //   host: POSTGRES_HOST,
  //   database: TEST_DB,
  //   password: POSTGRES_PASSWORD,
  //   port: POSTGRES_PORT,
  // })
  // console.log(`Connected to test database: ${TEST_DB}`)
// })

// afterAll(async () => {
//   // Close all connections
//   await testPool.end()
//   await adminPool.end()
//   console.log('Database connections closed.')
// })

await connectToDefault();

module.exports = { adminPool }
