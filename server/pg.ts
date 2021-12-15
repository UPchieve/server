import pg from 'pg'
// import { backOff } from 'exponential-backoff'
import logger from './logger'
// import config from './config'

// TODO: exponential backoff and config string for db

const pool = new pg.Pool({
  // connectionString: 'your real connection string',
  connectionString: 'postgres://subway:Password123@localhost:5432/upchieve',
  // used with the real connection string
  // ssl: {
  // rejectUnauthorized: false
  // }
})
pool.on('error', err => logger.error('pg error:', err)) // don't let a pg restart kill the app
pool.on('connect', () => {
  logger.info('pg connect event')
})
pool.on('acquire', () => {
  logger.error('pg acquire event')
})
pool.on('remove', () => {
  logger.info('pg remove event')
})

export default pool
