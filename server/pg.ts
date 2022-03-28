import { Pool } from 'pg'
import config from './config'

// TODO: exponential backoff, reconnect strategy

export function buildClient(): Pool {
  return new Pool({
    host: config.postgresHost,
    port: config.postgresPort,
    user: config.postgresUser,
    password: config.postgresPassword,
    database: config.postgresDatabase,
  })
}

const client = buildClient()

export function getClient(): Pool {
  return client
}
