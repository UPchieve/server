import {
  Availability,
  updateAvailabilityByVolunteerId,
} from '../../models/Availability'
import { DAYS, HOURS } from '../../constants'
import faker from 'faker'
import {
  addVolunteerCertification,
  CreatedVolunteer,
  createVolunteer,
  CreateVolunteerPayload,
  getNextVolunteerToNotify,
  updateVolunteerApproved,
  updateVolunteerOnboarded,
} from '../../models/Volunteer'
import { registerVolunteer } from '../../services/AuthService'
import { getClient, getRoClient } from '../../db'
import { createUser } from '../../models/User'
import { Ulid } from '../../models/pgUtils'

const TIMEZONE = 'EST'
describe('VolunteerRepo', () => {
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

  describe('getNextVolunteerToNotify', () => {
    it('Test', async () => {
      const vol = await loadVolunteer(generateVolunteer(), true, true, [
        'prealgebra',
      ])
      await loadVolunteerAvailability(vol.id, generateFullAvailability())
      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: faker.date.past(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result).not.toBeUndefined()
      expect(result).toMatchObject(
        expect.objectContaining({
          email: vol.email,
          phone: vol.phone,
          firstName: vol.firstName,
          lastName: vol.lastName,
        })
      )
    })
  })
})

const generateFullAvailability = (): Availability => {
  const fullAvailabilityDay = {}
  for (let key of HOURS) {
    Object.assign(fullAvailabilityDay, { [key]: true })
  }

  const result = {}
  for (let key of DAYS) {
    Object.assign(result, { [key]: { ...fullAvailabilityDay } })
  }
  return result as Availability
}

const loadVolunteerAvailability = async (
  volunteerId: string,
  availability: Availability
) => {
  await updateAvailabilityByVolunteerId(volunteerId, availability, TIMEZONE)
}

const generateVolunteer = (): CreateVolunteerPayload => {
  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()
  return {
    ip: '123',
    email: `${firstName}${faker.name.middleName()}${lastName}@test.com`,
    password: 'Password!123', // pragma: allowlist secret
    phone: faker.phone.phoneNumber('+###########'),
    terms: true,
    firstName,
    lastName,
    referredBy: undefined,
    timezone: TIMEZONE,
    volunteerPartnerOrg: undefined,
  } as CreateVolunteerPayload
}

const loadVolunteer = async (
  v: any,
  onboarded = true,
  approved = true,
  certificationSubjects: string[] = []
): Promise<CreatedVolunteer> => {
  const res = await createVolunteer(v)
  if (onboarded) await updateVolunteerOnboarded(res.id)
  if (approved) await updateVolunteerApproved(res.id)
  if (certificationSubjects) {
    for (let subj of certificationSubjects) {
      await addVolunteerCertification(res.id, subj)
    }
  }
  return res
}
