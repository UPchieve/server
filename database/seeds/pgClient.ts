import { Client } from 'server/pg'

// TODO: safer connection string, exponential backoff, reconnect strategy

const client = new Client({
  host: 'localhost',
  user: 'subway',
  password: 'Password123',
  database: 'upchieve',
})

export async function startClient(): Promise<void> {
  await client.connect()
}

export default client
