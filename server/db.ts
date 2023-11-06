import { logger } from '@sentry/utils'
import { Pool, PoolClient } from 'pg'
import config from './config'

// TODO: exponential backoff, reconnect strategy
export function buildClient(): Pool {
  return new Pool({
    // connectionString
    host: config.postgresHost,
    port: config.postgresPort,
    user: config.postgresUser,
    password: config.postgresPassword,
    database: config.postgresDatabase,
    ssl: config.postgresRequireSSL ? { rejectUnauthorized: false } : false,
  })
}

export function buildReadOnlyClient(): Pool {
  return new Pool({
    // connectionString
    host: config.postgresRoHost,
    port: config.postgresPort,
    user: config.postgresUser,
    password: config.postgresPassword,
    database: config.postgresDatabase,
    ssl: config.postgresRequireSSL ? { rejectUnauthorized: false } : false,
  })
}

let client: Pool | undefined
let roClient: Pool | undefined

export async function setupDbConnection() {
  getClient().on('error', err => console.error(`PG ERROR: ${err}`))
  getRoClient().on('error', err => console.error(`PG ERROR: ${err}`))

  try {
    getClient()
      .connect()
      .then(v => v.release())
    getRoClient()
      .connect()
      .then(v => v.release())
  } catch (err) {
    logger.error(`Could not connect to db with error ${err}`)
    process.exit(1)
  }
}

export async function connect(): Promise<void> {
  try {
    getClient()
      .connect()
      .then(v => v.release())
  } catch (err) {
    logger.error(`Could not connect to db with error ${err}`)
    process.exit(1)
  }
}

export function getClient(): Pool {
  if (!client) {
    client = buildClient()
  }
  return client
}

export function getRoClient(): Pool {
  if (!roClient) {
    roClient = buildReadOnlyClient()
  }
  return roClient
}

export async function closeClient(): Promise<void> {
  await client?.end()
}

export type TransactionClient = Pool | PoolClient
export async function runInTransaction<T>(
  cb: (tc: TransactionClient) => Promise<T>
) {
  const tc = await getClient().connect()
  try {
    await tc.query('BEGIN')
    const result = await cb(tc)
    await tc.query('COMMIT')
    return result
  } catch (err) {
    await tc.query('ROLLBACK')
    throw err
  } finally {
    tc.release()
  }
}
