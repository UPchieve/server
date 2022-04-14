import { mocked } from 'ts-jest/utils'
import { Pool } from 'pg'
import * as PgClient from '../db'
import config from '../config'
import * as pgEnv from './postgres-setup'

jest.unmock('pg')
jest.mock('../db')
const mockedClient = mocked(PgClient, true)

export const ONE_MINUTE = 60 * 1000

let closureClient: Pool

export function buildTestClient() {
  const client = new Pool({
    host: global.__PG_HOST__,
    port: global.__PG_PORT__,
    user: config.postgresUser,
    password: config.postgresPassword,
    database: config.postgresDatabase,
    allowExitOnIdle: true,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0,
    ssl: false,
  })
  return client
}

export async function setup() {
  await pgEnv.setup()
  const client = new Pool({
    host: global.__PG_HOST__,
    port: global.__PG_PORT__,
    user: config.postgresUser,
    password: config.postgresPassword,
    database: config.postgresDatabase,
    allowExitOnIdle: true,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0,
    ssl: false,
  })
  mockedClient.getClient.mockReturnValue(client)
  closureClient = client
}

export async function teardown() {
  await closureClient?.end()
  await pgEnv.teardown()
}

export function metaSetup() {
  jest.setTimeout(5 * ONE_MINUTE) // use large timeout to accomodate containers + query network/run time
  beforeAll(async () => {
    await setup()
  }, 2.5 * ONE_MINUTE)
  afterAll(async () => {
    await teardown()
  }, 2.5 * ONE_MINUTE)
}
