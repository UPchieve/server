import { client } from '../db-utils'

/**
 * @group database
 */

test('Make a connection', async () => {
  const result = await client.query(`select * from report_reasons`)
  expect(result.rows.length).toEqual(6)
})
