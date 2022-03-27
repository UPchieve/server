/**
 * @group database
 */
import { Ulid } from 'id128'
import { metaSetup } from '../postgres-test-hook'
import { getAvailabilityForVolunteer } from '../../models/Availability/queries'
import createNewAvailability from '../../utils/create-new-availability'

metaSetup()

test('Make a connection', async () => {
  const result = await getAvailabilityForVolunteer(Ulid.generate().toRaw())
  expect(result).toEqual(createNewAvailability())
})
