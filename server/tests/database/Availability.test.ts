/**
 * @group database
 */
import { Ulid } from 'id128'
import { ONE_MINUTE, setup, teardown } from '../postgres-test-hook'
import { getAvaiabilityForVolunteer } from '../../models/Availability/queries'
import createNewAvailability from '../../utils/create-new-availability'

jest.setTimeout(2 * ONE_MINUTE)
beforeAll(async () => {
  await setup()
}, ONE_MINUTE)
afterAll(async () => {
  await teardown()
}, ONE_MINUTE)

test('Make a connection', async () => {
  const result = await getAvaiabilityForVolunteer(Ulid.generate().toRaw())
  expect(result).toEqual(createNewAvailability())
})
