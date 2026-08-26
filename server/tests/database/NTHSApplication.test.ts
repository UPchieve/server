/**
 * @group database/parallel
 */

import { mocked } from 'jest-mock'
import * as PgClient from '../../db'
import { getClient } from '../../db'
import { getUuid, Ulid } from '../../models/pgUtils'
import { getName } from '../mocks/generate'
import { createTestUser, createTestVolunteer } from './seed-utils'
import * as NTHSApplicationService from '../../services/NTHSApplicationService'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'
import { NTHSApplicationNotEligibleError } from '../../services/NTHSApplicationService'
import { NTHSCandidateApplicationStatus } from '../../models/NTHSGroups'
import { GRADES, USER_BAN_TYPES } from '../../constants/user'
import {
  InputError,
  NotAllowedError,
  NTHSApplicationExistsError,
  NTHSSchoolAlreadyClaimedError,
  NTHSChapterSchoolFixedError,
} from '../../models/Errors'

jest.mock('../../services/MailService')

const client = getClient()

const RESPONSES = {
  whyStartChapter: 'I want to build a chapter at my school',
  leadershipExperience: 'I captained the debate team',
  recruitmentIdea: 'Announce it at the club fair',
  motivatingCoaches: 'Monthly recognition for the top tutors',
  commitWeeklyHours: true,
  commitFoundingPresident: true,
  commitMonthlyMeetings: true,
  commitRecruitHighSchoolersOnly: true,
}

const UNLISTED_SCHOOL = {
  name: 'A School Not In Our Data',
  city: 'Denver',
  state: 'CO',
}

type CoachOverrides = {
  banType?: USER_BAN_TYPES
  occupation?: string
  approved?: boolean
  onboarded?: boolean
  withSession?: boolean
  timeTutored?: number
}

async function createSchool(): Promise<Ulid> {
  const result = await client.query(
    `INSERT INTO schools (id, name, city_id) VALUES (gen_random_uuid(), $1, 1) RETURNING id`,
    [getName()]
  )
  return result.rows[0].id
}

async function createEligibleCoach(
  overrides: CoachOverrides = {}
): Promise<Ulid> {
  const user = await createTestUser(client, { banType: overrides.banType })
  await createTestVolunteer(client, user.id)
  // getUserContactInfo, which the approve/deny emails go through, refuses a
  // user with no role.
  await client.query(
    `INSERT INTO users_roles (user_id, role_id) SELECT $1, id FROM user_roles WHERE name = 'volunteer'`,
    [user.id]
  )
  await client.query(
    `UPDATE volunteer_profiles SET approved = $2, onboarded = $3 WHERE user_id = $1`,
    [user.id, overrides.approved ?? true, overrides.onboarded ?? true]
  )
  await client.query(
    `INSERT INTO volunteer_occupations (user_id, occupation) VALUES ($1, $2)`,
    [user.id, overrides.occupation ?? 'A high school student']
  )

  if (overrides.withSession ?? true) {
    const student = await createTestUser(client)
    const subject = await client.query(`SELECT id FROM subjects LIMIT 1`)
    await client.query(
      `INSERT INTO sessions (id, student_id, volunteer_id, subject_id, time_tutored)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
      [
        student.id,
        user.id,
        subject.rows[0].id,
        overrides.timeTutored ?? 1200000,
      ]
    )
  }

  return user.id
}

async function setGradeLevel(userId: Ulid, grade: GRADES, updatedAt: string) {
  await client.query(
    `INSERT INTO users_grade_levels (user_id, signup_grade_level_id, grade_level_id, updated_at)
     SELECT $1, id, id, $3 FROM grade_levels WHERE name = $2`,
    [userId, grade, updatedAt]
  )
}

async function gradeLevelOf(userId: Ulid): Promise<string | undefined> {
  const result = await client.query(
    `SELECT gl.name FROM users_grade_levels ugl
     JOIN grade_levels gl ON gl.id = ugl.grade_level_id
     WHERE ugl.user_id = $1`,
    [userId]
  )
  return result.rows[0]?.name
}

async function applicationRows(userId: Ulid) {
  return (
    await client.query(
      `SELECT * FROM nths_candidate_applications WHERE user_id = $1 ORDER BY id`,
      [userId]
    )
  ).rows
}

async function submit(userId: Ulid, overrides: Record<string, unknown> = {}) {
  return NTHSApplicationService.submitCandidateApplication({
    userId,
    unlistedSchool: UNLISTED_SCHOOL,
    gradeLevel: GRADES.TENTH,
    responses: RESPONSES,
    ...overrides,
  } as any)
}

async function affiliationOf(groupId: Ulid) {
  const result = await client.query(
    `SELECT statuses.name AS status, aff.school_id
       FROM nths_group_school_affiliation aff
       JOIN nths_school_affiliation_statuses statuses
         ON statuses.id = aff.nths_school_affiliation_status_id
      WHERE aff.nths_group_id = $1`,
    [groupId]
  )
  return result.rows[0]
}

// Mirrors the rows approved in March 2026, before any of this existed: an
// activated application the collision check never got to see.
async function activateOutsideTheService(userId: Ulid) {
  await client.query(
    `UPDATE nths_candidate_applications
        SET status = 'approved', decided_at = NOW(), activated_at = NOW()
      WHERE user_id = $1`,
    [userId]
  )
}

// nths_advisors.email is UNIQUE, so a fixed address fails on any re-run against
// a database that already holds one.
function advisorDetails() {
  return {
    firstName: 'Dana',
    lastName: 'Reyes',
    email: `advisor.${getUuid()}@example.edu`,
    title: 'Advisor',
  }
}

describe('submitCandidateApplication', () => {
  test('stores the application and records the grade level', async () => {
    const userId = await createEligibleCoach()
    const schoolId = await createSchool()

    const application = await submit(userId, {
      schoolId,
      unlistedSchool: undefined,
      gradeLevel: GRADES.ELEVENTH,
    })

    expect(application.status).toBe(NTHSCandidateApplicationStatus.applied)
    expect(application.schoolId).toBe(schoolId)
    expect(application.formVersion).toBe(1)
    expect(application.responses).toEqual(RESPONSES)
    expect(application.decidedAt).toBeUndefined()
    expect(await gradeLevelOf(userId)).toBe(GRADES.ELEVENTH)
  })

  test('keeps the described school when none was matched', async () => {
    const userId = await createEligibleCoach()

    const application = await submit(userId, {
      unlistedSchool: {
        name: '  Somewhere High  ',
        city: '  Boulder ',
        state: 'co',
        website: 'somewherehigh.org',
      },
    })

    expect(application.schoolId).toBeUndefined()
    expect(application.unlistedSchool).toEqual({
      name: 'Somewhere High',
      city: 'Boulder',
      state: 'CO',
      website: 'https://somewherehigh.org/',
    })
  })

  test('drops the described school when a real one was matched', async () => {
    const userId = await createEligibleCoach()
    const schoolId = await createSchool()

    const application = await submit(userId, {
      schoolId,
      unlistedSchool: UNLISTED_SCHOOL,
    })

    expect(application.schoolId).toBe(schoolId)
    expect(application.unlistedSchool).toBeUndefined()
  })

  test.each([
    ['a missing name', { city: 'Denver', state: 'CO' }],
    ['a blank name', { name: '  ', city: 'Denver', state: 'CO' }],
    ['a missing city', { name: 'Somewhere High', state: 'CO' }],
    [
      'an unknown state',
      { name: 'Somewhere High', city: 'Denver', state: 'ZZ' },
    ],
    [
      'a non-http website',
      {
        name: 'Somewhere High',
        city: 'Denver',
        state: 'CO',
        website: 'javascript:alert(1)',
      },
    ],
    [
      'an unexpected field',
      {
        name: 'Somewhere High',
        city: 'Denver',
        state: 'CO',
        country: 'Canada',
      },
    ],
    ['a non-object', ['Somewhere High']],
  ])('rejects school details with %s', async (_label, unlistedSchool) => {
    const userId = await createEligibleCoach()

    await expect(submit(userId, { unlistedSchool })).rejects.toThrow(InputError)
    expect(await applicationRows(userId)).toHaveLength(0)
  })

  test.each<[string, CoachOverrides | 'notAVolunteer']>([
    ['not a volunteer', 'notAVolunteer'],
    ['not a high school student', { occupation: 'A college student' }],
    ['not approved', { approved: false }],
    ['not onboarded', { onboarded: false }],
    ['completely banned', { banType: USER_BAN_TYPES.COMPLETE }],
    ['shadow banned', { banType: USER_BAN_TYPES.SHADOW }],
    ['without any sessions', { withSession: false }],
    ['whose only session never ran', { timeTutored: 0 }],
  ])('rejects an applicant %s', async (_label, overrides) => {
    const userId =
      overrides === 'notAVolunteer'
        ? (await createTestUser(client)).id
        : await createEligibleCoach(overrides)

    await expect(submit(userId)).rejects.toThrow(
      NTHSApplicationNotEligibleError
    )
    expect(await applicationRows(userId)).toHaveLength(0)
  })

  test('does not disclose why an applicant is ineligible', async () => {
    const userId = await createEligibleCoach({
      banType: USER_BAN_TYPES.SHADOW,
    })

    // A shadow-banned user learning they are shadow banned defeats the ban.
    await expect(submit(userId)).rejects.toMatchObject({
      httpStatus: 403,
      clientMessage: expect.not.stringContaining('ban'),
    })
  })

  test('rejects a grade level outside high school', async () => {
    const userId = await createEligibleCoach()

    await expect(
      submit(userId, { gradeLevel: GRADES.COLLEGE })
    ).rejects.toThrow(InputError)
    expect(await applicationRows(userId)).toHaveLength(0)
  })

  test.each([
    [
      'a missing attestation',
      { ...RESPONSES, commitMonthlyMeetings: undefined },
    ],
    ['a refused attestation', { ...RESPONSES, commitWeeklyHours: false }],
    ['a missing required answer', { ...RESPONSES, whyStartChapter: '' }],
    ['an answer that is not text', { ...RESPONSES, recruitmentIdea: 42 }],
    [
      'an answer past the length cap',
      {
        ...RESPONSES,
        whyStartChapter: 'x'.repeat(2001),
      },
    ],
    ['a key the form never asked for', { ...RESPONSES, sneaky: 'payload' }],
  ])('rejects %s', async (_label, responses) => {
    const userId = await createEligibleCoach()

    await expect(submit(userId, { responses })).rejects.toThrow(InputError)
    expect(await applicationRows(userId)).toHaveLength(0)
  })

  test('rejects an application with no school at all', async () => {
    const userId = await createEligibleCoach()

    await expect(submit(userId, { unlistedSchool: undefined })).rejects.toThrow(
      InputError
    )
    expect(await applicationRows(userId)).toHaveLength(0)
  })

  test('rejects a well-formed school id that is not a real school', async () => {
    const userId = await createEligibleCoach()

    // The id reaches two foreign keys if nothing checks it first, and the
    // resulting Repo error is unmapped, so the client gets a 500 naming the
    // table and constraint.
    const error = await submit(userId, {
      schoolId: getUuid(),
      unlistedSchool: undefined,
    }).catch((err) => err)

    expect(error).toBeInstanceOf(InputError)
    expect(error.message).not.toMatch(/users_schools|foreign key|constraint/)
    expect(await applicationRows(userId)).toHaveLength(0)
  })

  test('accepts a second pending application for the same school', async () => {
    const schoolId = await createSchool()
    const first = await createEligibleCoach()
    const second = await createEligibleCoach()

    await submit(first, { schoolId, unlistedSchool: undefined })
    await submit(second, { schoolId, unlistedSchool: undefined })

    expect(await applicationRows(first)).toHaveLength(1)
    expect(await applicationRows(second)).toHaveLength(1)
  })

  test('rejects a second pending application from the same user', async () => {
    const userId = await createEligibleCoach()
    await submit(userId, {
      schoolId: await createSchool(),
      unlistedSchool: undefined,
    })

    await expect(
      submit(userId, {
        schoolId: await createSchool(),
        unlistedSchool: undefined,
      })
    ).rejects.toThrow(NTHSApplicationExistsError)
  })

  test('rejects a resubmission from an applicant holding an unused approval', async () => {
    const userId = await createEligibleCoach()
    await submit(userId)
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.approved,
    })

    // The window before they found the chapter, when no group membership exists
    // to catch them. Unblocked, the new 'applied' row outranks the approval by
    // created_at and takes away the chapter they had just earned.
    await expect(submit(userId)).rejects.toThrow(NTHSApplicationExistsError)
    expect(await applicationRows(userId)).toHaveLength(1)
  })

  test('rejects a resubmission from someone already running a chapter', async () => {
    const userId = await createEligibleCoach()
    await submit(userId)
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.approved,
    })
    await NTHSGroupsService.foundGroup(userId)

    await expect(submit(userId)).rejects.toThrow(NTHSApplicationExistsError)
  })

  test('rejects an application from a member who joined someone else s chapter', async () => {
    const president = await createEligibleCoach()
    await submit(president)
    await NTHSApplicationService.decideCandidateApplication({
      userId: president,
      status: NTHSCandidateApplicationStatus.approved,
    })
    const group = await NTHSGroupsService.foundGroup(president)

    // A member who joined by invite code never applied, so they have no
    // activation; membership is the only thing that catches them.
    const member = await createEligibleCoach()
    await NTHSGroupsService.joinGroupAsMemberByGroupId(
      member,
      group.groupInfo.id
    )

    await expect(submit(member)).rejects.toThrow(NTHSApplicationExistsError)
  })

  test('lets a denied applicant apply again right away', async () => {
    const userId = await createEligibleCoach()
    await submit(userId)
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.denied,
      deniedNotes: 'Not enough sessions yet',
    })

    // activation_requires_approval keeps activated_at null on a denial, and a
    // denial joins no chapter, so neither half of the block sees them.
    await expect(submit(userId)).resolves.toBeDefined()
  })

  test('lets two unmatched-school applicants through', async () => {
    const first = await createEligibleCoach()
    const second = await createEligibleCoach()

    await submit(first)
    await submit(second)

    expect(await applicationRows(first)).toHaveLength(1)
    expect(await applicationRows(second)).toHaveLength(1)
  })

  test('rolls the grade level back when the insert is rejected', async () => {
    const userId = await createEligibleCoach()
    await submit(userId, { gradeLevel: GRADES.NINTH })
    expect(await gradeLevelOf(userId)).toBe(GRADES.NINTH)

    // db-mocks-setup replaces runInTransaction with a passthrough that issues
    // no BEGIN, so without a real transaction here the rollback cannot be
    // observed and the grade would survive the failed submit.
    mocked(PgClient).runInTransaction.mockImplementationOnce(async (cb) => {
      const tc = await (global as any).__TEST_DB_CLIENT__.connect()
      try {
        await tc.query('BEGIN')
        const result = await cb(tc)
        await tc.query('COMMIT')
        return result
      } catch (err) {
        await tc.query('ROLLBACK')
        throw err
      } finally {
        tc.release()
      }
    })

    await expect(
      submit(userId, { gradeLevel: GRADES.TWELVETH })
    ).rejects.toThrow(NTHSApplicationExistsError)
    expect(await gradeLevelOf(userId)).toBe(GRADES.NINTH)
  })

  test('reports the grade advanced by academic year, not the stored one', async () => {
    const userId = await createEligibleCoach()
    await setGradeLevel(userId, GRADES.NINTH, '2023-09-15')

    const { currentGradeName } =
      await NTHSApplicationService.getApplicationEligibility(userId)

    expect(currentGradeName).toBe(GRADES.TWELVETH)
  })

  test('reports no grade for an applicant who has never given one', async () => {
    const userId = await createEligibleCoach()

    const { eligible, currentGradeName } =
      await NTHSApplicationService.getApplicationEligibility(userId)

    expect(eligible).toBe(true)
    expect(currentGradeName).toBeUndefined()
  })
})

describe('getLatestCandidateApplication', () => {
  test('returns nothing when the user has never applied', async () => {
    const userId = await createEligibleCoach()
    await expect(
      NTHSApplicationService.getLatestCandidateApplication(userId)
    ).resolves.toBeUndefined()
  })

  test('returns the most recent application', async () => {
    const userId = await createEligibleCoach()
    await submit(userId)

    const application =
      await NTHSApplicationService.getLatestCandidateApplication(userId)

    expect(application?.status).toBe(NTHSCandidateApplicationStatus.applied)
    expect(application?.responses).toEqual(RESPONSES)
  })
})

describe('decideCandidateApplication', () => {
  test('updates the row in place and frees the school', async () => {
    const schoolId = await createSchool()
    const applicant = await createEligibleCoach()
    await submit(applicant, { schoolId, unlistedSchool: undefined })

    const decided = await NTHSApplicationService.decideCandidateApplication({
      userId: applicant,
      status: NTHSCandidateApplicationStatus.approved,
    })

    expect(decided.status).toBe(NTHSCandidateApplicationStatus.approved)
    expect(decided.decidedAt).toBeDefined()
    expect(await applicationRows(applicant)).toHaveLength(1)

    const next = await createEligibleCoach()
    await expect(
      submit(next, { schoolId, unlistedSchool: undefined })
    ).resolves.toBeDefined()
  })

  test('stamps activated_at on an approval and leaves it null on a denial', async () => {
    const approved = await createEligibleCoach()
    await submit(approved)
    const approval = await NTHSApplicationService.decideCandidateApplication({
      userId: approved,
      status: NTHSCandidateApplicationStatus.approved,
    })

    const denied = await createEligibleCoach()
    await submit(denied)
    const denial = await NTHSApplicationService.decideCandidateApplication({
      userId: denied,
      status: NTHSCandidateApplicationStatus.denied,
      deniedNotes: 'Not enough sessions yet',
    })

    expect(approval.activatedAt).toBeDefined()
    // activation_requires_approval rejects the row outright if this is set.
    expect(denial.activatedAt).toBeUndefined()
  })

  test('records denial notes', async () => {
    const applicant = await createEligibleCoach()
    await submit(applicant)

    const decided = await NTHSApplicationService.decideCandidateApplication({
      userId: applicant,
      status: NTHSCandidateApplicationStatus.denied,
      deniedNotes: 'Not enough sessions yet',
    })

    expect(decided.status).toBe(NTHSCandidateApplicationStatus.denied)
    const rows = await applicationRows(applicant)
    expect(rows).toHaveLength(1)
    expect(rows[0].denied_notes).toBe('Not enough sessions yet')
  })

  test('refuses to deny without a reason', async () => {
    const applicant = await createEligibleCoach()
    await submit(applicant)

    // reason_required_when_denied would otherwise surface as a 500.
    await expect(
      NTHSApplicationService.decideCandidateApplication({
        userId: applicant,
        status: NTHSCandidateApplicationStatus.denied,
        deniedNotes: '  ',
      })
    ).rejects.toThrow(InputError)
  })

  test('approves even when the caller passes denial notes', async () => {
    const applicant = await createEligibleCoach()
    await submit(applicant)

    // reason_must_be_null_when_not_denied would otherwise surface as a 500.
    const decided = await NTHSApplicationService.decideCandidateApplication({
      userId: applicant,
      status: NTHSCandidateApplicationStatus.approved,
      deniedNotes: 'left over in the form',
    })

    expect(decided.status).toBe(NTHSCandidateApplicationStatus.approved)
    expect(decided.deniedNotes).toBeUndefined()
  })

  test('refuses to decide an application twice', async () => {
    const applicant = await createEligibleCoach()
    await submit(applicant)
    await NTHSApplicationService.decideCandidateApplication({
      userId: applicant,
      status: NTHSCandidateApplicationStatus.approved,
    })

    await expect(
      NTHSApplicationService.decideCandidateApplication({
        userId: applicant,
        status: NTHSCandidateApplicationStatus.denied,
        deniedNotes: 'changed my mind',
      })
    ).rejects.toThrow(InputError)

    const rows = await applicationRows(applicant)
    expect(rows).toHaveLength(1)
    expect(rows[0].status).toBe(NTHSCandidateApplicationStatus.approved)
  })

  test('refuses to decide an application back to applied', async () => {
    const applicant = await createEligibleCoach()
    await submit(applicant)

    await expect(
      NTHSApplicationService.decideCandidateApplication({
        userId: applicant,
        status: NTHSCandidateApplicationStatus.applied,
      })
    ).rejects.toThrow(InputError)
  })
})

describe('foundGroup', () => {
  test('refuses to create a chapter without an activated application', async () => {
    const userId = await createEligibleCoach()

    // The route only identifies the caller, so this is the only thing standing
    // between any authenticated user and their own chapter.
    await expect(NTHSGroupsService.foundGroup(userId)).rejects.toThrow(
      NotAllowedError
    )
  })

  test('refuses while the application is still pending', async () => {
    const userId = await createEligibleCoach()
    await submit(userId)

    await expect(NTHSGroupsService.foundGroup(userId)).rejects.toThrow(
      NotAllowedError
    )
  })

  test('allows a chapter once the application is approved', async () => {
    const userId = await createEligibleCoach()
    await submit(userId)
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.approved,
    })

    const group = await NTHSGroupsService.foundGroup(userId)

    expect(group.groupInfo.id).toBeDefined()
  })

  test('refuses after a denial', async () => {
    const userId = await createEligibleCoach()
    await submit(userId)
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.denied,
      deniedNotes: 'Not enough sessions yet',
    })

    await expect(NTHSGroupsService.foundGroup(userId)).rejects.toThrow(
      NotAllowedError
    )
  })

  test('puts the school on record as UNAFFILIATED', async () => {
    const userId = await createEligibleCoach()
    const schoolId = await createSchool()
    await submit(userId, { schoolId })
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.approved,
    })

    const group = await NTHSGroupsService.foundGroup(userId)

    expect(group.schoolAffiliationStatus).toBe('UNAFFILIATED')
    expect(await affiliationOf(group.groupInfo.id)).toEqual({
      status: 'UNAFFILIATED',
      school_id: schoolId,
    })
  })

  test('leaves a manual-entry chapter with no affiliation row', async () => {
    const userId = await createEligibleCoach()
    await submit(userId)
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.approved,
    })

    const group = await NTHSGroupsService.foundGroup(userId)

    expect(group.schoolAffiliationStatus).toBeNull()
    expect(await affiliationOf(group.groupInfo.id)).toBeUndefined()
  })

  test('refuses a second chapter for a school another chapter holds', async () => {
    const schoolId = await createSchool()
    const first = await createEligibleCoach()
    await submit(first, { schoolId })
    await NTHSApplicationService.decideCandidateApplication({
      userId: first,
      status: NTHSCandidateApplicationStatus.approved,
    })
    await NTHSGroupsService.foundGroup(first)

    const second = await createEligibleCoach()
    await submit(second, { schoolId })
    await activateOutsideTheService(second)

    await expect(NTHSGroupsService.foundGroup(second)).rejects.toThrow(
      NTHSSchoolAlreadyClaimedError
    )
  })

  test('allows two manual-entry chapters, since neither names a school', async () => {
    const first = await createEligibleCoach()
    await submit(first)
    await NTHSApplicationService.decideCandidateApplication({
      userId: first,
      status: NTHSCandidateApplicationStatus.approved,
    })
    await NTHSGroupsService.foundGroup(first)

    const second = await createEligibleCoach()
    await submit(second)
    await NTHSApplicationService.decideCandidateApplication({
      userId: second,
      status: NTHSCandidateApplicationStatus.approved,
    })

    await expect(NTHSGroupsService.foundGroup(second)).resolves.toBeDefined()
  })

  test('refuses to move a chapter off the school founding claimed', async () => {
    const userId = await createEligibleCoach()
    const schoolId = await createSchool()
    const otherSchoolId = await createSchool()
    await submit(userId, { schoolId })
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.approved,
    })
    const group = await NTHSGroupsService.foundGroup(userId)

    await expect(
      NTHSGroupsService.submitSchoolAffiliation({
        nthsGroupId: group.groupInfo.id,
        schoolId: otherSchoolId,
        ...advisorDetails(),
      })
    ).rejects.toThrow(NTHSChapterSchoolFixedError)

    // Moving the school would release the old one for another chapter to take.
    expect((await affiliationOf(group.groupInfo.id)).school_id).toBe(schoolId)
  })

  test('lets a school-less chapter name its school on the advisor form', async () => {
    const userId = await createEligibleCoach()
    const schoolId = await createSchool()
    await submit(userId)
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.approved,
    })
    const group = await NTHSGroupsService.foundGroup(userId)

    await NTHSGroupsService.submitSchoolAffiliation({
      nthsGroupId: group.groupInfo.id,
      schoolId,
      ...advisorDetails(),
    })

    expect((await affiliationOf(group.groupInfo.id)).school_id).toBe(schoolId)
  })

  test('keeps the school when the advisor form is submitted without one', async () => {
    const userId = await createEligibleCoach()
    const schoolId = await createSchool()
    await submit(userId, { schoolId })
    await NTHSApplicationService.decideCandidateApplication({
      userId,
      status: NTHSCandidateApplicationStatus.approved,
    })
    const group = await NTHSGroupsService.foundGroup(userId)

    // What the form's "(Skip) My school isn't listed" button posts.
    await NTHSGroupsService.submitSchoolAffiliation({
      nthsGroupId: group.groupInfo.id,
      ...advisorDetails(),
    })

    expect((await affiliationOf(group.groupInfo.id)).school_id).toBe(schoolId)
  })
})

describe('approving an application whose school is already claimed', () => {
  test('refuses when another chapter already holds the school', async () => {
    const schoolId = await createSchool()
    const first = await createEligibleCoach()
    await submit(first, { schoolId })
    await NTHSApplicationService.decideCandidateApplication({
      userId: first,
      status: NTHSCandidateApplicationStatus.approved,
    })
    await NTHSGroupsService.foundGroup(first)

    const second = await createEligibleCoach()
    await submit(second, { schoolId })

    await expect(
      NTHSApplicationService.decideCandidateApplication({
        userId: second,
        status: NTHSCandidateApplicationStatus.approved,
      })
    ).rejects.toThrow(NTHSSchoolAlreadyClaimedError)
  })

  test('refuses when another applicant is approved but has not founded yet', async () => {
    const schoolId = await createSchool()
    const first = await createEligibleCoach()
    await submit(first, { schoolId })
    await NTHSApplicationService.decideCandidateApplication({
      userId: first,
      status: NTHSCandidateApplicationStatus.approved,
    })

    const second = await createEligibleCoach()
    await submit(second, { schoolId })

    await expect(
      NTHSApplicationService.decideCandidateApplication({
        userId: second,
        status: NTHSCandidateApplicationStatus.approved,
      })
    ).rejects.toThrow(NTHSSchoolAlreadyClaimedError)
  })

  test('still denies an application for a claimed school', async () => {
    const schoolId = await createSchool()
    const first = await createEligibleCoach()
    await submit(first, { schoolId })
    await NTHSApplicationService.decideCandidateApplication({
      userId: first,
      status: NTHSCandidateApplicationStatus.approved,
    })

    const second = await createEligibleCoach()
    await submit(second, { schoolId })

    await expect(
      NTHSApplicationService.decideCandidateApplication({
        userId: second,
        status: NTHSCandidateApplicationStatus.denied,
        deniedNotes: 'Their school already has a chapter',
      })
    ).resolves.toBeDefined()
  })

  test('leaves manual-entry applications alone', async () => {
    const first = await createEligibleCoach()
    await submit(first)
    await NTHSApplicationService.decideCandidateApplication({
      userId: first,
      status: NTHSCandidateApplicationStatus.approved,
    })

    const second = await createEligibleCoach()
    await submit(second)

    await expect(
      NTHSApplicationService.decideCandidateApplication({
        userId: second,
        status: NTHSCandidateApplicationStatus.approved,
      })
    ).resolves.toBeDefined()
  })
})
