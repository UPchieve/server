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
import {
  buildFullAvailability,
  buildNotification,
  buildSessionRow,
} from '../mocks/generate'
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
        disqualifiedVolunteers: [v1.id],
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
      const availability = omit(buildFullAvailability(), currentAvailabilityDay)
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

    it('Returns the favorited volunteer who is available', async () => {
      const v1 = await loadVolunteer()
      const v2 = await loadVolunteer()

      await addFavoriteVolunteer(studentId, v1.id)
      await addFavoriteVolunteer(studentId, v2.id)

      const result = await getNextVolunteerToNotify({
        subject: 'prealgebra',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: [v2.id],
        specificPartner: undefined,
        favoriteVolunteers: [v1.id, v2.id],
      })
      expect(result?.email).toEqual(v1.email)
      expect(result?.id).toEqual(v1.id)
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
        subject: 'reading',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      })
      expect(result).toBeUndefined()
    })

    it('Returns undefined when there is no suitable volunteer', async () => {
      const opts = {
        subject: 'reading',
        lastNotified: new Date(),
        isPartner: false,
        highLevelSubjects: undefined,
        disqualifiedVolunteers: undefined,
        specificPartner: undefined,
        favoriteVolunteers: undefined,
      }
      const runQuery = async (opts: any) => getNextVolunteerToNotify(opts)

      // No certification in reading
      await loadVolunteer()
      // Certified but no availability
      await loadVolunteer({
        certificationSubjects: ['reading'],
        withFullAvailability: false,
      })
      // Must be approved, onboarded, and not banned
      await loadVolunteer({
        approved: false,
        certificationSubjects: ['reading'],
      })
      await loadVolunteer({
        onboarded: false,
        certificationSubjects: ['reading'],
      })
      await loadVolunteer({ banned: true, certificationSubjects: ['reading'] })
      expect(await runQuery(opts)).toBeUndefined()

      // No eligible volunteer who is not disqualified
      const volunteer = await loadVolunteer({
        certificationSubjects: ['reading'],
      })
      expect(
        await runQuery({ ...opts, disqualifiedVolunteers: [volunteer.id] })
      ).toBeUndefined()
    })

    it('Returns a random volunteer when there are multiple suitable candidates', async () => {
      // Testing randomization here. There *is* a chance that the same volunteer is selected twice randomly,
      // To mitigate the chances of that, this loads several volunteers and does multiple trials.
      await loadVolunteer()
      await loadVolunteer()
      await loadVolunteer()
      await loadVolunteer()
      await loadVolunteer()
      const runQuery = async () =>
        await getNextVolunteerToNotify({
          subject: 'prealgebra',
          lastNotified: new Date(),
          isPartner: false,
          highLevelSubjects: undefined,
          disqualifiedVolunteers: undefined,
          specificPartner: undefined,
          favoriteVolunteers: undefined,
        })
      const result1 = await runQuery()
      const result2 = await runQuery()
      expect(result1?.id).toBeDefined()
      expect(result2?.id).toBeDefined()
      expect(result1?.id).not.toEqual(result2?.id)
    })
  })
})

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
    await loadVolunteerAvailability(res.id, buildFullAvailability())
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
