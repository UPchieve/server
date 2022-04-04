import { Pool } from 'pg'

// TODO: safer connection string, exponential backoff, reconnect strategy

const client = new Pool({
  host: 'subway-pg-upchieve-staging.aivencloud.com',
  user: 'subway',
  password: '',
  database: 'upchieve',
  port: 15600,
  ssl: { rejectUnauthorized: false }
})

export async function startClient(): Promise<void> {
  await client.connect()
}

export default client
