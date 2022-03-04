import { mocked } from 'ts-jest/utils'
import { Pool } from 'pg'
import * as PgClient from '../pg'
import config from '../config'
import * as pgEnv from './postgres-setup'

jest.mock('../pg')
const mockedClient = mocked(PgClient, true)

export const ONE_MINUTE = 60 * 1000

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
