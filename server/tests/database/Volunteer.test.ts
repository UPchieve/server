/**
 * @group database
 */

import { ONE_MINUTE, setup, teardown } from '../postgres-test-hook'
import { IgetNextVolunteerToNotify } from '../../models/Volunteer/queries'

jest.setTimeout(2 * ONE_MINUTE)
beforeAll(async () => {
  await setup()
}, ONE_MINUTE)
afterAll(async () => {
  await teardown()
}, ONE_MINUTE)

test('Make a connection', async () => {
  const result = await IgetNextVolunteerToNotify('algebraOne', new Date())
  expect(result).toBeUndefined()
})
