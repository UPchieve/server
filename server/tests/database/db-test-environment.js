const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool

class DbTestEnvironment extends NodeEnvironment {

  async setup() {
    super.setup()
    const client = this.createTestClient(process.env.__TEST_DB_CONNECTION_STRING__)
    await client.query('SET search_path TO upchieve')
    this.global.__TEST_DB_CLIENT__ = client
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
