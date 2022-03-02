import { mocked } from 'ts-jest/utils'
import { Pool } from 'pg'
import * as PgClient from '../pg'
import config from '../config'
import * as pgEnv from './postgres-setup'

jest.setTimeout(20 * 1000)

jest.mock('../pg')
const mockedClient = mocked(PgClient, true)

let closureClient: Pool

export async function setup() {
  await pgEnv.setup()
  const client = new Pool({
    host: global.__PG_HOST__,
    port: global.__PG_PORT__,
    user: config.postgresUser,
    password: config.postgresPassword,
    database: config.postgresDatabase,
    allowExitOnIdle: true,
    connectionTimeoutMillis: 3 * 1000,
    ssl: false,
  })

  mockedClient.getClient.mockReturnValue(client)
  closureClient = client
}

export async function teardown() {
  await closureClient?.end()
  await pgEnv.teardown()
}
