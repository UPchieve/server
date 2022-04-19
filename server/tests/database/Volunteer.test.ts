/**
 * @group database
 */

import { metaSetup } from '../postgres-test-hook'
import { getNextVolunteerToNotify } from '../../models/Volunteer'

metaSetup()

test('Make a connection', async () => {
  const result = await getNextVolunteerToNotify({
    subject: 'algebraOne',
    lastNotified: new Date(),
    isPartner: false,
    highLevelSubjects: undefined,
    disqualifiedVolunteers: undefined,
    specificPartner: undefined,
    favoriteVolunteers: undefined,
  })
  expect(result).toBeUndefined()
})
