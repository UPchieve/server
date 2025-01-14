// // 
// const { Pool } = require('pg');

// describe('Database Tests', () => {
//   let client;

//   beforeAll(() => {
//     client = global.__TEST_DB_CLIENT__;
//   });

//   afterAll(async () => {
//     await client.end();
//   });

//   test('Example query', async () => {
//     const result = await client.query('SELECT 1 AS value;');
//     expect(result.rows[0].value).toBe(1);
//   });
// });
const { Pool } = require('pg')

describe('Database Tests', () => {
  let client

  beforeAll(() => {
    client = global.__TEST_DB_CLIENT__
  })

  afterAll(async () => {
    await client.end()
  })

  test('Example query', async () => {
    console.log('****client', client)
    const result = await client.query('SELECT 1 AS value;')
    expect(result.rows[0].value).toBe(1)
  })
})
