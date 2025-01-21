// firstTest.test.js
const { Pool } = require('pg')

describe('Database Tests', () => {
  let client

  beforeAll(() => {
    client = global.__TEST_DB_CLIENT__
  })

  test('Example query', async () => {
    console.log('****client', client)
    // const result = await client.query('SELECT 1 AS value;')
    const viewTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'upchieve' 
      ORDER BY table_name;
    `)
    console.log('***view tables', viewTables.rows)
  })
})
