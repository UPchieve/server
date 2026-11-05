/**
 * @group database/parallel
 */

import type { Job } from 'bull'
import { getClient } from '../../db'
import config from '../../config'
import { Ulid } from '../../models/pgUtils'
import { USER_BAN_TYPES } from '../../constants'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as MailService from '../../services/MailService'
import QueueService from '../../services/QueueService'
import logger from '../../logger'
import * as NotificationService from '../../services/NotificationService'
import * as NTHSGroupsRepo from '../../models/NTHSGroups/queries'
import * as NTHSRenewalRepo from '../../models/NTHSRenewal/queries'
import * as NTHSRenewalDatesService from '../../services/NTHSRenewalDatesService'
import chapterRenewal, {
  type NTHSChapterRenewalJobData,
} from '../../worker/jobs/nths/chapterRenewal'
import spawnChapterRenewal from '../../worker/jobs/nths/spawnChapterRenewal'
import staffChapterClosed, {
  type NTHSStaffChapterClosedJobData,
} from '../../worker/jobs/nths/staffChapterClosed'
import { closeGroupAndRelease } from '../../services/NTHSGroupsService'
import { minutesInMs } from '../../utils/time-utils'
import {
  createChapter,
  createChapterMember,
  type ChapterMemberOptions,
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
const SCHOOL_YEAR = '2026-07-01'
const FOUNDED_AT = '2026-02-10T15:00:00.000Z'
const FOUNDED_AFTER_YEAR_START = '2026-07-15T15:00:00.000Z'
const RESPONDED_AT = new Date('2026-08-03T15:00:00.000Z')
const DEPARTED_AT = '2026-04-05T15:00:00.000Z'

const TEMPLATES = config.sendgrid.nthsRenewal
const CLOSE_DATE = 'September 30'

const at = (iso: string) => new Date(iso)
const BEFORE_NOMINATIONS = at('2026-05-01T11:00:00.000Z')
const MAY_3 = at('2026-05-03T13:00:00.000Z')
const MAY_4 = at('2026-05-04T13:00:00.000Z')
const MAY_5 = at('2026-05-05T13:00:00.000Z')
const BEFORE_SUCCESSOR_DATE = at('2026-08-01T11:00:00.000Z')
const AUG_2 = at('2026-08-02T13:00:00.000Z')
const AUG_3 = at('2026-08-03T13:00:00.000Z')
const MEMBER_STAGE_OPENS = at('2026-09-15T12:00:00.000Z')
const SEPT_16 = at('2026-09-16T13:00:00.000Z')
const SEPT_17 = at('2026-09-17T13:00:00.000Z')
const SEPT_20 = at('2026-09-20T13:00:00.000Z')
const OCT_1_1100 = at('2026-10-01T11:00:00.000Z')
const OCT_1_1300 = at('2026-10-01T13:00:00.000Z')
const OCT_1_1400 = at('2026-10-01T14:00:00.000Z')
const OCT_1_1800 = at('2026-10-01T18:00:00.000Z')
const OCT_2_1200 = at('2026-10-02T12:00:00.000Z')

type CandidateOptions = {
  accepted?: boolean | null
  schoolYear?: string
  respondedAt?: Date
}

type Send = {
  userId: Ulid
  templateId: string
  data: Record<string, unknown>
}

const ourUsers = new Set<Ulid>()
const emailToUser = new Map<string, Ulid>()
const flagOff = new Set<Ulid>()

beforeEach(() => {
  ourUsers.clear()
  emailToUser.clear()
  flagOff.clear()
  jest
    .mocked(FeatureFlagService.isNthsChapterRenewalEnabled)
    .mockImplementation(
      // Scoped to this test's people so a run leaves other tests' chapters alone.
      async (userId: Ulid) => ourUsers.has(userId) && !flagOff.has(userId)
    )
  jest
    .mocked(NTHSRenewalDatesService.getNthsChapterRenewalDates)
    .mockResolvedValue(DATES)
  jest.mocked(MailService.sendNthsRenewalEmail).mockReset()
  jest.mocked(MailService.sendNthsRenewalEmail).mockResolvedValue(undefined)
  jest.mocked(QueueService.add).mockClear()
})

afterEach(() => {
  jest.restoreAllMocks()
})

const normalised = (ids: string[]) =>
  ids.map((id) => id.replace(/-/g, '').toUpperCase())

async function runSpawnerAt(now: Date) {
  jest.useFakeTimers({
    now,
    doNotFake: [
      'hrtime',
      'nextTick',
      'performance',
      'queueMicrotask',
      'setImmediate',
      'clearImmediate',
      'setInterval',
      'clearInterval',
      'setTimeout',
      'clearTimeout',
    ],
  })
  try {
    await spawnChapterRenewal()
  } finally {
    jest.useRealTimers()
  }
}

// Runs every chapter job even after one fails, as Bull would.
async function runChapterRenewal(now: Date) {
  const add = jest.mocked(QueueService.add)
  const queuedBefore = add.mock.calls.length
  await runSpawnerAt(now)
  const spawned = add.mock.calls
    .slice(queuedBefore)
    .filter(([name]) => name === 'NTHSChapterRenewal')
  const failures: unknown[] = []
  for (const [, , data] of spawned) {
    try {
      await chapterRenewal({ data } as Job<NTHSChapterRenewalJobData>)
    } catch (err) {
      failures.push(err)
    }
  }
  if (failures.length) {
    throw failures[0]
  }
}

async function runJob(nthsGroupId: Ulid, now: Date) {
  await chapterRenewal({
    data: { nthsGroupId, now: now.toISOString() },
  } as Job<NTHSChapterRenewalJobData>)
}

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
  options: ChapterMemberOptions = {}
): Promise<Ulid> {
  const userId = await createChapterMember(client, groupId, {
    volunteerProfile: true,
    highSchool: true,
    joinedAt: FOUNDED_AT,
    ...options,
  })
  const { rows } = await client.query(`SELECT email FROM users WHERE id = $1`, [
    userId,
  ])
  ourUsers.add(userId)
  emailToUser.set(rows[0].email, userId)
  return userId
}

async function addCandidate(
  groupId: Ulid,
  userId: Ulid,
  options: CandidateOptions = {}
): Promise<void> {
  const accepted = options.accepted ?? null
  await client.query(
    `INSERT INTO nths_group_renewal_candidates
       (nths_group_id, school_year_starts_on, user_id, accepted, responded_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      groupId,
      options.schoolYear ?? SCHOOL_YEAR,
      userId,
      accepted,
      accepted === null ? null : (options.respondedAt ?? RESPONDED_AT),
    ]
  )
}

async function makeAdmin(groupId: Ulid, userId: Ulid) {
  await client.query(
    `UPDATE nths_group_member_roles
     SET role_id = (SELECT id FROM nths_group_roles WHERE name = 'admin')
     WHERE nths_group_id = $1 AND user_id = $2`,
    [groupId, userId]
  )
}

async function leave(groupId: Ulid, userId: Ulid, departedAt: string) {
  await client.query(
    `UPDATE nths_group_members SET deactivated_at = $3
     WHERE nths_group_id = $1 AND user_id = $2`,
    [groupId, userId, departedAt]
  )
}

async function deleteAccount(userId: Ulid) {
  await client.query(`UPDATE users SET deleted = true WHERE id = $1`, [userId])
}

async function recordSent(userId: Ulid, templateId: string, sentAt: Date) {
  await client.query(
    `INSERT INTO notifications (id, user_id, email_template_id, method_id, sent_at)
     SELECT generate_ulid(), $1, $2, id, $3 FROM notification_methods WHERE method = 'email'`,
    [userId, templateId, sentAt]
  )
}

function sends(templateId?: string): Send[] {
  return jest
    .mocked(MailService.sendNthsRenewalEmail)
    .mock.calls.filter(([email]) => emailToUser.has(email))
    .map(([email, sentTemplateId, data]) => ({
      userId: emailToUser.get(email)!,
      templateId: sentTemplateId,
      data,
    }))
    .filter((send) => !templateId || send.templateId === templateId)
}

function syncedUsers(): Ulid[] {
  return jest
    .mocked(QueueService.add)
    .mock.calls.filter(([name]) => name === 'SyncSendGridContact')
    .map(([, , data]) => (data as { userId: Ulid }).userId)
    .filter((userId) => ourUsers.has(userId))
    .sort()
}

function recipients(templateId?: string): Ulid[] {
  return sends(templateId)
    .map((send) => send.userId)
    .sort()
}

async function recorded(userId: Ulid): Promise<string[]> {
  const { rows } = await client.query(
    `SELECT email_template_id FROM notifications WHERE user_id = $1 ORDER BY email_template_id`,
    [userId]
  )
  return rows.map((r) => r.email_template_id)
}

async function nameOf(userId: Ulid): Promise<string> {
  const { rows } = await client.query(
    `SELECT first_name FROM users WHERE id = $1`,
    [userId]
  )
  return rows[0].first_name
}

async function chapterName(groupId: Ulid): Promise<string> {
  const { rows } = await client.query(
    `SELECT name FROM nths_groups WHERE id = $1`,
    [groupId]
  )
  return rows[0].name
}

async function closedAtOf(groupId: Ulid): Promise<Date | null> {
  const { rows } = await client.query(
    `SELECT closed_at FROM nths_groups WHERE id = $1`,
    [groupId]
  )
  return rows[0].closed_at
}

async function handClose(groupId: Ulid, closedAt: string) {
  await client.query(`UPDATE nths_groups SET closed_at = $2 WHERE id = $1`, [
    groupId,
    closedAt,
  ])
  await client.query(
    `UPDATE nths_group_members SET deactivated_at = $2
     WHERE nths_group_id = $1 AND deactivated_at IS NULL`,
    [groupId, closedAt]
  )
}

async function unconfirmedChapter() {
  const groupId = await chapter()
  const admin = await addMember(groupId, { admin: true })
  const member = await addMember(groupId)
  return { groupId, admin, member }
}

async function confirmedChapter() {
  const groupId = await chapter()
  const acceptor = await addMember(groupId, { admin: true })
  const member = await addMember(groupId)
  await addCandidate(groupId, acceptor, { accepted: true })
  return { groupId, acceptor, member }
}

describe('chapter job spawner', () => {
  test.each([
    ['before nominations open', BEFORE_NOMINATIONS],
    ['after the close window ends', OCT_2_1200],
  ])('queues no chapter jobs %s', async (_label, now) => {
    await unconfirmedChapter()

    await runSpawnerAt(now)

    expect(
      jest
        .mocked(QueueService.add)
        .mock.calls.filter(([name]) => name === 'NTHSChapterRenewal')
    ).toEqual([])
  })
})

describe('handoff email', () => {
  test('goes once to a cleared admin of a renewing chapter, banned included, with the confirmation and close dates', async () => {
    const groupId = await chapter()
    const admin = await addMember(groupId, { admin: true })
    const banned = await addMember(groupId, {
      admin: true,
      banType: USER_BAN_TYPES.COMPLETE,
    })
    await addMember(groupId, { admin: true, onboarded: false })

    await runChapterRenewal(MAY_3)
    await runChapterRenewal(MAY_4)

    expect(recipients(TEMPLATES.handoff)).toHaveLength(3)
    expect(sends(TEMPLATES.handoff)).toContainEqual({
      userId: admin,
      templateId: TEMPLATES.handoff,
      data: {
        firstName: await nameOf(admin),
        chapterName: await chapterName(groupId),
        closeDate: CLOSE_DATE,
      },
    })
    expect(recipients(TEMPLATES.handoff)).toContain(banned)
    expect(await recorded(admin)).toEqual([TEMPLATES.handoff])
  })

  test.each([
    ['a plain member', async () => addMember(await chapter())],
    [
      'an admin without the high school occupation',
      async () =>
        addMember(await chapter(), { admin: true, highSchool: false }),
    ],
    [
      'an admin whose account is deactivated',
      async () =>
        addMember(await chapter(), { admin: true, deactivated: true }),
    ],
    [
      'a deleted admin',
      async () => addMember(await chapter(), { admin: true, deleted: true }),
    ],
    [
      'an admin of a chapter founded after the school year began',
      async () =>
        addMember(await chapter({ foundedAt: FOUNDED_AFTER_YEAR_START }), {
          admin: true,
        }),
    ],
    [
      'an admin of a closed chapter',
      async () =>
        addMember(await chapter({ closedAt: '2026-03-01T12:00:00.000Z' }), {
          admin: true,
        }),
    ],
  ])('skips %s', async (_label, seed) => {
    const userId = await seed()

    await runChapterRenewal(MAY_3)

    expect(recipients()).not.toContain(userId)
  })

  test('is not sent once confirmation opens', async () => {
    await unconfirmedChapter()

    await runChapterRenewal(AUG_2)

    expect(sends(TEMPLATES.handoff)).toEqual([])
  })
})

describe('confirm email', () => {
  test.each([
    ['the President title', 'President', true],
    ['another title', 'Member', false],
  ])(
    'goes once to a cleared admin with %s, with isPresident and the close date',
    async (_label, title, isPresident) => {
      const groupId = await chapter()
      const admin = await addMember(groupId, { admin: true, title })

      await runChapterRenewal(AUG_2)
      await runChapterRenewal(AUG_3)

      expect(sends(TEMPLATES.confirmReturn)).toEqual([
        {
          userId: admin,
          templateId: TEMPLATES.confirmReturn,
          data: {
            firstName: await nameOf(admin),
            chapterName: await chapterName(groupId),
            closeDate: CLOSE_DATE,
            isPresident,
          },
        },
      ])
    }
  )

  test.each([
    ['a plain member', () => unconfirmedChapter().then((c) => c.member)],
    [
      'an uncleared admin',
      async () => {
        const groupId = await chapter()
        await addMember(groupId, { admin: true })
        return addMember(groupId, { admin: true, highSchool: false })
      },
    ],
    [
      'an admin of a chapter with a confirmed president',
      async () => (await confirmedChapter()).acceptor,
    ],
  ])('skips %s', async (_label, seed) => {
    const userId = await seed()

    await runChapterRenewal(AUG_2)

    expect(recipients(TEMPLATES.confirmReturn)).not.toContain(userId)
  })

  test.each([
    ['before confirmation opens', BEFORE_SUCCESSOR_DATE, 0],
    ['at the confirmation date', AUG_2, 1],
    ['from the member stage on', MEMBER_STAGE_OPENS, 0],
  ])('is sent %s: %i', async (_label, now, count) => {
    await unconfirmedChapter()

    await runChapterRenewal(now)

    expect(sends(TEMPLATES.confirmReturn)).toHaveLength(count)
  })
})

describe('member stage email', () => {
  test('goes once to every current member of an unconfirmed renewing chapter, uncleared and banned included', async () => {
    const groupId = await chapter()
    const admin = await addMember(groupId, { admin: true })
    const member = await addMember(groupId)
    const uncleared = await addMember(groupId, {
      highSchool: false,
      onboarded: false,
    })
    const banned = await addMember(groupId, {
      banType: USER_BAN_TYPES.COMPLETE,
    })
    await addMember(groupId, { deactivated: true })
    await addMember(groupId, { deactivatedAt: DEPARTED_AT })

    await runChapterRenewal(SEPT_16)
    await runChapterRenewal(SEPT_17)

    expect(recipients(TEMPLATES.memberStage)).toEqual(
      [admin, member, uncleared, banned].sort()
    )
    expect(sends(TEMPLATES.memberStage)).toContainEqual({
      userId: member,
      templateId: TEMPLATES.memberStage,
      data: {
        firstName: await nameOf(member),
        chapterName: await chapterName(groupId),
        closeDate: CLOSE_DATE,
      },
    })
  })

  test('skips a chapter with a confirmed president', async () => {
    await confirmedChapter()

    await runChapterRenewal(SEPT_16)

    expect(sends(TEMPLATES.memberStage)).toEqual([])
  })

  test.each([
    ['a managed chapter', true, 0],
    ['an unmanaged chapter', false, 1],
  ])('on the confirmation date, %s gets %i', async (_label, managed, count) => {
    const groupId = await chapter()
    await addMember(groupId, { admin: managed })
    await addMember(groupId, { admin: true, highSchool: false })

    await runChapterRenewal(AUG_2)

    expect(sends(TEMPLATES.memberStage)).toHaveLength(count * 2)
  })

  test.each([
    ['is not sent before the member stage opens', AUG_3, 0],
    ['goes out at the instant the member stage opens', MEMBER_STAGE_OPENS, 1],
    ['stops at 11:00 UTC on the day after the close date', OCT_1_1100, 0],
  ])('the email %s', async (_label, now, count) => {
    const groupId = await chapter()
    await addMember(groupId, { admin: true })

    await runChapterRenewal(now)

    expect(sends(TEMPLATES.memberStage)).toHaveLength(count)
  })

  test.each([
    [
      'handoff',
      TEMPLATES.handoff,
      [MAY_3, MAY_4, MAY_5],
      async (groupId: Ulid, member: Ulid) => {
        await makeAdmin(groupId, member)
        return [member]
      },
    ],
    [
      'member stage',
      TEMPLATES.memberStage,
      [SEPT_16, SEPT_17, SEPT_20],
      async (groupId: Ulid, member: Ulid) => [await addMember(groupId), member],
    ],
  ])(
    'reaches someone who qualifies after an earlier %s run on the next run, once',
    async (_label, templateId, [first, second, third], qualifyLater) => {
      const groupId = await chapter()
      const member = await addMember(groupId)
      await runChapterRenewal(first)

      const expected = await qualifyLater(groupId, member)
      await runChapterRenewal(second)
      await runChapterRenewal(third)

      expect(recipients(templateId)).toEqual(expected.sort())
    }
  )
})

describe('emails already sent', () => {
  test('counts only emails sent from January 1 of the cycle year', async () => {
    const groupId = await chapter()
    const person = await addMember(groupId)
    await recordSent(
      person,
      TEMPLATES.memberStage,
      at('2025-12-31T23:59:00.000Z')
    )

    await runChapterRenewal(SEPT_17)

    expect(recipients(TEMPLATES.memberStage)).toContain(person)
  })
})

describe('renewal flag and dates', () => {
  test('sends nothing to a person with the flag off, then sends on the next run once it is on', async () => {
    const groupId = await chapter()
    const admin = await addMember(groupId, { admin: true })
    flagOff.add(admin)

    await runChapterRenewal(AUG_2)
    expect(recipients(TEMPLATES.confirmReturn)).toEqual([])
    expect(await recorded(admin)).toEqual([])

    flagOff.delete(admin)
    await runChapterRenewal(AUG_3)
    expect(recipients(TEMPLATES.confirmReturn)).toEqual([admin])
  })

  test('sends and closes nothing when there are no renewal dates', async () => {
    jest
      .mocked(NTHSRenewalDatesService.getNthsChapterRenewalDates)
      .mockResolvedValue(null)
    const { groupId } = await unconfirmedChapter()

    await runChapterRenewal(OCT_1_1300)
    await runJob(groupId, OCT_1_1300)

    expect(sends()).toEqual([])
    expect(await closedAtOf(groupId)).toBeNull()
  })
})

describe('failed sends', () => {
  test.each([
    ['member stage', SEPT_16, SEPT_17, TEMPLATES.memberStage],
    ['closed', OCT_1_1300, OCT_1_1400, TEMPLATES.chapterClosed],
  ])(
    'records nothing for a failed %s recipient, still sends to the others, fails the job, and retries on the next run',
    async (_label, firstRun, nextRun, templateId) => {
      const { admin, member } = await unconfirmedChapter()
      const { rows } = await client.query(
        `SELECT email FROM users WHERE id = $1`,
        [member]
      )
      jest
        .mocked(MailService.sendNthsRenewalEmail)
        .mockImplementation(async (email) => {
          if (email === rows[0].email) {
            throw new Error('SendGrid is down')
          }
        })

      const failure = await runChapterRenewal(firstRun).catch((err) => err)
      expect(failure.message).toContain(`to user ${member}`)
      expect(failure.message).not.toContain(rows[0].email)
      expect(await recorded(admin)).toEqual([templateId])
      expect(await recorded(member)).toEqual([])

      jest.mocked(MailService.sendNthsRenewalEmail).mockResolvedValue(undefined)
      await runChapterRenewal(nextRun)

      expect(await recorded(member)).toEqual([templateId])
      expect(sends(templateId).filter((s) => s.userId === admin)).toHaveLength(
        1
      )
    }
  )
})

describe('unrecorded sends', () => {
  test('fails the job when an email went out but its record was not saved', async () => {
    await unconfirmedChapter()
    jest
      .spyOn(NotificationService, 'createEmailNotification')
      .mockRejectedValueOnce(new Error('write failed'))

    await expect(runChapterRenewal(SEPT_16)).rejects.toThrow(
      `record ${TEMPLATES.memberStage}`
    )
  })
})

describe('closing unconfirmed chapters', () => {
  test('closes an unconfirmed renewing chapter at the run instant after the close instant', async () => {
    const { groupId } = await unconfirmedChapter()

    await runChapterRenewal(OCT_1_1300)

    expect(await closedAtOf(groupId)).toEqual(OCT_1_1300)
  })

  test('keeps the run instant when the worker clock leads the database', async () => {
    const { groupId } = await unconfirmedChapter()
    const aheadOfDatabase = new Date(Date.now() + minutesInMs(1))

    await closeGroupAndRelease(groupId, aheadOfDatabase, client)

    expect(await closedAtOf(groupId)).toEqual(aheadOfDatabase)
  })

  test('sends the closed email to each member the close ended, banned included, deactivated and deleted accounts excluded', async () => {
    const groupId = await chapter()
    const admin = await addMember(groupId, { admin: true })
    const banned = await addMember(groupId, {
      banType: USER_BAN_TYPES.COMPLETE,
    })
    await addMember(groupId, { deactivated: true })
    await addMember(groupId, { deleted: true })
    await addMember(groupId, { deactivatedAt: DEPARTED_AT })

    await runChapterRenewal(OCT_1_1300)

    expect(recipients()).toEqual([admin, banned].sort())
    expect(sends()).toContainEqual({
      userId: admin,
      templateId: TEMPLATES.chapterClosed,
      data: {
        firstName: await nameOf(admin),
        chapterName: await chapterName(groupId),
        closeDate: CLOSE_DATE,
      },
    })
  })

  test('closes a chapter with no members whatever the flag says, and sends no email', async () => {
    const groupId = await chapter()

    await runChapterRenewal(OCT_1_1300)

    expect(await closedAtOf(groupId)).not.toBeNull()
    expect(
      jest.mocked(MailService.sendNthsRenewalEmail)
    ).not.toHaveBeenCalledWith(
      expect.anything(),
      TEMPLATES.chapterClosed,
      expect.objectContaining({ chapterName: await chapterName(groupId) })
    )
  })

  test.each([
    [
      'a chapter with a confirmed president',
      async () => (await confirmedChapter()).groupId,
    ],
    [
      'a chapter founded after the school year began',
      async () => {
        const groupId = await chapter({ foundedAt: FOUNDED_AFTER_YEAR_START })
        await addMember(groupId, { admin: true })
        return groupId
      },
    ],
  ])('leaves open %s', async (_label, seed) => {
    const groupId = await seed()

    await runChapterRenewal(OCT_1_1300)

    expect(await closedAtOf(groupId)).toBeNull()
    expect(sends(TEMPLATES.chapterClosed)).toEqual([])
  })

  test.each([
    [
      'closes a chapter whose only acceptor left before the close instant',
      async (groupId: Ulid, acceptor: Ulid) =>
        leave(groupId, acceptor, '2026-10-01T11:30:00.000Z'),
      true,
    ],
    [
      'leaves open a chapter whose only acceptor left after the close instant',
      async (groupId: Ulid, acceptor: Ulid) =>
        leave(groupId, acceptor, '2026-10-01T12:30:00.000Z'),
      false,
    ],
    [
      'closes a chapter whose only acceptor deleted their account before the run',
      async (_groupId: Ulid, acceptor: Ulid) => deleteAccount(acceptor),
      true,
    ],
  ])('%s', async (_label, change, closes) => {
    const { groupId, acceptor, member } = await confirmedChapter()
    await change(groupId, acceptor)

    await runChapterRenewal(OCT_1_1300)

    expect((await closedAtOf(groupId)) !== null).toBe(closes)
    expect(recipients(TEMPLATES.chapterClosed)).toEqual(closes ? [member] : [])
  })

  test.each([
    ['it would end', async () => {}],
    [
      'it would end, though every member has already left',
      async (groupId: Ulid, ids: Ulid[]) => {
        for (const id of ids) {
          await leave(groupId, id, DEPARTED_AT)
        }
      },
    ],
  ])(
    'keeps a chapter open while the flag is off for a member %s, and closes it on a later run in the window once it is on',
    async (_label, prepare) => {
      const { groupId, admin, member } = await unconfirmedChapter()
      await prepare(groupId, [admin, member])
      flagOff.add(member)

      await runChapterRenewal(OCT_1_1300)
      expect(await closedAtOf(groupId)).toBeNull()
      expect(sends()).toEqual([])

      flagOff.delete(member)
      await runChapterRenewal(OCT_1_1800)
      expect(await closedAtOf(groupId)).not.toBeNull()
    }
  )

  test('closes nothing new and resends no closed email on a rerun in the window', async () => {
    const { groupId, admin, member } = await unconfirmedChapter()
    await runChapterRenewal(OCT_1_1300)
    const first = await closedAtOf(groupId)

    await runChapterRenewal(OCT_1_1400)

    expect(await closedAtOf(groupId)).toEqual(first)
    expect(recipients(TEMPLATES.chapterClosed)).toEqual([admin, member].sort())
  })

  test('closes in the window after a close date moved earlier', async () => {
    jest
      .mocked(NTHSRenewalDatesService.getNthsChapterRenewalDates)
      .mockResolvedValue({ ...DATES, closeDate: '09-24' })
    const { groupId, member } = await unconfirmedChapter()

    await runChapterRenewal(at('2026-09-25T14:00:00.000Z'))

    expect(await closedAtOf(groupId)).not.toBeNull()
    expect(sends(TEMPLATES.chapterClosed)).toContainEqual(
      expect.objectContaining({
        userId: member,
        data: expect.objectContaining({ closeDate: 'September 24' }),
      })
    )
  })
})

describe('closing under concurrent changes', () => {
  async function confirmPresident(groupId: Ulid, admin: Ulid) {
    await addCandidate(groupId, admin, { accepted: true })
  }

  test('leaves a chapter open when its president is confirmed after the run read it as due', async () => {
    const { groupId, admin } = await unconfirmedChapter()
    const [targetId] = normalised([groupId])
    const readDue = NTHSRenewalRepo.getChapterDueToRenewalClose
    jest
      .spyOn(NTHSRenewalRepo, 'getChapterDueToRenewalClose')
      .mockImplementation(async (...args) => {
        const due = await readDue(...args)
        if (!args[3] && normalised([args[0]])[0] === targetId) {
          await confirmPresident(groupId, admin)
        }
        return due
      })

    await runChapterRenewal(OCT_1_1300)

    expect(await closedAtOf(groupId)).toBeNull()
    expect(sends(TEMPLATES.chapterClosed)).toEqual([])
    expect(syncedUsers()).toEqual([])
  })

  test('leaves a chapter open when its president is confirmed from another connection just before the close takes its lock', async () => {
    const { groupId, admin } = await unconfirmedChapter()
    const [targetId] = normalised([groupId])
    const lock = NTHSGroupsRepo.lockGroupForMemberChange
    jest
      .spyOn(NTHSGroupsRepo, 'lockGroupForMemberChange')
      .mockImplementation(async (lockedId, tc) => {
        if (normalised([lockedId])[0] === targetId) {
          await confirmPresident(groupId, admin)
        }
        return lock(lockedId, tc)
      })

    await runChapterRenewal(OCT_1_1300)

    expect(await closedAtOf(groupId)).toBeNull()
    expect(sends(TEMPLATES.chapterClosed)).toEqual([])
    expect(syncedUsers()).toEqual([])
  })
})

describe('closing: sync, end-of-window log', () => {
  test('queues a SendGrid sync for each member of a closed chapter, and none for a chapter the flag skipped', async () => {
    const closed = await unconfirmedChapter()
    const skipped = await unconfirmedChapter()
    flagOff.add(skipped.member)

    await runChapterRenewal(OCT_1_1300)

    expect(syncedUsers()).toEqual([closed.admin, closed.member].sort())
  })

  test('keeps the close and still sends the closed email when a sync fails, then fails the job', async () => {
    const { groupId, admin, member } = await unconfirmedChapter()
    const queue = jest.mocked(QueueService.add)
    queue.mockImplementation(async (name) => {
      if (name === 'SyncSendGridContact') {
        throw new Error('queue down')
      }
    })

    await expect(runChapterRenewal(OCT_1_1300)).rejects.toThrow('close')

    expect(await closedAtOf(groupId)).not.toBeNull()
    expect(recipients(TEMPLATES.chapterClosed)).toEqual([admin, member].sort())
    queue.mockReset()
  })

  test('logs the chapter and fails the job when a read outside the send and close steps throws', async () => {
    const { groupId } = await unconfirmedChapter()
    jest
      .spyOn(NTHSRenewalRepo, 'getRenewalClosedEmailRecipients')
      .mockRejectedValueOnce(new Error('read failed'))
    const error = jest.spyOn(logger, 'error').mockImplementation(() => logger)

    await expect(runJob(groupId, OCT_1_1300)).rejects.toThrow('read failed')

    expect(error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ groupId })
    )
  })

  test('warns for the chapter whose close failed, on the last run of the window only', async () => {
    const failing = await unconfirmedChapter()
    const lock = NTHSGroupsRepo.lockGroupForMemberChange
    const [failingId] = normalised([failing.groupId])
    jest
      .spyOn(NTHSGroupsRepo, 'lockGroupForMemberChange')
      .mockImplementation(async (groupId, tc) => {
        if (normalised([groupId])[0] === failingId) {
          throw new Error('lock failed')
        }
        return lock(groupId, tc)
      })
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => logger)

    await expect(
      runChapterRenewal(at('2026-10-02T10:00:00.000Z'))
    ).rejects.toThrow('close')
    expect(warn).not.toHaveBeenCalled()

    await expect(
      runChapterRenewal(at('2026-10-02T11:00:00.000Z'))
    ).rejects.toThrow('close')
    expect(warn).toHaveBeenCalledTimes(1)
    const [message, context] = warn.mock.calls[0] as [
      string,
      { groupId: string },
    ]
    expect(message).toContain('last run')
    expect(normalised([context.groupId])).toEqual([failingId])
  })
})

describe('closed email recipients', () => {
  test.each([
    [
      'hand-closed before the window',
      FOUNDED_AT,
      '2026-09-20T12:00:00.000Z',
      false,
    ],
    [
      'hand-closed in the window with a confirmed president',
      FOUNDED_AT,
      '2026-10-01T12:30:00.000Z',
      true,
    ],
    [
      'founded after the school year began, hand-closed in the window',
      FOUNDED_AFTER_YEAR_START,
      '2026-10-01T12:30:00.000Z',
      false,
    ],
  ])(
    'sends none for a chapter %s',
    async (_label, foundedAt, closedAt, confirmed) => {
      const groupId = await chapter({ foundedAt })
      const president = await addMember(groupId, { admin: true })
      await addMember(groupId)
      if (confirmed) {
        await addCandidate(groupId, president, {
          accepted: true,
        })
      }
      await handClose(groupId, closedAt)

      await runChapterRenewal(OCT_1_1300)

      expect(sends(TEMPLATES.chapterClosed)).toEqual([])
    }
  )

  test('emails only the members of the chapter whose job runs', async () => {
    const first = await unconfirmedChapter()
    const second = await unconfirmedChapter()
    await handClose(first.groupId, '2026-10-01T12:30:00.000Z')
    await handClose(second.groupId, '2026-10-01T12:30:00.000Z')

    await runJob(first.groupId, OCT_1_1300)

    expect(recipients(TEMPLATES.chapterClosed)).toEqual(
      [first.admin, first.member].sort()
    )
  })

  test.each([
    [
      'a closed email sent before the close instant',
      TEMPLATES.chapterClosed,
      at('2026-09-01T12:00:00.000Z'),
    ],
    ['a different email sent after it', TEMPLATES.memberStage, OCT_1_1300],
  ])('is not suppressed by %s', async (_label, templateId, sentAt) => {
    const { member } = await unconfirmedChapter()
    await recordSent(member, templateId, sentAt)

    await runChapterRenewal(OCT_1_1300)

    expect(recipients(TEMPLATES.chapterClosed)).toContain(member)
  })
})

describe('renewal confirmation scoping', () => {
  async function chapterWithPreviousYearConfirmation() {
    const groupId = await chapter()
    const acceptor = await addMember(groupId, { admin: true })
    await addCandidate(groupId, acceptor, {
      accepted: true,
      schoolYear: '2025-07-01',
    })
    return { groupId, acceptor }
  }

  test('a confirmation for the previous school year does not stop the close', async () => {
    const { groupId, acceptor } = await chapterWithPreviousYearConfirmation()

    await runChapterRenewal(OCT_1_1300)

    expect(await closedAtOf(groupId)).not.toBeNull()
    expect(recipients(TEMPLATES.chapterClosed)).toEqual([acceptor])
  })

  test('a member who has not answered does not save the chapter', async () => {
    const { groupId, admin, member } = await unconfirmedChapter()
    await addCandidate(groupId, member, { accepted: null })

    await runChapterRenewal(OCT_1_1300)

    expect(await closedAtOf(groupId)).not.toBeNull()
    expect(recipients(TEMPLATES.chapterClosed)).toEqual([admin, member].sort())
  })

  test('a confirmation for the previous school year does not stop the member-stage email', async () => {
    const { acceptor } = await chapterWithPreviousYearConfirmation()

    await runChapterRenewal(SEPT_16)

    expect(recipients(TEMPLATES.memberStage)).toEqual([acceptor])
  })

  test.each([
    ['at the close instant', at('2026-10-01T12:00:00.000Z')],
    ['after the close instant', at('2026-10-01T12:30:00.000Z')],
  ])(
    'an acceptance %s does not save the chapter',
    async (_label, respondedAt) => {
      const groupId = await chapter()
      const acceptor = await addMember(groupId, { admin: true })
      const member = await addMember(groupId)
      await addCandidate(groupId, acceptor, {
        accepted: true,
        respondedAt,
      })

      await runChapterRenewal(OCT_1_1300)

      expect(await closedAtOf(groupId)).not.toBeNull()
      expect(recipients(TEMPLATES.chapterClosed)).toEqual(
        [acceptor, member].sort()
      )
    }
  )
})

describe('renewal email recipients', () => {
  test.each([
    [
      'left',
      (groupId: Ulid, userId: Ulid) => leave(groupId, userId, DEPARTED_AT),
    ],
    ['was deleted', (_groupId: Ulid, userId: Ulid) => deleteAccount(userId)],
  ])(
    'a chapter whose acceptor %s still gets the handoff and member-stage emails',
    async (_label, remove) => {
      const { groupId, acceptor, member } = await confirmedChapter()
      const otherAdmin = await addMember(groupId, { admin: true })
      await remove(groupId, acceptor)

      await runChapterRenewal(MAY_3)
      await runChapterRenewal(SEPT_16)

      expect(recipients(TEMPLATES.handoff)).toEqual([otherAdmin])
      expect(recipients(TEMPLATES.memberStage)).toEqual(
        [otherAdmin, member].sort()
      )
    }
  )
})

describe('staff close email', () => {
  const runStaffClose = (nthsGroupId: Ulid) =>
    staffChapterClosed({
      data: { nthsGroupId },
    } as Job<NTHSStaffChapterClosedJobData>)

  const closeChapter = (groupId: Ulid) =>
    closeGroupAndRelease(groupId, null, client)

  async function staffClosedChapter() {
    const groupId = await chapter()
    const admin = await addMember(groupId, { admin: true })
    const member = await addMember(groupId)
    return { groupId, admin, member }
  }

  test('emails the members the close ended with no close date, whatever the flag says', async () => {
    const { groupId, admin, member } = await staffClosedChapter()
    flagOff.add(admin)
    flagOff.add(member)
    const banned = await addMember(groupId, {
      banType: USER_BAN_TYPES.COMPLETE,
    })
    const tester = await addMember(groupId, { testUser: true })
    await addMember(groupId, { deactivated: true })
    await addMember(groupId, { deleted: true })
    await addMember(groupId, { deactivatedAt: DEPARTED_AT })

    await closeChapter(groupId)
    await runStaffClose(groupId)

    expect(recipients(TEMPLATES.chapterClosed)).toEqual(
      [admin, member, banned, tester].sort()
    )
    for (const send of sends(TEMPLATES.chapterClosed)) {
      expect(send.data).toEqual({
        firstName: await nameOf(send.userId),
        chapterName: await chapterName(groupId),
      })
      expect(await recorded(send.userId)).toEqual([TEMPLATES.chapterClosed])
    }
    expect(syncedUsers()).toEqual([admin, member, banned, tester].sort())
  })

  test('a closed email from an earlier chapter does not stop this one', async () => {
    const { groupId, admin, member } = await staffClosedChapter()
    await recordSent(member, TEMPLATES.chapterClosed, new Date(FOUNDED_AT))

    await closeChapter(groupId)
    await runStaffClose(groupId)

    expect(recipients(TEMPLATES.chapterClosed)).toEqual([admin, member].sort())
  })

  test('a retry after a partial failure emails only who is left', async () => {
    const { groupId, admin, member } = await staffClosedChapter()
    await closeChapter(groupId)
    const send = jest.mocked(MailService.sendNthsRenewalEmail)
    send.mockImplementation(async (email) => {
      if (emailToUser.get(email) === member) {
        throw new Error('sendgrid down')
      }
    })

    await expect(runStaffClose(groupId)).rejects.toThrow(
      `send ${TEMPLATES.chapterClosed} to user ${member}`
    )
    expect(await recorded(admin)).toEqual([TEMPLATES.chapterClosed])
    expect(await recorded(member)).toEqual([])

    send.mockClear()
    send.mockResolvedValue(undefined)
    await runStaffClose(groupId)

    expect(recipients(TEMPLATES.chapterClosed)).toEqual([member])
  })
})
