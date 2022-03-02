/**
 * @group database
 */

import { getClient } from '../../pg'
import { setup, teardown } from '../postgres-test-hook'

jest.setTimeout(20 * 1000)
beforeAll(async () => {
  await setup()
})
afterAll(async () => {
  await teardown()
})

test('Make a connection', async () => {
  const client = getClient()
  const result = await client.query(`select * from report_reasons`)
  expect(result.rows.length).toEqual(6)
})
