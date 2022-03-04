/**
 * @group database
 */
import { Ulid } from 'id128'
import { setup, teardown } from '../postgres-test-hook'
import { getAvaiabilityForVolunteer } from '../../models/Availability/queries'
import createNewAvailability from '../../utils/create-new-availability'

jest.setTimeout(20 * 1000)
beforeAll(async () => {
  await setup()
}, 10 * 1000)
afterAll(async () => {
  await teardown()
})

test('Make a connection', async () => {
  const result = await getAvaiabilityForVolunteer(Ulid.generate().toRaw())
  expect(result).toEqual(createNewAvailability())
})
