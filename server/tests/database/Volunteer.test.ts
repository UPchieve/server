import {
  addVolunteerCertification,
  CreatedVolunteer,
  getNextVolunteerToNotify,
  updateVolunteerApproved,
  updateVolunteerOnboarded,
} from '../../models/Volunteer'
import {
  Availability,
  updateAvailabilityByVolunteerId,
} from '../../models/Availability'
import { DAYS, HOURS } from '../../constants'
import faker from 'faker'
import { registerVolunteer } from '../../services/AuthService'
import moment from 'moment'

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
      const vol = generateVolunteer()
      const result = await getNextVolunteerToNotify({
        subject: 'algebraOne',
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
  volunteerId,
  availability: Availability
) => {
  await updateAvailabilityByVolunteerId(volunteerId, availability, TIMEZONE)
}

const generateVolunteer = () => {
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
  }
}

const loadVolunteer = async (
  v: unknown,
  onboarded = true,
  approved = true,
  certificationSubjects: string[] = []
): Promise<CreatedVolunteer> => {
  const res = await registerVolunteer(v)
  if (onboarded) await updateVolunteerOnboarded(v.id)
  if (approved) await updateVolunteerApproved(v.id)
  if (certificationSubjects) {
    for (let subj of certificationSubjects) {
      await addVolunteerCertification(v.id, subj)
    }
  }
  return res
}
