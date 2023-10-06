import { getNextVolunteersToNotify } from '../../models/Volunteer'

test('Make a connection', async () => {
  const result = await getNextVolunteersToNotify({
    subject: 'algebraOne',
    lastNotified: new Date(),
    isPartner: false,
    highLevelSubjects: undefined,
    disqualifiedVolunteers: undefined,
    specificPartner: undefined,
    favoriteVolunteers: undefined,
    maxCandidateVolunteers: 5
  })
  expect(result).toBeUndefined()
})
