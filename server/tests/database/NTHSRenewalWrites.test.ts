/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { Ulid } from '../../models/pgUtils'
import { InputError } from '../../models/Errors'
import { USER_BAN_TYPES } from '../../constants'
import type { NTHSTitle } from '../../constants/nths-titles'
import { COMMITMENTS } from '../../services/NTHSApplicationService'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as NTHSRenewalDatesService from '../../services/NTHSRenewalDatesService'
import {
  acceptPresidency,
  declinePresidency,
  getRenewalSuccessors,
  nameSelfAsSuccessor,
  setRenewalSuccessors,
  NTHSRenewalCommitmentsRequiredError,
  NTHSRenewalNotClearedError,
  NTHSRenewalNotEligibleError,
  NTHSRenewalNotOpenError,
  NTHSRenewalSuccessorsChangedError,
  type RenewalCommitments,
} from '../../services/NTHSRenewalService'
import {
  createChapter,
  createChapterMember,
  createTestUser,
  sqlText,
  withRealTransaction,
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
const FOUNDED_AFTER_YEAR_START = '2027-07-15T15:00:00.000Z'
const NAMED_AT = new Date('2027-05-03T15:00:00.000Z')
const RESPONDED_AT = new Date('2027-08-03T15:00:00.000Z')
const DEPARTED_AT = '2027-08-05T15:00:00.000Z'

const BEFORE_NOMINATIONS = new Date('2027-04-20T15:00:00.000Z')
const MAY = new Date('2027-05-10T15:00:00.000Z')
const JUNE = new Date('2027-06-10T15:00:00.000Z')
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
  [NTHSRenewalNotClearedError, 403],
  [NTHSRenewalNotOpenError, 422],
  [NTHSRenewalSuccessorsChangedError, 409],
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
  if (
    error === NTHSRenewalNotEligibleError ||
    error === NTHSRenewalNotClearedError
  ) {
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

describe('setRenewalSuccessors', () => {
  test('names new members as named by the caller and keeps who named the names already listed', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)
    const otherAdmin = await addMember(groupId, { admin: true })
    const kept = await addMember(groupId)
    const added = await addMember(groupId)
    await addCandidate(groupId, kept, { namedBy: otherAdmin })

    const renewal = await setRenewalSuccessors(
      caller,
      groupId,
      { userIds: [kept, added], expectedUserIds: [kept] },
      JUNE
    )

    expect(renewal.prompt).toBe('successors-named')
    expect(await candidate(groupId, kept)).toMatchObject({
      named_at: NAMED_AT,
      named_by: otherAdmin,
      accepted: null,
    })
    expect(await candidate(groupId, added)).toMatchObject({
      named_at: expect.anything(),
      named_by: caller,
      accepted: null,
    })
  })

  test.each([
    ['before the successor date', JUNE, false, false],
    [
      'from the successor date with the caller in the list',
      AUGUST,
      true,
      false,
    ],
    ['listing a name removed since it loaded', JUNE, false, true],
  ])(
    'refuses a save made from a stale list %s',
    async (_label, now, includesCaller, removedSince) => {
      const groupId = await chapter()
      const caller = await addMember(groupId, { admin: true })
      const namedMeanwhile = await addMember(groupId)
      const pick = await addMember(groupId)
      if (!removedSince) {
        await addCandidate(groupId, namedMeanwhile)
      }

      const err = await refuses(
        groupId,
        () =>
          setRenewalSuccessors(
            caller,
            groupId,
            {
              userIds: includesCaller ? [caller, pick] : [pick],
              expectedUserIds: removedSince ? [namedMeanwhile] : [],
              commitments: ALL_COMMITMENTS,
            },
            now
          ),
        NTHSRenewalSuccessorsChangedError
      )
      expect(err.code).toBe('successors_changed')
    }
  )

  test('compares the loaded list with unanswered current members only', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)
    const departed = await addMember(groupId, { departed: true })
    const declined = await addMember(groupId)
    const pick = await addMember(groupId)
    await addCandidate(groupId, departed)
    await addCandidate(groupId, declined, { accepted: false })

    await setRenewalSuccessors(
      caller,
      groupId,
      { userIds: [pick], expectedUserIds: [] },
      JUNE
    )

    expect(await candidate(groupId, pick)).toMatchObject({ accepted: null })
  })

  test('removes unanswered names left off the list and keeps declined rows', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)
    const dropped = await addMember(groupId)
    const kept = await addMember(groupId)
    const declined = await addMember(groupId)
    await addCandidate(groupId, dropped)
    await addCandidate(groupId, kept)
    await addCandidate(groupId, declined, { accepted: false })

    await setRenewalSuccessors(
      caller,
      groupId,
      { userIds: [kept], expectedUserIds: [kept, dropped] },
      JUNE
    )

    expect(await candidate(groupId, dropped)).toBeUndefined()
    expect(await candidate(groupId, kept)).toMatchObject({ accepted: null })
    expect(await candidate(groupId, declined)).toMatchObject({
      accepted: false,
    })
  })

  test.each<[string, (groupId: Ulid) => Promise<Ulid>]>([
    [
      'a member who stepped down this cycle',
      async (groupId) => {
        const id = await addMember(groupId)
        await addCandidate(groupId, id, { accepted: false })
        return id
      },
    ],
    [
      'a member who has left',
      (groupId) => addMember(groupId, { departed: true }),
    ],
    ['a deleted account', (groupId) => addMember(groupId, { deleted: true })],
    [
      'someone outside the chapter',
      async () => (await createTestUser(client)).id,
    ],
  ])('refuses to name %s', async (_label, arrange) => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)
    const nominee = await arrange(groupId)

    await refuses(
      groupId,
      () =>
        setRenewalSuccessors(
          caller,
          groupId,
          { userIds: [nominee], expectedUserIds: [] },
          JUNE
        ),
      InputError
    )
  })

  type ListScenario = {
    now?: Date
    foundedAt?: string
    closedAt?: string
    flagOff?: boolean
    confirmed?: boolean
    remove?: boolean
    caller?: MemberOptions
  }
  test.each<[string, ListScenario, ErrorClass]>([
    [
      'before nominations open',
      { now: BEFORE_NOMINATIONS },
      NTHSRenewalNotOpenError,
    ],
    ['from the member stage', { now: SEPTEMBER }, NTHSRenewalNotOpenError],
    [
      'for a chapter founded after the school year began',
      { foundedAt: FOUNDED_AFTER_YEAR_START, now: AUGUST },
      NTHSRenewalNotOpenError,
    ],
    [
      'for a closed chapter',
      { closedAt: '2027-03-01T00:00:00.000Z' },
      NTHSRenewalNotOpenError,
    ],
    ['while renewal is off', { flagOff: true }, NTHSRenewalNotOpenError],
    [
      'adding a name while the chapter has a confirmed president',
      { confirmed: true, now: AUGUST },
      NTHSRenewalNotOpenError,
    ],
    [
      'removing a name while the chapter has a confirmed president',
      { confirmed: true, remove: true, now: AUGUST },
      NTHSRenewalNotOpenError,
    ],
    [
      'from a banned caller',
      { caller: { ...PRESIDENT, banType: USER_BAN_TYPES.COMPLETE } },
      NTHSRenewalNotEligibleError,
    ],
  ])('refuses any edit %s', async (_label, scenario, error) => {
    const groupId = await chapter(scenario)
    const caller = await addMember(groupId, scenario.caller ?? PRESIDENT)
    const named = await addMember(groupId)
    const pick = await addMember(groupId)
    await addCandidate(groupId, named)
    if (scenario.confirmed) {
      const acceptor = await addMember(groupId, PRESIDENT)
      await addCandidate(groupId, acceptor, { accepted: true })
    }
    if (scenario.flagOff) {
      turnRenewalOff()
    }

    await refuses(
      groupId,
      () =>
        setRenewalSuccessors(
          caller,
          groupId,
          {
            userIds: scenario.remove ? [] : [named, pick],
            expectedUserIds: [named],
          },
          scenario.now ?? JUNE
        ),
      error
    )
  })

  test('names a banned member like any other', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)
    const banned = await addMember(groupId, {
      banType: USER_BAN_TYPES.COMPLETE,
    })

    await setRenewalSuccessors(
      caller,
      groupId,
      { userIds: [banned], expectedUserIds: [] },
      JUNE
    )

    expect(await candidate(groupId, banned)).toMatchObject({
      named_by: caller,
      accepted: null,
    })
  })

  test('only names a caller who lists themselves before the successor date', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, {
      admin: true,
      title: 'Vice President',
    })

    await setRenewalSuccessors(
      caller,
      groupId,
      { userIds: [caller], expectedUserIds: [] },
      JUNE
    )

    expect(await candidate(groupId, caller)).toMatchObject({
      named_by: caller,
      accepted: null,
      commitments: null,
    })
    expect(await memberState(groupId, caller)).toEqual({
      title: 'Vice President',
      role: 'admin',
    })
  })

  test('from the successor date names everyone listed and accepts for a caller who agrees to every commitment', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, { admin: true })
    const other = await addMember(groupId)

    await setRenewalSuccessors(
      caller,
      groupId,
      {
        userIds: [caller, other],
        expectedUserIds: [],
        commitments: ALL_COMMITMENTS,
      },
      AUGUST
    )

    expect(await candidate(groupId, caller)).toMatchObject({
      named_by: caller,
      accepted: true,
      responded_at: expect.anything(),
      commitments: ALL_COMMITMENTS,
    })
    expect(await candidate(groupId, other)).toMatchObject({
      named_by: caller,
      accepted: null,
    })
    expect(await memberState(groupId, caller)).toEqual({
      title: 'President',
      role: 'admin',
    })
  })

  test('from the successor date saves nothing when a caller without the President title lists themselves with no commitments', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, { admin: true })
    const other = await addMember(groupId)

    const err = await refuses(
      groupId,
      () =>
        setRenewalSuccessors(
          caller,
          groupId,
          { userIds: [caller, other], expectedUserIds: [] },
          AUGUST
        ),
      NTHSRenewalCommitmentsRequiredError
    )
    expect(err.code).toBe('commitments_required')
  })

  test('refuses a named successor who changes the list from the successor date before answering', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)
    const pick = await addMember(groupId)
    await addCandidate(groupId, caller)

    await refuses(
      groupId,
      () =>
        setRenewalSuccessors(
          caller,
          groupId,
          {
            userIds: [caller, pick],
            expectedUserIds: [caller],
            commitments: ALL_COMMITMENTS,
          },
          AUGUST
        ),
      NTHSRenewalNotOpenError
    )
  })

  test.each<[string, MemberOptions]>([
    ['a member who is not an admin', {}],
    ['an admin who has left the chapter', { admin: true, departed: true }],
  ])('refuses a save from %s', async (_label, callerOptions) => {
    const groupId = await chapter()
    await addMember(groupId, PRESIDENT)
    const caller = await addMember(groupId, callerOptions)
    const pick = await addMember(groupId)

    await refuses(
      groupId,
      () =>
        setRenewalSuccessors(
          caller,
          groupId,
          { userIds: [pick], expectedUserIds: [] },
          JUNE
        ),
      NTHSRenewalNotEligibleError
    )
  })
})

describe('nameSelfAsSuccessor', () => {
  test('adds only the caller and leaves every other name as it was', async () => {
    const groupId = await chapter()
    const first = await addMember(groupId, PRESIDENT)
    const caller = await addMember(groupId, PRESIDENT)
    await addCandidate(groupId, first, { namedBy: first })
    const before = await candidate(groupId, first)

    await nameSelfAsSuccessor(caller, groupId, {}, MAY)

    expect(await candidate(groupId, caller)).toMatchObject({
      named_by: caller,
      accepted: null,
    })
    expect(await candidate(groupId, first)).toEqual(before)
  })

  test('from the successor date names and accepts a President with no commitments, and an unnamed President becomes a Member who stays admin', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)
    const coPresident = await addMember(groupId, PRESIDENT)
    const named = await addMember(groupId)
    await addCandidate(groupId, named, { namedBy: coPresident })

    await nameSelfAsSuccessor(caller, groupId, {}, AUGUST)

    expect(await candidate(groupId, caller)).toMatchObject({
      named_by: caller,
      accepted: true,
      commitments: null,
    })
    expect(await candidate(groupId, named)).toMatchObject({ accepted: null })
    expect(await memberState(groupId, caller)).toEqual({
      title: 'President',
      role: 'admin',
    })
    expect(await memberState(groupId, coPresident)).toEqual({
      title: 'Member',
      role: 'admin',
    })
  })

  test('from the successor date accepts for a caller already named from a stale tab', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, PRESIDENT)
    await addCandidate(groupId, caller, { namedBy: caller })

    await nameSelfAsSuccessor(caller, groupId, {}, AUGUST)

    expect(await candidate(groupId, caller)).toMatchObject({
      named_at: NAMED_AT,
      accepted: true,
    })
  })

  type SelfScenario = {
    now?: Date
    caller?: MemberOptions
    declined?: boolean
    confirmed?: boolean
    flagOff?: boolean
  }
  test.each<[string, SelfScenario, ErrorClass]>([
    [
      'a banned caller',
      { caller: { ...PRESIDENT, banType: USER_BAN_TYPES.SHADOW } },
      NTHSRenewalNotEligibleError,
    ],
    ['a caller who stepped down this cycle', { declined: true }, InputError],
    [
      'a chapter with a confirmed president',
      { confirmed: true, now: AUGUST },
      NTHSRenewalNotOpenError,
    ],
    ['the member stage', { now: SEPTEMBER }, NTHSRenewalNotOpenError],
    ['renewal being off', { flagOff: true }, NTHSRenewalNotOpenError],
    [
      'an admin who isn’t a high school student, from the successor date',
      { caller: { ...PRESIDENT, highSchool: false }, now: AUGUST },
      NTHSRenewalNotClearedError,
    ],
  ])('refuses and saves nothing for %s', async (_label, scenario, error) => {
    const groupId = await chapter()
    const caller = await addMember(groupId, scenario.caller ?? PRESIDENT)
    if (scenario.declined) {
      await addCandidate(groupId, caller, { accepted: false })
    }
    if (scenario.confirmed) {
      const acceptor = await addMember(groupId, PRESIDENT)
      await addCandidate(groupId, acceptor, { accepted: true })
    }
    if (scenario.flagOff) {
      turnRenewalOff()
    }

    await refuses(
      groupId,
      () =>
        nameSelfAsSuccessor(
          caller,
          groupId,
          { commitments: ALL_COMMITMENTS },
          scenario.now ?? JUNE
        ),
      error
    )
  })
})

describe('acceptPresidency', () => {
  test('a named President accepts with no commitments and keeps the title', async () => {
    const groupId = await chapter()
    const president = await addMember(groupId, PRESIDENT)
    await addCandidate(groupId, president, { namedBy: president })

    const result = await acceptPresidency(
      president,
      groupId,
      { reason: 'renewal' },
      AUGUST
    )

    expect(result.outcome).toBe('accepted')
    expect(result.renewal.prompt).toBe('none')
    expect(await candidate(groupId, president)).toMatchObject({
      named_by: president,
      accepted: true,
      responded_at: expect.anything(),
      commitments: null,
    })
    expect(await memberState(groupId, president)).toEqual({
      title: 'President',
      role: 'admin',
    })
  })

  test('a named member who agrees to every commitment becomes an admin and President, and the unnamed President becomes a Member who stays admin', async () => {
    const groupId = await chapter()
    const outgoing = await addMember(groupId, PRESIDENT)
    const successor = await addMember(groupId)
    await addCandidate(groupId, successor, { namedBy: outgoing })

    const result = await acceptPresidency(successor, groupId, ACCEPT, AUGUST)

    expect(result.outcome).toBe('accepted')
    expect(await candidate(groupId, successor)).toMatchObject({
      accepted: true,
      commitments: ALL_COMMITMENTS,
    })
    expect(await memberState(groupId, successor)).toEqual({
      title: 'President',
      role: 'admin',
    })
    expect(await memberState(groupId, outgoing)).toEqual({
      title: 'Member',
      role: 'admin',
    })
  })

  const [firstKey] = Object.keys(ALL_COMMITMENTS)
  const { [firstKey]: _dropped, ...missingOne } = ALL_COMMITMENTS
  test.each<[string, RenewalCommitments | undefined]>([
    ['no commitments', undefined],
    ['one commitment missing', missingOne],
    ['one commitment false', { ...ALL_COMMITMENTS, [firstKey]: false }],
  ])(
    'refuses a member without the President title who sends %s',
    async (_label, commitments) => {
      const groupId = await chapter()
      await addMember(groupId, PRESIDENT)
      const successor = await addMember(groupId)
      await addCandidate(groupId, successor)

      const err = await refuses(
        groupId,
        () =>
          acceptPresidency(
            successor,
            groupId,
            { reason: 'renewal', commitments },
            AUGUST
          ),
        NTHSRenewalCommitmentsRequiredError
      )
      expect(err.code).toBe('commitments_required')
    }
  )

  test('another named successor accepts after the chapter is confirmed and nobody loses the President title', async () => {
    const groupId = await chapter()
    const first = await addMember(groupId, PRESIDENT)
    const second = await addMember(groupId, PRESIDENT)
    const titledByHand = await addMember(groupId, PRESIDENT)
    await addCandidate(groupId, first, { accepted: true })
    await addCandidate(groupId, second)

    const result = await acceptPresidency(
      second,
      groupId,
      { reason: 'renewal' },
      AUGUST
    )

    expect(result.outcome).toBe('accepted')
    expect(await candidate(groupId, second)).toMatchObject({ accepted: true })
    for (const userId of [first, second, titledByHand]) {
      expect((await memberState(groupId, userId)).title).toBe('President')
    }
  })

  test.each([
    ['accepts before the close instant', OCT_1_BEFORE_CLOSE, true],
    ['refuses after the close instant', OCT_1_AFTER_CLOSE, false],
  ])(
    'a named successor of a confirmed chapter on the day after the close date %s',
    async (_label, now, accepts) => {
      const groupId = await chapter()
      const acceptor = await addMember(groupId, PRESIDENT)
      const named = await addMember(groupId)
      await addCandidate(groupId, acceptor, { accepted: true })
      await addCandidate(groupId, named)
      const act = () => acceptPresidency(named, groupId, ACCEPT, now)

      if (accepts) {
        await act()
        expect(await candidate(groupId, named)).toMatchObject({
          accepted: true,
        })
      } else {
        await refuses(groupId, act, NTHSRenewalNotOpenError)
      }
    }
  )

  test.each<[string, MemberOptions, RenewalCommitments | undefined]>([
    ['a plain member who agrees to every commitment', {}, ALL_COMMITMENTS],
    ['a President with no commitments', PRESIDENT, undefined],
  ])(
    'at the member stage an unnamed caller accepts: %s',
    async (_label, options, commitments) => {
      const groupId = await chapter()
      const caller = await addMember(groupId, options)

      const result = await acceptPresidency(
        caller,
        groupId,
        { reason: 'renewal', commitments },
        SEPTEMBER
      )

      expect(result.outcome).toBe('accepted')
      expect(await candidate(groupId, caller)).toMatchObject({
        named_at: null,
        named_by: null,
        accepted: true,
      })
      expect(await memberState(groupId, caller)).toEqual({
        title: 'President',
        role: 'admin',
      })
    }
  )

  test.each<[string, CandidateOptions | null]>([
    ['never answered', null],
    ['stepped down earlier', { accepted: false }],
  ])(
    'an unnamed member of a confirmed chapter who %s gets has_president and nothing is written',
    async (_label, answer) => {
      const groupId = await chapter()
      const acceptor = await addMember(groupId, PRESIDENT)
      const caller = await addMember(groupId)
      await addCandidate(groupId, acceptor, { accepted: true })
      if (answer) {
        await addCandidate(groupId, caller, answer)
      }
      const before = await snapshot(groupId)

      const result = await acceptPresidency(caller, groupId, ACCEPT, SEPTEMBER)

      expect(result.outcome).toBe('has_president')
      expect(result.renewal.prompt).toBe('none')
      expect(await snapshot(groupId)).toEqual(before)
    }
  )

  test.each<[string, CandidateOptions]>([
    ['stepped down as a named successor', { accepted: false }],
    ['declined at the member stage', { namedAt: null, accepted: false }],
  ])(
    'a member who %s accepts from the member stage and keeps how they were named',
    async (_label, options) => {
      const groupId = await chapter()
      const admin = await addMember(groupId, PRESIDENT)
      const caller = await addMember(groupId)
      await addCandidate(groupId, caller, {
        ...options,
        namedBy: options.namedAt === null ? null : admin,
      })
      const before = await candidate(groupId, caller)

      await acceptPresidency(caller, groupId, ACCEPT, SEPTEMBER)

      expect(await candidate(groupId, caller)).toMatchObject({
        named_at: before.named_at,
        named_by: before.named_by,
        accepted: true,
      })
    }
  )

  test('a named President who hasn’t answered keeps the title when an unnamed member accepts', async () => {
    const groupId = await chapter()
    const namedPresident = await addMember(groupId, PRESIDENT)
    const caller = await addMember(groupId)
    await addCandidate(groupId, namedPresident)

    await acceptPresidency(caller, groupId, ACCEPT, SEPTEMBER)

    expect((await memberState(groupId, namedPresident)).title).toBe('President')
    expect((await memberState(groupId, caller)).title).toBe('President')
  })

  test('once every earlier acceptor has left, the next acceptance strips an unnamed President again', async () => {
    const groupId = await chapter()
    const departedAcceptor = await addMember(groupId, {
      ...PRESIDENT,
      departed: true,
    })
    const titledMeanwhile = await addMember(groupId, PRESIDENT)
    const named = await addMember(groupId)
    await addCandidate(groupId, departedAcceptor, { accepted: true })
    await addCandidate(groupId, named)

    await acceptPresidency(named, groupId, ACCEPT, AUGUST)

    expect(await memberState(groupId, titledMeanwhile)).toEqual({
      title: 'Member',
      role: 'admin',
    })
  })

  test.each<[string, MemberOptions]>([
    ['has left the chapter', { ...PRESIDENT, departed: true }],
    ['has a deleted account', { ...PRESIDENT, deleted: true }],
  ])(
    'an unnamed President who %s keeps the title when a successor accepts',
    async (_label, outgoing) => {
      const groupId = await chapter()
      const unnamedPresident = await addMember(groupId, outgoing)
      const named = await addMember(groupId)
      await addCandidate(groupId, named)

      await acceptPresidency(named, groupId, ACCEPT, AUGUST)

      expect((await memberState(groupId, unnamedPresident)).title).toBe(
        'President'
      )
    }
  )

  test.each(Object.values(USER_BAN_TYPES))(
    'refuses a named successor with a %s ban as not eligible',
    async (banType) => {
      const groupId = await chapter()
      const caller = await addMember(groupId, { ...PRESIDENT, banType })
      await addCandidate(groupId, caller)

      await refuses(
        groupId,
        () => acceptPresidency(caller, groupId, ACCEPT, AUGUST),
        NTHSRenewalNotEligibleError
      )
    }
  )

  test.each<[string, MemberOptions, Date]>([
    [
      'a named member who hasn’t finished onboarding',
      { onboarded: false },
      AUGUST,
    ],
    [
      'a named member who isn’t a high school student',
      { highSchool: false },
      AUGUST,
    ],
    [
      'an admin who isn’t a high school student, at the member stage',
      { admin: true, highSchool: false },
      SEPTEMBER,
    ],
  ])('refuses %s as not cleared', async (_label, options, now) => {
    const groupId = await chapter()
    const caller = await addMember(groupId, options)
    if (now === AUGUST) {
      await addCandidate(groupId, caller)
    }

    await refuses(
      groupId,
      () => acceptPresidency(caller, groupId, ACCEPT, now),
      NTHSRenewalNotClearedError
    )
  })

  test('clears an admin who is a high school student without finishing onboarding', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, { ...PRESIDENT, onboarded: false })
    await addCandidate(groupId, caller)

    await acceptPresidency(caller, groupId, { reason: 'renewal' }, AUGUST)

    expect(await candidate(groupId, caller)).toMatchObject({ accepted: true })
  })

  type WindowScenario = {
    now: Date
    candidate?: CandidateOptions
    foundedAt?: string
    flagOff?: boolean
  }
  test.each<[string, WindowScenario]>([
    ['a named member before the successor date', { now: JULY, candidate: {} }],
    ['an unnamed member before the member stage', { now: AUGUST }],
    [
      'a member who stepped down, before the member stage',
      { now: AUGUST, candidate: { accepted: false } },
    ],
    [
      'a member of a chapter founded after the school year began',
      { now: SEPTEMBER, foundedAt: FOUNDED_AFTER_YEAR_START },
    ],
    [
      'a named member while renewal is off',
      { now: AUGUST, candidate: {}, flagOff: true },
    ],
  ])('refuses %s', async (_label, scenario) => {
    const groupId = await chapter(scenario)
    const caller = await addMember(groupId)
    if (scenario.candidate) {
      await addCandidate(groupId, caller, scenario.candidate)
    }
    if (scenario.flagOff) {
      turnRenewalOff()
    }

    await refuses(
      groupId,
      () => acceptPresidency(caller, groupId, ACCEPT, scenario.now),
      NTHSRenewalNotOpenError
    )
  })

  test('refuses a named successor who has left the chapter', async () => {
    const groupId = await chapter()
    const caller = await addMember(groupId, { departed: true })
    await addCandidate(groupId, caller)

    await refuses(
      groupId,
      () => acceptPresidency(caller, groupId, ACCEPT, AUGUST),
      NTHSRenewalNotEligibleError
    )
  })

  test('stores only the program commitments', async () => {
    const groupId = await chapter()
    await addMember(groupId, PRESIDENT)
    const successor = await addMember(groupId)
    await addCandidate(groupId, successor)

    await acceptPresidency(
      successor,
      groupId,
      { ...ACCEPT, commitments: { ...ALL_COMMITMENTS, extra: true } },
      AUGUST
    )

    expect((await candidate(groupId, successor)).commitments).toEqual(
      ALL_COMMITMENTS
    )
  })

  test('a named successor who accepts again gets accepted and nothing changes', async () => {
    const groupId = await chapter()
    await addMember(groupId, PRESIDENT)
    const successor = await addMember(groupId)
    await addCandidate(groupId, successor)
    await acceptPresidency(successor, groupId, ACCEPT, AUGUST)
    const before = await snapshot(groupId)

    const result = await acceptPresidency(successor, groupId, ACCEPT, AUGUST)

    expect(result.outcome).toBe('accepted')
    expect(await snapshot(groupId)).toEqual(before)
  })
})

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
        await addCandidate(groupId, president)
        return () =>
          acceptPresidency(president, groupId, { reason: 'renewal' }, AUGUST)
      },
    ],
    [
      'nameSelfAsSuccessor',
      async (groupId) => {
        const admin = await addMember(groupId, PRESIDENT)
        return () => nameSelfAsSuccessor(admin, groupId, {}, JUNE)
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
