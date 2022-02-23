import { client } from '../db-utils'

/**
 * @group database
 */

test('Make a connection', async () => {
  await client.query(`delete from report_reasons where id = 1;`)
  const result = await client.query(`select * from report_reasons;`)
  expect(result.rows.length).toEqual(5)
})
