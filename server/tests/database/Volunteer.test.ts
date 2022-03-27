/**
 * @group database
 */

import { metaSetup } from '../postgres-test-hook'
import { getNextOpenVolunteerToNotify } from '../../models/Volunteer/queries'

metaSetup()

test('Make a connection', async () => {
  const result = await getNextOpenVolunteerToNotify('algebraOne', new Date())
  expect(result).toBeUndefined()
})
