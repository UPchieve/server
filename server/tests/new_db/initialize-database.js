const fs = require('fs').promises
const path = require('path')
const { Pool } = require('pg')

const POSTGRES_USER = 'admin'
const POSTGRES_PASSWORD = 'Password123'
const POSTGRES_HOST = process.env.CI ? 'postgres' : 'localhost'
const POSTGRES_PORT = process.env.CI ? 5432 : 5500
const DEFAULT_DB = 'upchieve'

async function initializeDatabase() {
  const pool = new Pool({
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: DEFAULT_DB,
    port: POSTGRES_PORT,
  })

  // Wait for PostgreSQL to be ready
  let timeout = 30
  while (timeout > 0) {
    try {
      await pool.query('SELECT 1')
      console.log('PostgreSQL is ready!')
      break
    } catch (error) {
      console.log('Postgres is unavailable - sleeping')
      timeout--
      if (timeout === 0) {
        await pool.end()
        throw new Error('Timeout waiting for Postgres')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  const sqlFiles = [
    'schema',
    'auth',
    'local_auth',
    'test_seeds',
    'seed_migrations',
    'refresh_materialized_views',
  ]

  try {
    const client = await pool.connect()
    try {
      for (const file of sqlFiles) {
        const filePath = path.join('database', 'db_init', `${file}.sql`)
        console.log(`Executing ${filePath}...`)
        const sqlContent = await fs.readFile(filePath, 'utf-8')
        await client.query(sqlContent)
      }
      console.log('Database initialization completed successfully!')
    } finally {
      client.release()
    }
  } finally {
    await pool.end()
  }
}

module.exports = { initializeDatabase }
