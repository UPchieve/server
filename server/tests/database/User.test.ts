/**
 * @group database
 */

import { setup, teardown } from '../postgres-test-hook'
import { IgetUserIdByEmail } from '../../models/User/queries'

jest.setTimeout(20 * 1000)
beforeAll(async () => {
  await setup()
})
afterAll(async () => {
  await teardown()
})

test('Make a connection', async () => {
  const result = await IgetUserIdByEmail('student@upchieve.org')
  expect(result).toBeUndefined()
})
