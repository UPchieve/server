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
  updateVolunteerForAdmin,
  updateVolunteerOnboarded,
} from '../../models/Volunteer'
import moment from 'moment'
import { getClient } from '../../db'
import { insertSingleRow } from '../db-utils'
import { buildNotification, buildSessionRow } from '../mocks/generate'
import { Ulid } from '../../models/pgUtils'
import { omit } from 'lodash'
import { addFavoriteVolunteer } from '../../models/Student'

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
    it('Returns the volunteer who was not recently notified', async () => {
      const recentlyNotifiedVolunteer = await loadVolunteer()
      const expectedVolunteer = await loadVolunteer()
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
      const v1 = await loadVolunteer()
      const v2 = await loadVolunteer()

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

    it.each([
      ['banned', { banned: true }],
      ['unapproved', { approved: false }],
      ['onboarded', { onboarded: false }],
    ])('Returns the volunteer who is not %s', async (msg, opt) => {
      const v1 = await loadVolunteer(opt)
      const v2 = await loadVolunteer()

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)
    })

    it('Returns the volunteer with availability', async () => {
      const v1 = await loadVolunteer({ withFullAvailability: false })
      const v2 = await loadVolunteer()

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)

      // Make volunteer1 available every day except today
      const currentDayOfWeek = new Date().toDateString().split(' ')[0] // i.e. Mon
      const currentAvailabilityDay = DAYS.find(
        d => d.toLowerCase().slice(0, 3) == currentDayOfWeek.toLowerCase()
      )!
      const availability = omit(
        generateFullAvailability(),
        currentAvailabilityDay
      )
      await loadVolunteerAvailability(v1.id, availability as Availability)

      const result2 = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result2?.email).toEqual(v2.email)
      expect(result2?.id).toEqual(v2.id)
    })

    it('Returns the favorited volunteer', async () => {
      const v1 = await loadVolunteer()
      const v2 = await loadVolunteer()

      await addFavoriteVolunteer(studentId, v2.id)

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: [v2.id],
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)
    })

    it('Returns a partner volunteer when specificPartner is provided and isPartner=true', async () => {
      const partnerKey = 'health-co'
      const v1 = await loadVolunteer()
      const v2 = await loadVolunteer({ partner: partnerKey })

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: true,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: partnerKey,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v2.email)
      expect(result?.id).toEqual(v2.id)
    })

    it.each([undefined, false])(
      'Does not return a partner volunteer from `specificPartner` if isPartner=%s',
      async isPartner => {
        // If specificPartner is passed, it must be true that isPartner = true for it to return a volunteer.
        const partnerOrg = 'health-co'
        const vol = await loadVolunteer({ partner: partnerOrg })
        const result = await getNextVolunteerToNotify({
          subject: 'prealgebra',
          lastNotified: new Date(),
          isPartner,
          highLevelSubjects: undefined,
          disqualifiedVolunteers: undefined,
          specificPartner: partnerOrg,
          favoriteVolunteers: undefined,
        })
      }
    )

    it('Does not return a volunteer if their profile is not associated to the volunteer partner org', async () => {
      const partnerOrg = 'health-co'
      const vol = await loadVolunteer({ partner: partnerOrg })
      await client.query(
        `UPDATE volunteer_profiles SET volunteer_partner_org_id = NULL where user_id = $1`,
        [vol.id]
      )
      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: true,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: partnerOrg,
        favoriteVolunteers: undefined,
      })
      expect(result).toBeUndefined()
    })

    it('Returns the volunteer with the correct certification', async () => {
      const v1 = await loadVolunteer({ certificationSubjects: ['prealgebra'] })
      const v2 = await loadVolunteer({ certificationSubjects: ['reading'] })
      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result?.email).toEqual(v1.email)
      expect(result?.id).toEqual(v1.id)
    })

    it('Returns the volunteer without the higher-level subject when there are other volunteers available', async () => {
      // calculusAB is the high level subject
      const v1 = await loadVolunteer({
        certificationSubjects: ['prealgebra', 'calculusAB'],
      })
      const v2 = await loadVolunteer()
      const result = await getNextVolunteerToNotify({
        subject: 'chemistry',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result).toBeUndefined()
    })

    it('Returns a random volunteer when there are multiple candidates', async () => {
      // 3 candidates
      await loadVolunteer()
      await loadVolunteer()
      await loadVolunteer()
      // Run the query 5 times
      const results = []
      for (let i = 0; i < 5; i++) {
        results.push(
          await getNextVolunteerToNotify({
            subject: 'prealgebra',
            lastNotified: new Date(),
            isPartner: false,
            highLevelSubjects: undefined,
            disqualifiedVolunteers: undefined,
            specificPartner: undefined,
            favoriteVolunteers: undefined,
          })
        )
      }
      results.forEach(r => {
        expect(r).toBeDefined()
        expect(r).toHaveProperty('id')
        expect(r).toHaveProperty('email')
      })
      // Expect more than 1 unique user to be returned if the randomization is working
      const resultantIds = results.map(r => r!.id)
      expect(new Set(resultantIds).size).toBeGreaterThan(1)
    })

    it('Returns undefined when there is no suitable volunteer', async () => {
      const volunteer = await loadVolunteer() // Certified in prealgebra
      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
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

const loadVolunteer = async (opts = {}): Promise<CreatedVolunteer> => {
  const options = {
    approved: true,
    onboarded: true,
    banned: false,
    deactivated: false,
    certificationSubjects: ['prealgebra'],
    withFullAvailability: true,
    partner: undefined,
    ...opts,
  }
  const v = generateVolunteer()
  if (options.partner) {
    v.volunteerPartnerOrg = options.partner as string
  }
  const res = await createVolunteer(v)
  if (options.onboarded) await updateVolunteerOnboarded(res.id)
  if (options.certificationSubjects) {
    for (let subj of options.certificationSubjects) {
      await addVolunteerCertification(res.id, subj)
    }
  }
  if (options.withFullAvailability) {
    await loadVolunteerAvailability(res.id, generateFullAvailability())
  }
  await updateVolunteerForAdmin(res.id, {
    email: res.email,
    isVerified: true,
    isBanned: options.banned,
    isApproved: options.approved,
    isDeactivated: options.deactivated,
    firstName: undefined,
    lastName: undefined,
    volunteerPartnerOrg: options.partner,
  })
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
