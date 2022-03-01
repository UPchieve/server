import { Pool } from 'pg'
import config from './config'

// TODO: safer connection string, exponential backoff, reconnect strategy

const client = new Pool({
  host: config.postgresHost,
  port: config.postgresPort,
  user: config.postgresUser,
  password: config.postgresPassword,
  database: config.postgresDatabase,
})

export async function startClient(): Promise<void> {
  await client.connect()
}

export default client
