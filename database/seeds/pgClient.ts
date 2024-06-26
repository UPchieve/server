import { Pool } from 'pg'

const client = new Pool({
  host: 'localhost',
  user: 'subway',
  password: 'Password123',
  database: 'upchieve',
})

export default client
