/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { Ulid } from '../../models/pgUtils'
import { USER_BAN_TYPES } from '../../constants'
import type { NTHSTitle } from '../../constants/nths-titles'
import { COMMITMENTS } from '../../services/NTHSApplicationService'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as NTHSRenewalDatesService from '../../services/NTHSRenewalDatesService'
import { getGroups } from '../../services/NTHSGroupsService'
import { getGroupMembers } from '../../models/NTHSGroups/queries'
import {
  insertRenewalNominations,
  upsertRenewalAnswer,
} from '../../models/NTHSRenewal/queries'
import { insertVolunteerOccupations } from '../../models/Volunteer/queries'
import {
  acceptPresidency,
  getRenewalsForViewer,
  NTHSRenewalCommitmentsRequiredError,
  NTHSRenewalNotClearedError,
  NTHSRenewalNotEligibleError,
  NTHSRenewalNotOpenError,
  type RenewalCommitments,
} from '../../services/NTHSRenewalService'
import { createChapter, createChapterMember } from './seed-utils'

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
const DEPARTED_AT = '2027-08-05T15:00:00.000Z'

const MAY = new Date('2027-05-10T15:00:00.000Z')
const AUGUST = new Date('2027-08-12T15:00:00.000Z')
const SEPTEMBER = new Date('2027-09-16T15:00:00.000Z')
const OCT_1_AFTER_CLOSE = new Date('2027-10-01T13:00:00.000Z')

const ALL_COMMITMENTS: RenewalCommitments = Object.fromEntries(
  COMMITMENTS.map(({ key }) => [key, true])
)
const STEP_UP = { reason: 'step-up' as const, commitments: ALL_COMMITMENTS }

type MemberOptions = {
  admin?: boolean
  title?: NTHSTitle
  highSchool?: boolean
  onboarded?: boolean
  banType?: USER_BAN_TYPES
  deleted?: boolean
  deactivated?: boolean
  departed?: boolean
}
const PRESIDENT: MemberOptions = { admin: true, title: 'President' }
const DELETED_PRESIDENT: MemberOptions = { ...PRESIDENT, deleted: true }

async function chapter(admins: MemberOptions[] = [DELETED_PRESIDENT]) {
  const groupId = await createChapter(client)
  await client.query(`UPDATE nths_groups SET created_at = $2 WHERE id = $1`, [
    groupId,
    FOUNDED_AT,
  ])
  for (const admin of admins) {
    await addMember(groupId, admin)
  }
  return groupId
}

async function addMember(
  groupId: Ulid,
  { departed, highSchool = true, ...options }: MemberOptions = {}
): Promise<Ulid> {
  const userId = await createChapterMember(client, groupId, {
    ...options,
    highSchool,
    volunteerProfile: true,
    joinedAt: FOUNDED_AT,
    deactivatedAt: departed ? DEPARTED_AT : null,
  })
  if (!highSchool) {
    await insertVolunteerOccupations(
      userId,
      ['An undergraduate student'],
      client
    )
  }
  return userId
}

async function addCandidate(
  groupId: Ulid,
  userId: Ulid,
  namedBy: Ulid,
  accepted: boolean | null = null
) {
  await insertRenewalNominations(
    groupId,
    SCHOOL_YEAR,
    [userId],
    namedBy,
    client
  )
  if (accepted !== null) {
    await upsertRenewalAnswer(
      {
        groupId,
        schoolYearStartsOn: SCHOOL_YEAR,
        userId,
        accepted,
        commitments: null,
      },
      client
    )
  }
}

async function candidate(groupId: Ulid, userId: Ulid) {
  const { rows } = await client.query(
    `SELECT accepted, commitments FROM nths_group_renewal_candidates
     WHERE nths_group_id = $1 AND user_id = $2 AND school_year_starts_on = $3`,
    [groupId, userId, SCHOOL_YEAR]
  )
  return rows[0]
}

async function memberState(groupId: Ulid, userId: Ulid) {
  const member = (await getGroupMembers(groupId, client)).find(
    (m) => m.userId === userId
  )
  return { title: member?.title, role: member?.roleName }
}

async function snapshot(groupId: Ulid) {
  const candidates = await client.query(
    `SELECT * FROM nths_group_renewal_candidates WHERE nths_group_id = $1 ORDER BY user_id`,
    [groupId]
  )
  const members = await client.query(
    `SELECT m.user_id, m.title, roles.name AS role
     FROM nths_group_members m
     JOIN nths_group_member_roles member_roles
       ON member_roles.nths_group_id = m.nths_group_id AND member_roles.user_id = m.user_id
     JOIN nths_group_roles roles ON roles.id = member_roles.role_id
     WHERE m.nths_group_id = $1 ORDER BY m.user_id`,
    [groupId]
  )
  return { candidates: candidates.rows, members: members.rows }
}

async function promptFor(userId: Ulid, now: Date) {
  const [renewal] = await getRenewalsForViewer(
    userId,
    await getGroups(userId),
    now
  )
  return renewal.prompt
}

async function changesNothing(groupId: Ulid, act: () => Promise<unknown>) {
  const before = await snapshot(groupId)
  const error = await act().then(
    () => undefined,
    (e) => e
  )
  expect(await snapshot(groupId)).toEqual(before)
  return error
}

beforeEach(() => {
  jest
    .mocked(FeatureFlagService.isNthsChapterRenewalEnabled)
    .mockResolvedValue(true)
  jest
    .mocked(NTHSRenewalDatesService.getNthsChapterRenewalDates)
    .mockResolvedValue(DATES)
})

describe('step-up prompt', () => {
  test('offers step-up to a cleared member of a chapter whose only admin deleted their account', async () => {
    const groupId = await chapter()
    const member = await addMember(groupId)

    expect(await promptFor(member, MAY)).toBe('step-up')
  })

  test.each<[string, MemberOptions]>([
    ['who hasn’t finished onboarding', { onboarded: false }],
    ['who isn’t a high school student', { highSchool: false }],
    ...Object.values(USER_BAN_TYPES).map<[string, MemberOptions]>((banType) => [
      `with a ${banType} ban`,
      { banType },
    ]),
  ])('offers no step-up to a member %s', async (_label, options) => {
    const groupId = await chapter()
    const member = await addMember(groupId, options)

    expect(await promptFor(member, MAY)).toBe('none')
  })

  test.each<[string, string, MemberOptions[]]>([
    [
      'an open-account admin who isn’t a high school student',
      'step-up',
      [{ ...PRESIDENT, highSchool: false }],
    ],
    ['a deleted admin', 'step-up', [DELETED_PRESIDENT]],
    [
      'a deleted admin and an admin who is a high school student',
      'none',
      [DELETED_PRESIDENT, { admin: true }],
    ],
    [
      'an admin who turned off notifications',
      'none',
      [{ ...PRESIDENT, deactivated: true }],
    ],
    [
      'a banned admin',
      'none',
      [{ ...PRESIDENT, banType: USER_BAN_TYPES.COMPLETE }],
    ],
    [
      'an admin who hasn’t finished onboarding',
      'none',
      [{ ...PRESIDENT, onboarded: false }],
    ],
  ])(
    'a cleared member of a chapter with %s gets %s',
    async (_label, prompt, admins) => {
      const groupId = await chapter(admins)
      const member = await addMember(groupId)

      expect(await promptFor(member, MAY)).toBe(prompt)
    }
  )
})

describe('acceptPresidency to step up', () => {
  test('makes the stepper an admin and President, and every other open-account President a Member who stays admin', async () => {
    const groupId = await chapter()
    const [deletedAdmin] = (await snapshot(groupId)).members.map(
      (m) => m.user_id
    )
    const otherPresident = await addMember(groupId, {
      ...PRESIDENT,
      highSchool: false,
    })
    await addCandidate(groupId, otherPresident, deletedAdmin)
    const stepper = await addMember(groupId)

    const result = await acceptPresidency(stepper, groupId, STEP_UP, MAY)

    expect(result.outcome).toBe('accepted')
    expect(await memberState(groupId, stepper)).toEqual({
      title: 'President',
      role: 'admin',
    })
    expect(await memberState(groupId, deletedAdmin)).toEqual({
      title: 'President',
      role: 'admin',
    })
    expect(await memberState(groupId, otherPresident)).toEqual({
      title: 'Member',
      role: 'admin',
    })
  })

  test('answers has_president and changes nothing once the chapter has a manager', async () => {
    const groupId = await chapter([PRESIDENT])
    const stepper = await addMember(groupId)
    let result: Awaited<ReturnType<typeof acceptPresidency>> | undefined

    await changesNothing(groupId, async () => {
      result = await acceptPresidency(stepper, groupId, STEP_UP, MAY)
    })
    expect(result?.outcome).toBe('has_president')
  })

  test.each<[string, MemberOptions, object, new (...args: any[]) => Error]>([
    [
      'a banned member',
      { banType: USER_BAN_TYPES.SHADOW },
      STEP_UP,
      NTHSRenewalNotEligibleError,
    ],
    [
      'a member who left',
      { departed: true },
      STEP_UP,
      NTHSRenewalNotEligibleError,
    ],
    [
      'a member who isn’t cleared',
      { onboarded: false },
      STEP_UP,
      NTHSRenewalNotClearedError,
    ],
    [
      'a member without the commitments',
      {},
      { reason: 'step-up' },
      NTHSRenewalCommitmentsRequiredError,
    ],
  ])('refuses %s', async (_label, options, body, error) => {
    const groupId = await chapter()
    const stepper = await addMember(groupId, options)

    const err = await changesNothing(groupId, () =>
      acceptPresidency(stepper, groupId, body as typeof STEP_UP, MAY)
    )
    expect(err).toBeInstanceOf(error)
  })
})

describe('step-up across renewal dates', () => {
  test('writes no renewal answer before the successor date', async () => {
    const groupId = await chapter()
    const stepper = await addMember(groupId)

    await acceptPresidency(stepper, groupId, STEP_UP, MAY)

    expect((await snapshot(groupId)).candidates).toEqual([])
  })

  test.each([
    ['an unnamed member', null],
    ['a named successor who stepped down', false],
  ])(
    '%s who steps up from the successor date confirms the chapter',
    async (_label, accepted) => {
      const groupId = await chapter()
      const [admin] = await getGroupMembers(groupId, client)
      const stepper = await addMember(groupId)
      const other = await addMember(groupId)
      if (accepted !== null) {
        await addCandidate(groupId, stepper, admin.userId, accepted)
      }

      expect(await promptFor(stepper, AUGUST)).toBe('step-up')
      await acceptPresidency(stepper, groupId, STEP_UP, AUGUST)

      expect(await candidate(groupId, stepper)).toMatchObject({
        accepted: true,
        commitments: ALL_COMMITMENTS,
      })
      expect(await promptFor(other, AUGUST)).toBe('none')
    }
  )

  test('a cleared member gets renewal’s member prompt from the member stage', async () => {
    const groupId = await chapter()
    const member = await addMember(groupId)

    expect(await promptFor(member, SEPTEMBER)).toBe('member-must-answer')
  })

  test('after the close instant of a chapter with no confirmed president, offers no step-up and accepting changes nothing', async () => {
    const groupId = await chapter()
    const stepper = await addMember(groupId)

    expect(await promptFor(stepper, OCT_1_AFTER_CLOSE)).not.toBe('step-up')
    let result: Awaited<ReturnType<typeof acceptPresidency>> | undefined
    await changesNothing(groupId, async () => {
      result = await acceptPresidency(
        stepper,
        groupId,
        STEP_UP,
        OCT_1_AFTER_CLOSE
      )
    })
    expect(result?.outcome).toBe('has_president')
  })

  test('offers step-up and confirms the chapter when renewal is off for the viewer', async () => {
    jest
      .mocked(FeatureFlagService.isNthsChapterRenewalEnabled)
      .mockResolvedValue(false)
    const groupId = await chapter()
    const stepper = await addMember(groupId)

    expect(await promptFor(stepper, AUGUST)).toBe('step-up')
    const result = await acceptPresidency(stepper, groupId, STEP_UP, AUGUST)

    expect(result.outcome).toBe('accepted')
    expect(await candidate(groupId, stepper)).toMatchObject({ accepted: true })
  })

  test('offers no step-up and refuses it when the renewal dates can’t be read', async () => {
    jest
      .mocked(NTHSRenewalDatesService.getNthsChapterRenewalDates)
      .mockResolvedValue(null)
    const groupId = await chapter()
    const stepper = await addMember(groupId)

    expect(await promptFor(stepper, MAY)).toBe('none')
    const err = await changesNothing(groupId, () =>
      acceptPresidency(stepper, groupId, STEP_UP, MAY)
    )
    expect(err).toBeInstanceOf(NTHSRenewalNotOpenError)
  })
})
