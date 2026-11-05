/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { Ulid } from '../../models/pgUtils'
import { USER_BAN_TYPES } from '../../constants'
import type { NTHSTitle } from '../../constants/nths-titles'
import { COMMITMENTS } from '../../services/NTHSApplicationService'
import { getNthsRenewalState } from '../../models/NTHSRenewal'
import { leaveGroup } from '../../services/NTHSGroupsService'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as NTHSRenewalDatesService from '../../services/NTHSRenewalDatesService'
import {
  acceptPresidency,
  closeDueChapter,
  nextRenewalCycle,
  NTHSRenewalCommitmentsRequiredError,
  NTHSRenewalNotClearedError,
  NTHSRenewalNotEligibleError,
  NTHSRenewalNotOpenError,
  type RenewalCommitments,
} from '../../services/NTHSRenewalService'
import {
  createChapter,
  createChapterMember,
  sqlText,
  withRealTransaction,
} from './seed-utils'

jest.mock('../../services/NTHSRenewalDatesService')
jest.mock('../../services/MailService')

const client = getClient()

const DATES = {
  nominationsOpen: '05-01',
  successorConfirmation: '08-01',
  memberStage: '09-15',
  closeDate: '09-30',
}
const SCHOOL_YEAR = '2027-07-01'
const FOUNDED_AT = '2027-02-10T15:00:00.000Z'
const FOUNDED_AFTER_YEAR_START = '2027-07-15T15:00:00.000Z'
const CREATED_AT = new Date('2027-08-03T15:00:00.000Z')
const DEPARTED_AT = '2027-08-05T15:00:00.000Z'

const JULY = new Date('2027-07-20T15:00:00.000Z')
const AUGUST = new Date('2027-08-12T15:00:00.000Z')
const SEPTEMBER = new Date('2027-09-16T15:00:00.000Z')
const OCT_1_BEFORE_CLOSE = new Date('2027-10-01T10:00:00.000Z')
const OCT_1_AFTER_CLOSE = new Date('2027-10-01T13:00:00.000Z')

const ALL_COMMITMENTS: RenewalCommitments = Object.fromEntries(
  COMMITMENTS.map(({ key }) => [key, true])
)
const ACCEPT = { reason: 'renewal' as const, commitments: ALL_COMMITMENTS }

type MemberOptions = {
  admin?: boolean
  title?: NTHSTitle
  highSchool?: boolean
  onboarded?: boolean
  banType?: USER_BAN_TYPES
  departed?: boolean
}
const PRESIDENT: MemberOptions = { admin: true, title: 'President' }
const VICE_PRESIDENT: MemberOptions = { admin: true, title: 'Vice President' }
const UNCLEARED_PRESIDENT: MemberOptions = { ...PRESIDENT, highSchool: false }

type ErrorClass = new (...args: any[]) => Error
type RefusalError = Error & { httpStatus?: number; code?: string }

const HTTP_STATUS = new Map<ErrorClass, number>([
  [NTHSRenewalNotEligibleError, 403],
  [NTHSRenewalNotClearedError, 403],
  [NTHSRenewalNotOpenError, 422],
  [NTHSRenewalCommitmentsRequiredError, 400],
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

function addMember(
  groupId: Ulid,
  { departed, highSchool = true, ...options }: MemberOptions = {}
): Promise<Ulid> {
  return createChapterMember(client, groupId, {
    ...options,
    highSchool,
    volunteerProfile: true,
    joinedAt: FOUNDED_AT,
    deactivatedAt: departed ? DEPARTED_AT : null,
  })
}

// Raw insert: the app never writes a second row for one member.
async function insertCandidateRow(groupId: Ulid, userId: Ulid): Promise<void> {
  await client.query(
    `INSERT INTO nths_group_renewal_candidates
       (nths_group_id, school_year_starts_on, user_id, created_at)
     VALUES ($1, $2, $3, $4)`,
    [groupId, SCHOOL_YEAR, userId, CREATED_AT]
  )
}

async function candidate(groupId: Ulid, userId: Ulid) {
  const { rows } = await client.query(
    `SELECT commitments
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

async function othersUnchanged(
  groupId: Ulid,
  callerId: Ulid,
  act: () => Promise<unknown>
) {
  const others = async () =>
    (await snapshot(groupId)).members.filter((m) => m.user_id !== callerId)
  const before = await others()
  await act()
  expect(await others()).toEqual(before)
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
  expect(await snapshot(groupId)).toEqual(before)
  return err
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

describe('acceptPresidency', () => {
  test('a President confirms the chapter with every commitment and no other member changes', async () => {
    const groupId = await chapter()
    const president = await addMember(groupId, PRESIDENT)
    await addMember(groupId, PRESIDENT)
    await addMember(groupId, VICE_PRESIDENT)
    await addMember(groupId)
    let result: Awaited<ReturnType<typeof acceptPresidency>> | undefined

    await othersUnchanged(groupId, president, async () => {
      result = await acceptPresidency(president, groupId, ACCEPT, AUGUST)
    })

    expect(result).toMatchObject({
      outcome: 'accepted',
      renewal: { prompt: 'none' },
    })
    expect(await candidate(groupId, president)).toMatchObject({
      commitments: ALL_COMMITMENTS,
    })
    expect(await memberState(groupId, president)).toEqual({
      title: 'President',
      role: 'admin',
    })
  })

  const [firstKey] = Object.keys(ALL_COMMITMENTS)
  const { [firstKey]: _dropped, ...missingOne } = ALL_COMMITMENTS
  test.each<[string, RenewalCommitments | undefined]>([
    ['no commitments', undefined],
    ['one commitment missing', missingOne],
    ['one commitment false', { ...ALL_COMMITMENTS, [firstKey]: false }],
  ])('refuses a President who sends %s', async (_label, commitments) => {
    const groupId = await chapter()
    const president = await addMember(groupId, PRESIDENT)

    const err = await refuses(
      groupId,
      () =>
        acceptPresidency(
          president,
          groupId,
          { reason: 'renewal', commitments },
          AUGUST
        ),
      NTHSRenewalCommitmentsRequiredError
    )
    expect(err.code).toBe('commitments_required')
  })

  test.each([
    ['in August', AUGUST],
    [
      'on the day after the close date, before the close instant',
      OCT_1_BEFORE_CLOSE,
    ],
  ])(
    'a second President %s gets has_president and nothing is written',
    async (_label, now) => {
      const groupId = await chapter()
      const first = await addMember(groupId, PRESIDENT)
      const second = await addMember(groupId, PRESIDENT)
      await acceptPresidency(first, groupId, ACCEPT, AUGUST)
      const before = await snapshot(groupId)

      const result = await acceptPresidency(second, groupId, ACCEPT, now)

      expect(result).toMatchObject({
        outcome: 'has_president',
        renewal: { prompt: 'none' },
      })
      expect(await snapshot(groupId)).toEqual(before)
    }
  )

  type MemberStageScenario = {
    caller: MemberOptions
    now: Date
    admins: MemberOptions[]
  }
  test.each<[string, MemberStageScenario]>([
    ['a plain member', { caller: {}, now: SEPTEMBER, admins: [PRESIDENT] }],
    [
      'a Vice President',
      { caller: VICE_PRESIDENT, now: SEPTEMBER, admins: [PRESIDENT] },
    ],
    ['a President', { caller: PRESIDENT, now: SEPTEMBER, admins: [] }],
    [
      'a member of an unmanaged chapter in August',
      { caller: {}, now: AUGUST, admins: [UNCLEARED_PRESIDENT] },
    ],
  ])(
    'at the member stage %s becomes an admin and President and no other member changes',
    async (_label, { caller: callerOptions, now, admins }) => {
      const groupId = await chapter()
      for (const admin of admins) {
        await addMember(groupId, admin)
      }
      const caller = await addMember(groupId, callerOptions)

      await othersUnchanged(groupId, caller, () =>
        acceptPresidency(caller, groupId, ACCEPT, now)
      )

      expect(await candidate(groupId, caller)).toMatchObject({
        commitments: ALL_COMMITMENTS,
      })
      expect(await memberState(groupId, caller)).toEqual({
        title: 'President',
        role: 'admin',
      })
    }
  )

  test('a member of a confirmed chapter who never answered gets has_president and nothing is written', async () => {
    const groupId = await chapter()
    const acceptor = await addMember(groupId, PRESIDENT)
    const caller = await addMember(groupId)
    await acceptPresidency(acceptor, groupId, ACCEPT, AUGUST)
    const before = await snapshot(groupId)

    const result = await acceptPresidency(caller, groupId, ACCEPT, SEPTEMBER)

    expect(result.outcome).toBe('has_president')
    expect(await snapshot(groupId)).toEqual(before)
  })

  test('once every earlier acceptor has left, a President confirms again', async () => {
    const groupId = await chapter()
    const departedAcceptor = await addMember(groupId, PRESIDENT)
    const president = await addMember(groupId, PRESIDENT)
    await acceptPresidency(departedAcceptor, groupId, ACCEPT, AUGUST)
    await leaveGroup(departedAcceptor, groupId)

    const result = await acceptPresidency(president, groupId, ACCEPT, AUGUST)

    expect(result.outcome).toBe('accepted')
    expect(
      (await getNthsRenewalState(groupId, president, SCHOOL_YEAR))
        ?.viewerCandidacy
    ).toBe('accepted')
  })

  test.each(Object.values(USER_BAN_TYPES))(
    'a member with a %s ban takes the presidency like anyone',
    async (banType) => {
      const groupId = await chapter()
      const member = await addMember(groupId, { banType })

      const result = await acceptPresidency(member, groupId, ACCEPT, SEPTEMBER)

      expect(result.outcome).toBe('accepted')
    }
  )

  test.each<[string, MemberOptions, Date, MemberOptions[]]>([
    [
      'a President who isn’t a high school student, at the confirm stage',
      UNCLEARED_PRESIDENT,
      AUGUST,
      [VICE_PRESIDENT],
    ],
    [
      'a member who hasn’t finished onboarding, at the member stage',
      { onboarded: false },
      SEPTEMBER,
      [],
    ],
    [
      'a member who isn’t a high school student, at the member stage',
      { highSchool: false },
      SEPTEMBER,
      [],
    ],
  ])('refuses %s as not cleared', async (_label, options, now, admins) => {
    const groupId = await chapter()
    for (const admin of admins) {
      await addMember(groupId, admin)
    }
    const caller = await addMember(groupId, options)

    await refuses(
      groupId,
      () => acceptPresidency(caller, groupId, ACCEPT, now),
      NTHSRenewalNotClearedError
    )
  })

  test('clears a President who is a high school student without finishing onboarding', async () => {
    const groupId = await chapter()
    const president = await addMember(groupId, {
      ...PRESIDENT,
      onboarded: false,
    })

    await acceptPresidency(president, groupId, ACCEPT, AUGUST)

    expect(
      (await getNthsRenewalState(groupId, president, SCHOOL_YEAR))
        ?.viewerCandidacy
    ).toBe('accepted')
  })

  type WindowScenario = {
    now: Date
    caller: MemberOptions
    foundedAt?: string
    flagOff?: boolean
  }
  test.each<[string, WindowScenario]>([
    ['a President before confirmation opens', { now: JULY, caller: PRESIDENT }],
    [
      'an admin without the President title before the member stage',
      { now: AUGUST, caller: VICE_PRESIDENT },
    ],
    ['a plain member before the member stage', { now: AUGUST, caller: {} }],
    [
      'a President after the close instant',
      { now: OCT_1_AFTER_CLOSE, caller: PRESIDENT },
    ],
    [
      'a President of a chapter founded after the school year began',
      {
        now: AUGUST,
        caller: PRESIDENT,
        foundedAt: FOUNDED_AFTER_YEAR_START,
      },
    ],
    [
      'a President while renewal is off',
      { now: AUGUST, caller: PRESIDENT, flagOff: true },
    ],
  ])('refuses %s', async (_label, scenario) => {
    const groupId = await chapter(scenario)
    await addMember(groupId, PRESIDENT)
    const caller = await addMember(groupId, scenario.caller)
    if (scenario.flagOff) {
      turnRenewalOff()
    }

    await refuses(
      groupId,
      () => acceptPresidency(caller, groupId, ACCEPT, scenario.now),
      NTHSRenewalNotOpenError
    )
  })

  test('refuses a President who has left the chapter', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, { ...PRESIDENT, departed: true })

    await refuses(
      groupId,
      () => acceptPresidency(caller, groupId, ACCEPT, AUGUST),
      NTHSRenewalNotEligibleError
    )
  })

  test('stores only the program commitments', async () => {
    const groupId = await chapter()
    const president = await addMember(groupId, PRESIDENT)

    await acceptPresidency(
      president,
      groupId,
      { ...ACCEPT, commitments: { ...ALL_COMMITMENTS, extra: true } },
      AUGUST
    )

    expect((await candidate(groupId, president)).commitments).toEqual(
      ALL_COMMITMENTS
    )
  })

  test('a President who confirms again gets accepted and nothing changes', async () => {
    const groupId = await chapter()
    const president = await addMember(groupId, PRESIDENT)
    await acceptPresidency(president, groupId, ACCEPT, AUGUST)
    const before = await snapshot(groupId)

    const result = await acceptPresidency(president, groupId, ACCEPT, AUGUST)

    expect(result.outcome).toBe('accepted')
    expect(await snapshot(groupId)).toEqual(before)
  })
})

test('the database allows one candidate row per chapter, school year and member', async () => {
  const groupId = await chapter()
  const member = await addMember(groupId)
  await insertCandidateRow(groupId, member)

  await expect(insertCandidateRow(groupId, member)).rejects.toMatchObject({
    constraint: 'nths_group_renewal_candidates_group_school_year_user_key',
  })
})

describe('chapter lock', () => {
  const LOCK_STATEMENT = /FOR\s+(NO\s+KEY\s+)?UPDATE/i

  async function probeChapterLock(groupId: Ulid): Promise<string | undefined> {
    const other = await (global as any).__TEST_DB_CLIENT__.connect()
    try {
      await other.query(`SET lock_timeout = '200ms'`)
      // FOR SHARE is the join path's mode; only a stronger lock blocks it.
      await other.query(`SELECT id FROM nths_groups WHERE id = $1 FOR SHARE`, [
        groupId,
      ])
    } catch (err) {
      return (err as { code?: string }).code
    } finally {
      await other.query(`RESET lock_timeout`)
      other.release()
    }
  }

  test.each<[string, (groupId: Ulid) => Promise<() => Promise<unknown>>]>([
    [
      'acceptPresidency',
      async (groupId) => {
        const president = await addMember(groupId, PRESIDENT)
        return () => acceptPresidency(president, groupId, ACCEPT, AUGUST)
      },
    ],
    [
      'closeDueChapter',
      async (groupId) => {
        await addMember(groupId, PRESIDENT)
        return () =>
          closeDueChapter(
            groupId,
            nextRenewalCycle(DATES, AUGUST),
            OCT_1_AFTER_CLOSE
          )
      },
    ],
  ])(
    '%s locks the chapter row before its first read',
    async (_label, arrange) => {
      const groupId = await chapter()
      const act = await arrange(groupId)
      let lockErrorCode: string | undefined
      let probed = false

      withRealTransaction((tc) => ({
        query: async (...args: unknown[]) => {
          const sql = sqlText(args)
          if (
            !probed &&
            !LOCK_STATEMENT.test(sql) &&
            /\b(FROM|INTO|UPDATE)\b/i.test(sql)
          ) {
            probed = true
            lockErrorCode = await probeChapterLock(groupId)
          }
          return tc.query(...args)
        },
      }))

      await act()

      expect(probed).toBe(true)
      // 55P03 is lock_not_available
      expect(lockErrorCode).toBe('55P03')
    }
  )
})
