import { logger } from '@sentry/utils'
import { Pool } from 'pg'
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

const client = buildClient()

client.on('error', err => console.error(`PG ERROR: ${err}`))

try {
  client.connect().then(v => v.release())
} catch (err) {
  logger.error(`Could not connect to db with error ${err}`)
  process.exit(1)
}

export async function connect(): Promise<void> {
  try {
    client.connect().then(v => v.release())
  } catch (err) {
    logger.error(`Could not connect to db with error ${err}`)
    process.exit(1)
  }
}

export function getClient(): Pool {
  return client
}

export async function closeClient(): Promise<void> {
  await client.end()
}
