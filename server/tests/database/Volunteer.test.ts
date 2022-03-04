/**
 * @group database
 */

import { setup, teardown } from '../postgres-test-hook'
import { IgetNextVolunteerToNotify } from '../../models/Volunteer/queries'

jest.setTimeout(20 * 1000)
beforeAll(async () => {
  await setup()
})
afterAll(async () => {
  await teardown()
})

test('Make a connection', async () => {
  const result = await IgetNextVolunteerToNotify('algebraOne', new Date())
  expect(result).toBeUndefined()
})
