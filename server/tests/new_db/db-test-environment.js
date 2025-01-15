const NodeEnvironment = require('jest-environment-node').TestEnvironment
const Pool = require('pg').Pool
const fs = require('fs')
const path = require('path')

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

    this.adminPool = new Pool({
      database: DEFAULT_DB,
      user: POSTGRES_USER,
      password: POSTGRES_PASSWORD,
      port: POSTGRES_PORT,
      host: POSTGRES_HOST,
    })

    this.adminPool.on('connect', async client => {
      await client.query('SET search_path TO upchieve;')
    })

    this.global.__TEST_DB_CLIENT__ = this.adminPool
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
    this.global.__TEST_DB_CLIENT__?.end()
    super.teardown()
  }
}

module.exports = DbTestEnvironment
