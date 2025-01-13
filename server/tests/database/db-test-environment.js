const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool

class DbTestEnvironment extends NodeEnvironment {

  async setup() {
     console.log(
       '*****connection string before',
       process.env.__TEST_DB_CONNECTION_STRING__
     ) 
    super.setup()
    const client = this.createTestClient(process.env.__TEST_DB_CONNECTION_STRING__)
    console.log('*****client', client)
    await client.query('SET search_path TO upchieve')
    this.global.__TEST_DB_CLIENT__ = client
    console.log('*****connection string', process.env.__TEST_DB_CONNECTION_STRING__) 
  }

  async teardown() {
    this.global.__TEST_DB_CLIENT__?.end()
    super.teardown()
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
}

module.exports = DbTestEnvironment
