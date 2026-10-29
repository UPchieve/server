/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { Ulid } from '../../models/pgUtils'
import { InputError } from '../../models/Errors'
import { USER_BAN_TYPES } from '../../constants'
import type { NTHSTitle } from '../../constants/nths-titles'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as NTHSRenewalDatesService from '../../services/NTHSRenewalDatesService'
import {
  declinePresidency,
  getRenewalSuccessors,
  NTHSRenewalNotEligibleError,
  NTHSRenewalNotOpenError,
} from '../../services/NTHSRenewalService'
import {
  createChapter,
  createTestUser,
  createTestVolunteer,
} from './seed-utils'

jest.mock('../../services/NTHSRenewalDatesService')
jest.mock('../../services/MailService')

const client = getClient()

const DATES = {
  nominationsOpen: '05-01',
  adminReminder: '06-01',
  successorConfirmation: '08-01',
  memberStage: '09-15',
  closeDate: '09-30',
}
const SCHOOL_YEAR = '2027-07-01'
const FOUNDED_AT = '2027-02-10T15:00:00.000Z'
const NAMED_AT = new Date('2027-05-03T15:00:00.000Z')
const RESPONDED_AT = new Date('2027-08-03T15:00:00.000Z')
const DEPARTED_AT = '2027-08-05T15:00:00.000Z'

const JUNE = new Date('2027-06-10T15:00:00.000Z')
const JULY = new Date('2027-07-20T15:00:00.000Z')
const AUGUST = new Date('2027-08-12T15:00:00.000Z')
const SEPTEMBER = new Date('2027-09-16T15:00:00.000Z')

type MemberOptions = {
  admin?: boolean
  title?: NTHSTitle
  highSchool?: boolean
  onboarded?: boolean
  banType?: USER_BAN_TYPES
  deleted?: boolean
  departed?: boolean
}
const PRESIDENT: MemberOptions = { admin: true, title: 'President' }

type CandidateOptions = {
  namedAt?: Date | null
  namedBy?: Ulid | null
  accepted?: boolean | null
}

type ErrorClass = new (...args: any[]) => Error
type RefusalError = Error & {
  httpStatus?: number
  code?: string
  clientMessage?: string
}

const HTTP_STATUS = new Map<ErrorClass, number>([
  [NTHSRenewalNotEligibleError, 403],
  [NTHSRenewalNotOpenError, 422],
])

async function chapter(
  options: { foundedAt?: string; closedAt?: string } = {}
): Promise<Ulid> {
  const groupId = await createChapter(client, options.closedAt ?? null)
  await client.query(`UPDATE nths_groups SET created_at = $2 WHERE id = $1`, [
    groupId,
    options.foundedAt ?? FOUNDED_AT,
  ])
  return groupId
}

async function addMember(
  groupId: Ulid,
  options: MemberOptions = {}
): Promise<Ulid> {
  const { id } = await createTestUser(client, { banType: options.banType })
  await createTestVolunteer(client, id)
  await client.query(
    `UPDATE volunteer_profiles SET onboarded = $2, approved = true WHERE user_id = $1`,
    [id, options.onboarded ?? true]
  )
  await client.query(`UPDATE users SET deleted = $2 WHERE id = $1`, [
    id,
    options.deleted ?? false,
  ])
  if (options.highSchool ?? true) {
    await client.query(
      `INSERT INTO volunteer_occupations (user_id, occupation) VALUES ($1, 'A high school student')`,
      [id]
    )
  }
  await client.query(
    `INSERT INTO nths_group_members (nths_group_id, user_id, title, joined_at, deactivated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      groupId,
      id,
      options.title ?? 'Member',
      FOUNDED_AT,
      options.departed ? DEPARTED_AT : null,
    ]
  )
  await client.query(
    `INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)
     SELECT $1, $2, id FROM nths_group_roles WHERE name = $3`,
    [id, groupId, options.admin ? 'admin' : 'member']
  )
  return id
}

async function addCandidate(
  groupId: Ulid,
  userId: Ulid,
  options: CandidateOptions = {}
): Promise<void> {
  const accepted = options.accepted ?? null
  await client.query(
    `INSERT INTO nths_group_renewal_candidates
       (nths_group_id, school_year_starts_on, user_id, named_at, named_by, accepted, responded_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      groupId,
      SCHOOL_YEAR,
      userId,
      options.namedAt === undefined ? NAMED_AT : options.namedAt,
      options.namedBy ?? null,
      accepted,
      accepted === null ? null : RESPONDED_AT,
    ]
  )
}

async function candidate(groupId: Ulid, userId: Ulid) {
  const { rows } = await client.query(
    `SELECT named_at, named_by, accepted, responded_at, commitments
     FROM nths_group_renewal_candidates
     WHERE nths_group_id = $1 AND user_id = $2 AND school_year_starts_on = $3`,
    [groupId, userId, SCHOOL_YEAR]
  )
  return rows[0]
}

async function memberState(groupId: Ulid, userId: Ulid) {
  const { rows } = await client.query(
    `SELECT m.title, roles.name AS role
     FROM nths_group_members m
     JOIN nths_group_member_roles member_roles
       ON member_roles.nths_group_id = m.nths_group_id AND member_roles.user_id = m.user_id
     JOIN nths_group_roles roles ON roles.id = member_roles.role_id
     WHERE m.nths_group_id = $1 AND m.user_id = $2`,
    [groupId, userId]
  )
  return rows[0]
}

async function snapshot(groupId: Ulid) {
  const candidates = await client.query(
    `SELECT * FROM nths_group_renewal_candidates WHERE nths_group_id = $1 ORDER BY user_id`,
    [groupId]
  )
  const members = await client.query(
    `SELECT m.user_id, m.title, m.deactivated_at, roles.name AS role
     FROM nths_group_members m
     JOIN nths_group_member_roles member_roles
       ON member_roles.nths_group_id = m.nths_group_id AND member_roles.user_id = m.user_id
     JOIN nths_group_roles roles ON roles.id = member_roles.role_id
     WHERE m.nths_group_id = $1 ORDER BY m.user_id`,
    [groupId]
  )
  return { candidates: candidates.rows, members: members.rows }
}

async function refuses(
  groupId: Ulid,
  act: () => Promise<unknown>,
  error: ErrorClass
): Promise<RefusalError> {
  const before = await snapshot(groupId)
  const err: RefusalError = await act().then(
    () => {
      throw new Error('expected a refusal')
    },
    (e) => e
  )
  expect(err).toBeInstanceOf(error)
  if (HTTP_STATUS.has(error)) {
    expect(err.httpStatus).toBe(HTTP_STATUS.get(error))
  }
  if (error === NTHSRenewalNotEligibleError) {
    expect(`${err.message} ${err.clientMessage ?? ''}`).not.toMatch(/ban/i)
  }
  expect(await snapshot(groupId)).toEqual(before)
  return err
}

async function nameOf(userId: Ulid) {
  const { rows } = await client.query(
    `SELECT first_name, left(last_name, 1) AS last_initial FROM users WHERE id = $1`,
    [userId]
  )
  return { firstName: rows[0].first_name, lastInitial: rows[0].last_initial }
}

beforeEach(() => {
  jest
    .mocked(FeatureFlagService.isNthsChapterRenewalEnabled)
    .mockResolvedValue(true)
  jest
    .mocked(NTHSRenewalDatesService.getNthsChapterRenewalDates)
    .mockResolvedValue(DATES)
})

function turnRenewalOff() {
  jest
    .mocked(FeatureFlagService.isNthsChapterRenewalEnabled)
    .mockResolvedValue(false)
}

describe('declinePresidency', () => {
  test('a named President steps down from the successor date, loses the title and stays admin', async () => {
    const groupId = await chapter()
    const acceptor = await addMember(groupId, PRESIDENT)
    const caller = await addMember(groupId, PRESIDENT)
    await addCandidate(groupId, acceptor, { accepted: true })
    await addCandidate(groupId, caller, { namedBy: acceptor })

    await declinePresidency(caller, groupId, AUGUST)

    expect(await candidate(groupId, caller)).toMatchObject({
      named_at: NAMED_AT,
      accepted: false,
      responded_at: expect.anything(),
    })
    expect(await memberState(groupId, caller)).toEqual({
      title: 'Member',
      role: 'admin',
    })
  })

  test('a named Vice President steps down from the successor date and keeps the title and admin role', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, {
      admin: true,
      title: 'Vice President',
    })
    await addCandidate(groupId, caller)

    await declinePresidency(caller, groupId, AUGUST)

    expect(await candidate(groupId, caller)).toMatchObject({ accepted: false })
    expect(await memberState(groupId, caller)).toEqual({
      title: 'Vice President',
      role: 'admin',
    })
  })

  test.each([
    ['inside the member-stage answer window', SEPTEMBER, null],
    ['before the member stage opens', AUGUST, NAMED_AT],
  ])('a repeat decline %s changes nothing', async (_label, now, namedAt) => {
    const groupId = await chapter()
    const caller = await addMember(groupId)
    await addCandidate(groupId, caller, { accepted: false, namedAt })
    const before = await snapshot(groupId)

    await declinePresidency(caller, groupId, now)

    expect(await snapshot(groupId)).toEqual(before)
  })

  test('an unnamed member at the member stage records a decline', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId)

    const renewal = await declinePresidency(caller, groupId, SEPTEMBER)

    expect(renewal.prompt).toBe('decliner-countdown')
    expect(await candidate(groupId, caller)).toMatchObject({
      named_at: null,
      named_by: null,
      accepted: false,
    })
  })

  test('an unnamed President at the member stage records a decline and keeps the title', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)

    await declinePresidency(caller, groupId, SEPTEMBER)

    expect(await candidate(groupId, caller)).toMatchObject({
      named_at: null,
      accepted: false,
    })
    expect(await memberState(groupId, caller)).toMatchObject({
      title: 'President',
    })
  })

  test('an unnamed member of a confirmed chapter writes nothing', async () => {
    const groupId = await chapter()
    const acceptor = await addMember(groupId, PRESIDENT)
    const caller = await addMember(groupId)
    await addCandidate(groupId, acceptor, { accepted: true })
    const before = await snapshot(groupId)

    await declinePresidency(caller, groupId, SEPTEMBER)

    expect(await snapshot(groupId)).toEqual(before)
  })

  type DeclineScenario = {
    now: Date
    caller?: MemberOptions
    candidate?: CandidateOptions
    flagOff?: boolean
  }
  test.each<[string, DeclineScenario, ErrorClass]>([
    [
      'a named member before the successor date',
      { now: JULY, candidate: {} },
      NTHSRenewalNotOpenError,
    ],
    [
      'an unnamed member before the member stage',
      { now: AUGUST },
      NTHSRenewalNotOpenError,
    ],
    [
      'a caller who already accepted',
      { now: AUGUST, caller: PRESIDENT, candidate: { accepted: true } },
      InputError,
    ],
    [
      'a banned named member',
      {
        now: AUGUST,
        caller: { banType: USER_BAN_TYPES.LIVE_MEDIA },
        candidate: {},
      },
      NTHSRenewalNotEligibleError,
    ],
    [
      'a named member while renewal is off',
      { now: AUGUST, candidate: {}, flagOff: true },
      NTHSRenewalNotOpenError,
    ],
  ])('refuses %s', async (_label, scenario, error) => {
    const groupId = await chapter()
    const caller = await addMember(groupId, scenario.caller)
    if (scenario.candidate) {
      await addCandidate(groupId, caller, scenario.candidate)
    }
    if (scenario.flagOff) {
      turnRenewalOff()
    }

    await refuses(
      groupId,
      () => declinePresidency(caller, groupId, scenario.now),
      error
    )
  })
})

describe('getRenewalSuccessors', () => {
  test('lists current members with answers and namers, hiding a deleted namer and members who left', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)
    const deletedNamer = await addMember(groupId, {
      admin: true,
      deleted: true,
    })
    const named = await addMember(groupId)
    const namedByDeleted = await addMember(groupId)
    const steppedDown = await addMember(groupId)
    const memberStageDecliner = await addMember(groupId)
    const departed = await addMember(groupId, { departed: true })
    const deleted = await addMember(groupId, { deleted: true })
    await addCandidate(groupId, named, { namedBy: caller })
    await addCandidate(groupId, namedByDeleted, { namedBy: deletedNamer })
    await addCandidate(groupId, steppedDown, {
      namedBy: caller,
      accepted: false,
    })
    await addCandidate(groupId, memberStageDecliner, {
      namedAt: null,
      accepted: false,
    })
    await addCandidate(groupId, departed, { namedBy: caller })
    await addCandidate(groupId, deleted, { namedBy: caller })

    const { successors } = await getRenewalSuccessors(caller, groupId, AUGUST)

    const callerName = await nameOf(caller)
    const expected = [
      { userId: named, accepted: null, namedBy: callerName },
      { userId: namedByDeleted, accepted: null, namedBy: null },
      { userId: steppedDown, accepted: false, namedBy: callerName },
      { userId: memberStageDecliner, accepted: false, namedBy: null },
    ]
    const byUser = (a: { userId: Ulid }, b: { userId: Ulid }) =>
      a.userId.localeCompare(b.userId)
    expect([...successors].sort(byUser)).toEqual(
      await Promise.all(
        expected.sort(byUser).map(async (row) => ({
          ...row,
          ...(await nameOf(row.userId)),
        }))
      )
    )
  })

  test.each([
    ['in the naming window', JUNE, false, true],
    ['once the chapter has a confirmed president', AUGUST, true, false],
    ['from the member stage', SEPTEMBER, false, false],
  ])(
    'canEditSuccessors %s',
    async (_label, now, confirmed, canEditSuccessors) => {
      const groupId = await chapter()
      const caller = await addMember(groupId, PRESIDENT)
      if (confirmed) {
        const acceptor = await addMember(groupId, PRESIDENT)
        await addCandidate(groupId, acceptor, { accepted: true })
      }

      const result = await getRenewalSuccessors(caller, groupId, now)

      expect(result.canEditSuccessors).toBe(canEditSuccessors)
    }
  )

  test.each<[string, MemberOptions, boolean, ErrorClass]>([
    [
      'a banned caller',
      { ...PRESIDENT, banType: USER_BAN_TYPES.COMPLETE },
      false,
      NTHSRenewalNotEligibleError,
    ],
    ['while renewal is off', PRESIDENT, true, NTHSRenewalNotOpenError],
  ])('refuses %s', async (_label, options, flagOff, error) => {
    const groupId = await chapter()
    const caller = await addMember(groupId, options)
    if (flagOff) {
      turnRenewalOff()
    }

    await refuses(
      groupId,
      () => getRenewalSuccessors(caller, groupId, JUNE),
      error
    )
  })
})

test('the database allows one candidate row per chapter, school year and member', async () => {
  const groupId = await chapter()
  const member = await addMember(groupId)
  await addCandidate(groupId, member)

  await expect(
    addCandidate(groupId, member, { namedAt: null, accepted: false })
  ).rejects.toMatchObject({
    constraint: 'nths_group_renewal_candidates_group_school_year_user_key',
  })
})
