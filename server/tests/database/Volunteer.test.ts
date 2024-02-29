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
import moment from 'moment'
import { getClient } from '../../db'
import { insertSingleRow } from '../db-utils'
import { buildNotification, buildSessionRow } from '../mocks/generate'
import { Ulid } from '../../models/pgUtils'

const client = getClient()
const TIMEZONE = 'EST'
let studentId = '01859800-be4b-685f-4130-8709193d461c'
let completedUnmatchedSession: any

describe('VolunteerRepo', () => {
  beforeAll(async () => {
    const sessionRow = await buildSessionRow({
      subjectId: 1,
      volunteerJoinedAt: undefined,
      studentId,
    })
    completedUnmatchedSession = await insertSingleRow(
      'sessions',
      sessionRow,
      client
    )
  })

  beforeEach(async () => {
    await client.query(`DELETE FROM upchieve.availabilities;`)
    await client.query(`DELETE FROM upchieve.users_certifications;`)
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
      expect(result).toMatchObject(
        expect.objectContaining({
          email: vol.email,
          phone: vol.phone,
          firstName: vol.firstName,
          lastName: vol.lastName,
        })
      )
    })

    it('Returns the volunteer who was not recently notified', async () => {
      const recentlyNotifiedVolunteer = await loadVolunteer(
        generateVolunteer(),
        true,
        true,
        ['prealgebra']
      )
      const expectedVolunteer = await loadVolunteer(
        generateVolunteer(),
        true,
        true,
        ['prealgebra']
      )
      await loadVolunteerAvailability(
        recentlyNotifiedVolunteer.id,
        generateFullAvailability()
      )
      await loadVolunteerAvailability(
        expectedVolunteer.id,
        generateFullAvailability()
      )

      await loadNotification(
        // 2 hours old notification
        recentlyNotifiedVolunteer.id,
        completedUnmatchedSession.id,
        moment()
          .subtract(2, 'hours')
          .toDate()
      )

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: moment()
          .subtract(3, 'hours')
          .toDate(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.id).toEqual(expectedVolunteer.id)
    })

    it('Returns the volunteer who is not disqualified', async () => {
      const v1 = await loadVolunteer(generateVolunteer(), true, true, [
        'prealgebra',
      ])
      const v2 = await loadVolunteer(generateVolunteer(), true, true, [
        'prealgebra',
      ])
      await loadVolunteerAvailability(v1.id, generateFullAvailability())
      await loadVolunteerAvailability(v2.id, generateFullAvailability())

      console.log(`Created v1=${v1.email}/${v1.id} and v2=${v2.email}/${v2.id}`)

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: [v1.id as Ulid],
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)
    })
  })
})

const generateFullAvailability = (): Availability => {
  // @TODO move to mocks/generate.ts
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
    email: faker.internet.email(),
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

const loadNotification = async (
  volunteerId: string,
  sessionId = completedUnmatchedSession.id,
  sentAt: Date = new Date()
) => {
  const notification = buildNotification({
    userId: volunteerId,
    sentAt,
    sessionId,
  })
  await insertSingleRow('notifications', notification, client)
}
