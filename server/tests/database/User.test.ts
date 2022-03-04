/**
 * @group database
 */

import { ONE_MINUTE, setup, teardown } from '../postgres-test-hook'
import { IgetUserIdByEmail } from '../../models/User/queries'

jest.setTimeout(2 * ONE_MINUTE)
beforeAll(async () => {
  await setup()
}, ONE_MINUTE)
afterAll(async () => {
  await teardown()
}, ONE_MINUTE)

test('Make a connection', async () => {
  const result = await IgetUserIdByEmail('student@upchieve.org')
  expect(result).toBeUndefined()
})
