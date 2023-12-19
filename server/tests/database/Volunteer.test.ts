import {
  AdminUpdateVolunteer,
  getNextVolunteerToNotify,
  updateVolunteerForAdmin,
} from '../../models/Volunteer'
import { getUserContactInfoById } from '../../models/User'

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

test('updateVolunteerForAdmin', async () => {
  const userId = '01859800-bca8-af9e-8f1d-815bf6891cf5'
  const update: AdminUpdateVolunteer = {
    firstName: 'Partner',
    lastName: 'UPchieve',
    volunteerPartnerOrg: 'health-co',
    isVerified: true,
    isBanned: true, // changed
    isDeactivated: false,
    isApproved: true,
    email: 'volunteer1@upchieve.org',
  }
  await updateVolunteerForAdmin(userId, update)

  const resultantUser = await getUserContactInfoById(userId)
  expect(resultantUser).toMatchObject({
    id: userId,
    email: update.email,
    banned: update.isBanned,
  })
})
