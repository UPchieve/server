/**
 * @group database/sequential
 */

import {
  Availability,
  updateAvailabilityByVolunteerId,
} from '../../models/Availability'
import { DAYS } from '../../constants'
import { faker } from '@faker-js/faker'
import {
  addVolunteerCertification,
  CreatedVolunteer,
  createVolunteer,
  CreateVolunteerPayload,
  getVolunteerContactInfoById,
  getVolunteersForTextNotifications,
  getVolunteersReadyToCoachStatus,
  updateVolunteerForAdmin,
  updateVolunteerOnboarded,
  updateVolunteerTrainingById,
} from '../../models/Volunteer'
import moment from 'moment'
import { getClient } from '../../db'
import { camelCaseKeys, insertSingleRow } from '../db-utils'
import {
  buildFullAvailability,
  buildNotification,
  buildSessionRow,
} from '../mocks/generate'
import { omit } from 'lodash'
import { addFavoriteVolunteer } from '../../models/Student'
import { createTestUser, createTestVolunteer } from './seed-utils'
import { submitVolunteerBackgroundInfo } from '../../services/VolunteerService'

const client = getClient()
const TIMEZONE = 'EST'
let studentId = '01919662-885c-d39a-1749-5aaf18cf5d3b'
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

  describe('getVolunteerContactInfoById', () => {
    it('does not return a deleted volunteer', async () => {
      const user = await createTestUser(client)
      await createTestVolunteer(client, user.id, {})
      await client.query('UPDATE users SET deleted = TRUE WHERE id = $1', [
        user.id,
      ])

      const result = await getVolunteerContactInfoById(user.id)
      expect(result).toBe(undefined)
    })

    it('Filters out volunteers based on testUser', async () => {
      const volunteer = await loadVolunteer()
      const queryForVolunteer = async () => {
        return getVolunteerContactInfoById(volunteer.id, {
          testUser: false,
        })
      }
      let volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeDefined()
      await client.query('UPDATE users SET test_user = TRUE where id = $1', [
        volunteer.id,
      ])
      volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeUndefined()
    })

    it('Filters out volunteers based on banned filter if volunteer is complete-banned', async () => {
      const volunteer = await loadVolunteer()
      const queryForVolunteer = async () => {
        return getVolunteerContactInfoById(volunteer.id, {
          banned: false,
        })
      }
      let volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeDefined()
      await client.query(
        "UPDATE users SET ban_type = 'complete' where id = $1",
        [volunteer.id]
      )
      volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeUndefined()
    })

    it('Filters out volunteers based on deactivated', async () => {
      const volunteer = await loadVolunteer()
      const queryForVolunteer = async () => {
        return getVolunteerContactInfoById(volunteer.id, {
          deactivated: false,
        })
      }
      let volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeDefined()
      await client.query('UPDATE users SET deactivated = TRUE where id = $1', [
        volunteer.id,
      ])
      volunteerResult = await queryForVolunteer()
      expect(volunteerResult).toBeUndefined()
    })
  })

  describe('updateVolunteerTrainingById', () => {
    const requiredMaterials = ['7b6a76', 'jsn832', 'ps87f9', 'jgu55k', 'fj8tzq']
    const upchieve101TrainingCourseId = 1

    it('Calculates progress/complete correctly when there are no completed REQUIRED materials', async () => {
      const nonRequiredMaterial = 'some-nonrequired-material'
      const volunteer = await loadVolunteer()
      const actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        nonRequiredMaterial,
        client
      )
      expect(actual.userId).toEqual(volunteer.id)
      expect(actual.trainingCourseId).toEqual(upchieve101TrainingCourseId)
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([nonRequiredMaterial])
      expect(actual.progress).toEqual(0)

      // Now add a required material
      const secondActual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[0],
        client
      )
      expect(secondActual.userId).toEqual(volunteer.id)
      expect(secondActual.trainingCourseId).toEqual(upchieve101TrainingCourseId)
      expect(secondActual.complete).toBeFalsy()
      expect(secondActual.completedMaterials).toEqual([
        nonRequiredMaterial,
        requiredMaterials[0],
      ])
      expect(secondActual.progress).toEqual(20)
    })

    it('Calculates progress/complete correctly until complete', async () => {
      const volunteer = await loadVolunteer()
      // Complete 1/5
      let actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[0],
        client
      )
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([requiredMaterials[0]])
      expect(actual.progress).toEqual(20)
      // 2/5
      actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[1],
        client
      )
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([
        requiredMaterials[0],
        requiredMaterials[1],
      ])
      expect(actual.progress).toEqual(40)
      // 3/5
      actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[2],
        client
      )
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([
        requiredMaterials[0],
        requiredMaterials[1],
        requiredMaterials[2],
      ])
      expect(actual.progress).toEqual(60)
      // 4/5
      actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[3],
        client
      )
      expect(actual.complete).toBeFalsy()
      expect(actual.completedMaterials).toEqual([
        requiredMaterials[0],
        requiredMaterials[1],
        requiredMaterials[2],
        requiredMaterials[3],
      ])
      expect(actual.progress).toEqual(80)
      // 5/5
      actual = await updateVolunteerTrainingById(
        volunteer.id,
        'upchieve101',
        requiredMaterials,
        requiredMaterials[4],
        client
      )
      expect(actual.complete).toBeTruthy()
      expect(actual.completedMaterials).toEqual(requiredMaterials)
      expect(actual.progress).toEqual(100)
    })
  })

  describe('getVolunteersForTextNotifications', () => {
    const TEST_VPO_KEY = 'big-telecom'

    it('Returns volunteers matching the criteria', async () => {
      const eligibleVolunteer = await loadVolunteer()
      const eligiblePartnerVolunteer = await loadVolunteer({
        partner: TEST_VPO_KEY,
      })
      // Ineligible volunteers:
      // No availability
      await loadVolunteer({ withFullAvailability: false })
      // Banned
      await loadVolunteer({ banType: 'complete' })
      // Deactivated
      await loadVolunteer({ deactivated: true })
      // Not approved
      await loadVolunteer({ approved: false })
      // No SMS consent
      await loadVolunteer({ smsConsent: false })
      // Deleted
      await loadVolunteer({ deleted: true })

      const actual = await getVolunteersForTextNotifications()
      // There should only be 2 volunteers returned.
      expect(actual.map((vol) => vol.id)).toEqual([
        eligibleVolunteer.id,
        eligiblePartnerVolunteer.id,
      ])

      // Non-partner volunteer
      expect(actual[0].unlockedSubjects).toEqual(['prealgebra'])
      expect(actual[0].volunteerPartnerOrgKey).toBeUndefined()

      // Partner volunteer
      expect(actual[1].unlockedSubjects).toEqual(['prealgebra'])
      expect(actual[1].volunteerPartnerOrgKey).toEqual(TEST_VPO_KEY)

      // Now remove the phone number for one of the volunteers and make sure they are no longer returned
      // in the query results
      await client.query('UPDATE users SET phone = NULL WHERE id = ANY ($1)', [
        [eligibleVolunteer.id, eligiblePartnerVolunteer.id],
      ])
      const newResults = await getVolunteersForTextNotifications()
      expect(newResults.length).toEqual(0)
    })

    // @TODO: This test could technically be flaky if it runs on the cusp of an hour. There might be a way we could mock the time in postgres.
    it.todo(
      'Only returns volunteers with availability that includes this current hour'
    )
  })

  describe('createVolunteer', () => {
    it('Defaults sms_consent to true', async () => {
      const result = await createVolunteer(
        {
          email: faker.internet.email(),
          phone: faker.phone.number(),
          firstName: faker.string.alpha(),
          lastName: faker.string.alpha(),
          password: faker.internet.password(),
          volunteerPartnerOrg: undefined,
          timezone: undefined,
        },
        client
      )
      expect(result.smsConsent).toEqual(true)
    })
  })

  describe('getVolunteersReadyToCoachStatus', () => {
    it('Pulls the correct information', async () => {
      const vol1 = await loadVolunteer({
        banType: null,
        approved: false,
        onboarded: true,
      })
      const vol2 = await loadVolunteer({
        banType: 'shadow',
        approved: true,
        onboarded: true,
      })
      const actual = await getVolunteersReadyToCoachStatus(
        [vol1.id, vol2.id],
        client
      )
      expect(actual.length).toEqual(2)
      const vol1Actual = actual.find((vol) => vol.id === vol1.id)
      const vol2Actual = actual.find((vol) => vol.id === vol2.id)
      expect(vol1Actual).toEqual({
        id: vol1.id,
        isApproved: false,
        isOnboarded: true,
        banType: undefined,
      })
      expect(vol2Actual).toEqual({
        id: vol2.id,
        isApproved: true,
        isOnboarded: true,
        banType: 'shadow',
      })
    })
  })

  describe('submitVolunteerBackgroundInfo', () => {
    it.todo('Saves all the expected fields')
    it('Does not overwrite fields when given null or undefined values', async () => {
      const volunteer = await loadVolunteer()
      const originalExperience = {
        collegeCounseling: '0-1 years',
        mentoring: '0-1 years',
        tutoring: '0-1 years',
      }
      const company = 'test company'
      const college = 'test college'
      const originalLinkedInUrl = 'testlinkedinurl'
      const originalLanguages = ['Spanish', 'German']
      // Set profile
      await client.query(
        'UPDATE volunteer_profiles SET company = $1, college = $2, linkedin_url = $3, languages = $4, experience = $5 WHERE user_id = $6',
        [
          company,
          college,
          originalLinkedInUrl,
          originalLanguages,
          originalExperience,
          volunteer.id,
        ]
      )
      // Set occupations
      await client.query(
        'INSERT INTO volunteer_occupations (user_id, occupation) VALUES ($1, $2)',
        [volunteer.id, 'High school student']
      )
      await client.query(
        'INSERT INTO volunteer_occupations (user_id, occupation) VALUES ($1, $2)',
        [volunteer.id, 'Working part-time']
      )
      // Set user
      const phoneNumber = '+18608770029'
      const signupSourceId = 1
      const otherSignupSource = null
      await client.query(
        'UPDATE users SET phone = $1, signup_source_id = $2, other_signup_source = $3 where id = $4',
        [phoneNumber, signupSourceId, otherSignupSource, volunteer.id]
      )
      const existingSchool = await client.query('SELECT * FROM schools LIMIT 1')
      const update = {
        highSchoolId: existingSchool.rows[0].id,
        experience: {
          collegeCounseling: '0-1 years',
          mentoring: '1-2 years',
          tutoring: '2-5 years',
        },
        languages: ['English', 'Cantonese'],
        linkedInUrl: 'test-url',
      }
      await submitVolunteerBackgroundInfo(volunteer.id, update)
      const volunteerUser = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [volunteer.id]
      )
      const volunteerProfile = await client.query(
        'SELECT * FROM volunteer_profiles WHERE user_id = $1',
        [volunteer.id]
      )
      const volunteerOccupations = await client.query(
        'SELECT * FROM volunteer_occupations WHERE user_id = $1',
        [volunteer.id]
      )
      const volunteerSchool = await client.query(
        'SELECT * FROM users_schools WHERE user_id = $1',
        [volunteer.id]
      )

      // High school is added
      expect(volunteerSchool.rowCount).toEqual(1)
      expect(volunteerSchool.rows[0].school_id).toEqual(
        existingSchool.rows[0].id
      )
      // LinkedIn URL, languages, and volunteer experience are updated
      expect(volunteerProfile.rowCount).toEqual(1)
      expect(camelCaseKeys(volunteerProfile.rows[0])).toEqual(
        expect.objectContaining({
          linkedinUrl: update.linkedInUrl,
          languages: update.languages,
          experience: update.experience,
        })
      )
      // The rest are unchanged
      expect(camelCaseKeys(volunteerProfile.rows[0])).toEqual(
        expect.objectContaining({
          company,
          college,
        })
      )
      expect(camelCaseKeys(volunteerUser.rows[0])).toEqual(
        expect.objectContaining({
          phone: phoneNumber,
          signupSourceId,
          otherSignupSource,
        })
      )
      const finalOccupations = volunteerOccupations.rows.map(
        (row) => row.occupation
      )
      expect(finalOccupations).toEqual([
        'High school student',
        'Working part-time',
      ])
    })
  })
})

const loadVolunteerAvailability = async (
  volunteerId: string,
  availability: Availability
) => {
  await updateAvailabilityByVolunteerId(
    volunteerId,
    availability,
    TIMEZONE,
    client
  )
}

const generateVolunteer = (): CreateVolunteerPayload => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    ip: '123',
    email: faker.internet.email(),
    password: 'Password!123', // pragma: allowlist secret
    phone: faker.phone.number(),
    terms: true,
    firstName,
    lastName,
    timezone: TIMEZONE,
    volunteerPartnerOrg: undefined,
  } as CreateVolunteerPayload
}

const loadVolunteer = async (opts = {}): Promise<CreatedVolunteer> => {
  const options = {
    approved: true,
    onboarded: true,
    deactivated: false,
    deleted: false,
    certificationSubjects: ['prealgebra'],
    withFullAvailability: true,
    partner: undefined,
    banType: undefined,
    smsConsent: true,
    ...opts,
  }
  const v = generateVolunteer()
  if (options.partner) {
    v.volunteerPartnerOrg = options.partner as string
  }
  const res = await createVolunteer(v, client)
  await client.query('UPDATE users SET sms_consent = $1 where id = $2', [
    options.smsConsent,
    res.id,
  ])
  if (options.deleted) {
    await client.query('UPDATE users SET deleted = $1 where id = $2', [
      options.deleted,
      res.id,
    ])
  }
  if (options.onboarded) await updateVolunteerOnboarded(res.id, client)
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
    isApproved: options.approved,
    isDeactivated: options.deactivated,
    firstName: undefined,
    lastName: undefined,
    volunteerPartnerOrg: options.partner,
    banType: options.banType,
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
