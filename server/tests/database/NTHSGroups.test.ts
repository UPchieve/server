/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { getDbUlid, Ulid } from '../../models/pgUtils'
import { getName } from '../mocks/generate'
import { createTestUser, createTestVolunteer } from './seed-utils'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'

const client = getClient()

// Anywhere inside the 2026-27 school year, starting 2026-07-01.
const NOW = new Date('2026-11-15T00:00:00.000Z')
const YEAR_STARTS_AT = '2026-07-01T00:00:00.000Z'
const OUTSIDE_VIEWER_ID = getDbUlid()

let subjectId: number
let defaultStudentId: Ulid

async function createChapter(): Promise<Ulid> {
  const groupId = getDbUlid()
  await client.query(
    `INSERT INTO nths_groups (id, name, key, invite_code) VALUES ($1, $2, $3, $4)`,
    [groupId, getName(), `key-${groupId}`, groupId.slice(-6)]
  )
  return groupId
}

type AddMemberOptions = {
  roleName?: 'admin' | 'member'
  title?: string
  joinedAt?: string
  deactivatedAt?: string | null
  onboarded?: boolean
  approved?: boolean
  testUser?: boolean
  deactivated?: boolean
  deleted?: boolean
  banType?: string
  withProfile?: boolean
}

async function addMember(
  groupId: Ulid,
  options: AddMemberOptions = {}
): Promise<Ulid> {
  const user = await createTestUser(client)
  if (options.withProfile ?? true) {
    await createTestVolunteer(client, user.id)
    await client.query(
      `UPDATE volunteer_profiles SET onboarded = $2, approved = $3 WHERE user_id = $1`,
      [user.id, options.onboarded ?? true, options.approved ?? true]
    )
  }
  await client.query(
    `UPDATE users SET test_user = $2, deactivated = $3, ban_type = $4, deleted = $5 WHERE id = $1`,
    [
      user.id,
      options.testUser ?? false,
      options.deactivated ?? false,
      options.banType ?? null,
      options.deleted ?? false,
    ]
  )
  await client.query(
    `INSERT INTO nths_group_members (nths_group_id, user_id, title, joined_at, deactivated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      groupId,
      user.id,
      options.title ?? 'Member',
      options.joinedAt ?? '2026-07-01T00:00:00.000Z',
      options.deactivatedAt ?? null,
    ]
  )
  await client.query(
    `INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)
     SELECT $1, $2, id FROM nths_group_roles WHERE name = $3`,
    [user.id, groupId, options.roleName ?? 'member']
  )
  return user.id
}

type AddSessionOptions = {
  volunteerJoinedAt: string
  timeTutoredMs?: number
  ended?: boolean
  studentId?: Ulid
}

const DEFAULT_SESSION_LENGTH_MS = 2_700_000 // 45 minutes

async function addSession(
  volunteerId: Ulid,
  options: AddSessionOptions
): Promise<void> {
  const ended = options.ended ?? true
  await client.query(
    `INSERT INTO sessions (id, student_id, volunteer_id, subject_id, volunteer_joined_at, ended_at, time_tutored)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
    [
      options.studentId ?? defaultStudentId,
      volunteerId,
      subjectId,
      options.volunteerJoinedAt,
      ended
        ? new Date(
            new Date(options.volunteerJoinedAt).getTime() +
              DEFAULT_SESSION_LENGTH_MS
          ).toISOString()
        : null,
      options.timeTutoredMs ?? DEFAULT_SESSION_LENGTH_MS,
    ]
  )
}

async function getActionNames(groupId: Ulid): Promise<string[]> {
  const { rows } = await client.query(
    `SELECT actions.name AS action_name
     FROM nths_group_actions nga
     JOIN nths_actions actions ON actions.id = nga.nths_action_id
     WHERE nga.nths_group_id = $1
     ORDER BY nga.id`,
    [groupId]
  )
  return rows.map((row) => row.action_name)
}

beforeAll(async () => {
  subjectId = (
    await client.query(`SELECT id FROM subjects ORDER BY id LIMIT 1`)
  ).rows[0].id
  const student = await createTestUser(client)
  defaultStudentId = student.id
})

describe('getChapterImpact', () => {
  test('the school year starts July 1, inclusive', async () => {
    const groupId = await createChapter()
    const memberId = await addMember(groupId, {
      joinedAt: '2026-01-01T00:00:00.000Z',
    })
    const otherStudent = await createTestUser(client)
    await addSession(memberId, {
      volunteerJoinedAt: '2026-06-30T00:00:00.000Z',
      studentId: otherStudent.id,
    })
    await addSession(memberId, { volunteerJoinedAt: YEAR_STARTS_AT })

    const impact = await NTHSGroupsService.getChapterImpact(
      groupId,
      OUTSIDE_VIEWER_ID,
      NOW
    )

    expect(impact.schoolYearToDate).toMatchObject({
      sessionsCompleted: 1,
      hoursTutored: 0.75,
      studentsHelped: 1,
    })
    expect(impact.allTime).toEqual({
      sessionsCompleted: 2,
      hoursTutored: 1.5,
      studentsHelped: 2,
    })
  })

  test('counts distinct students helped rather than sessions', async () => {
    const groupId = await createChapter()
    const memberId = await addMember(groupId)
    const otherStudent = await createTestUser(client)
    await addSession(memberId, {
      volunteerJoinedAt: '2026-10-01T00:00:00.000Z',
    })
    await addSession(memberId, {
      volunteerJoinedAt: '2026-10-02T00:00:00.000Z',
    })
    await addSession(memberId, {
      volunteerJoinedAt: '2026-10-03T00:00:00.000Z',
      studentId: otherStudent.id,
    })

    const impact = await NTHSGroupsService.getChapterImpact(
      groupId,
      OUTSIDE_VIEWER_ID,
      NOW
    )

    expect(impact.schoolYearToDate.sessionsCompleted).toBe(3)
    expect(impact.schoolYearToDate.studentsHelped).toBe(2)
  })

  test.each([
    [61_000, 0.02],
    [3_600_000, 1],
    // Exact half-hundredths round up.
    [90_000, 0.03],
  ])('reports %i ms as %f hours', async (timeTutoredMs, hours) => {
    const groupId = await createChapter()
    const memberId = await addMember(groupId)
    await addSession(memberId, {
      volunteerJoinedAt: '2026-10-01T00:00:00.000Z',
      timeTutoredMs,
    })

    const impact = await NTHSGroupsService.getChapterImpact(
      groupId,
      OUTSIDE_VIEWER_ID,
      NOW
    )

    expect(impact.schoolYearToDate.hoursTutored).toBe(hours)
    expect(impact.allTime.hoursTutored).toBe(hours)
  })

  test.each([
    ['a test_user member', { testUser: true }, 0, 0],
    ['a banned member', { banType: 'complete' }, 1, 1],
    ['a deleted member', { deleted: true }, 1, 0],
    // users.deactivated is the Profile "stop notifications" toggle, not
    // account closure: a deactivated member still tutors and still counts.
    ['a deactivated member', { deactivated: true }, 1, 1],
    // Departed: the session still counts toward the chapter total, but a
    // member who has left never counts as currently tutoring.
    ['a departed member', { deactivatedAt: '2026-10-15T00:00:00.000Z' }, 1, 0],
  ] as const)(
    '%s counts sessionsCompleted and membersTutoring correctly',
    async (_label, options, sessionsCompleted, membersTutoring) => {
      const groupId = await createChapter()
      const memberId = await addMember(groupId, options)
      await addSession(memberId, {
        volunteerJoinedAt: '2026-10-01T00:00:00.000Z',
      })

      const impact = await NTHSGroupsService.getChapterImpact(
        groupId,
        OUTSIDE_VIEWER_ID,
        NOW
      )

      expect(impact.schoolYearToDate.sessionsCompleted).toBe(sessionsCompleted)
      expect(impact.schoolYearToDate.membersTutoring).toBe(membersTutoring)
    }
  )

  test('counts each tutoring member once, and only for this school year', async () => {
    const groupId = await createChapter()
    const busyId = await addMember(groupId, {
      joinedAt: '2026-01-01T00:00:00.000Z',
    })
    const lastYearOnlyId = await addMember(groupId, {
      joinedAt: '2026-01-01T00:00:00.000Z',
    })
    await addMember(groupId)
    await addSession(busyId, { volunteerJoinedAt: '2026-10-01T00:00:00.000Z' })
    await addSession(busyId, { volunteerJoinedAt: '2026-10-02T00:00:00.000Z' })
    await addSession(lastYearOnlyId, {
      volunteerJoinedAt: '2026-06-01T00:00:00.000Z',
    })

    const impact = await NTHSGroupsService.getChapterImpact(
      groupId,
      OUTSIDE_VIEWER_ID,
      NOW
    )

    expect(impact.schoolYearToDate.membersTutoring).toBe(1)
  })
})

describe('updateGroupMember', () => {
  test('removing a member who already left keeps their original departure time', async () => {
    const groupId = await createChapter()
    await addMember(groupId, { roleName: 'admin' })
    const departedAt = '2026-10-01T00:00:00.000Z'
    const departedId = await addMember(groupId, {
      joinedAt: '2026-08-01T00:00:00.000Z',
      deactivatedAt: departedAt,
    })

    await NTHSGroupsService.updateGroupMember(departedId, groupId, {
      isActive: false,
    })

    const { rows } = await client.query(
      'SELECT deactivated_at FROM nths_group_members WHERE nths_group_id = $1 AND user_id = $2',
      [groupId, departedId]
    )
    expect(rows[0].deactivated_at.toISOString()).toBe(departedAt)
  })
})

describe('getChapterRoster', () => {
  test('lists current members, excluding test users, and keeps a banned member', async () => {
    const groupId = await createChapter()
    const currentId = await addMember(groupId, { roleName: 'admin' })
    const bannedId = await addMember(groupId, { banType: 'complete' })
    await addMember(groupId, { testUser: true })
    await addMember(groupId, { deactivatedAt: '2026-10-01T00:00:00.000Z' })
    const accountDeactivatedId = await addMember(groupId, {
      deactivated: true,
    })

    const roster = await NTHSGroupsService.getChapterRoster(
      groupId,
      NOW,
      undefined,
      { includeClosedAccounts: true }
    )

    expect(roster.members.map((m) => m.userId).sort()).toEqual(
      [currentId, bannedId, accountDeactivatedId].sort()
    )
    expect(roster.members.find((m) => m.userId === currentId)?.roleName).toBe(
      'admin'
    )
    expect(
      roster.members.find((m) => m.userId === accountDeactivatedId)
        ?.accountClosed
    ).toBe(false)
  })

  // A deleted account still needs a Remove action, so the roster keeps the row flagged accountClosed.
  test('keeps a deleted member flagged accountClosed', async () => {
    const groupId = await createChapter()
    const deletedId = await addMember(groupId, { deleted: true })
    const memberId = await addMember(groupId)

    const roster = await NTHSGroupsService.getChapterRoster(
      groupId,
      NOW,
      undefined,
      { includeClosedAccounts: true }
    )

    expect(roster.members.map((m) => m.userId).sort()).toEqual(
      [deletedId, memberId].sort()
    )
    expect(
      roster.members.find((m) => m.userId === deletedId)?.accountClosed
    ).toBe(true)
    expect(
      roster.members.find((m) => m.userId === memberId)?.accountClosed
    ).toBe(false)
  })

  test('reports training and safety, defaulting to false without a profile', async () => {
    const groupId = await createChapter()
    const untrainedId = await addMember(groupId, {
      onboarded: false,
      approved: false,
    })
    const profilelessId = await addMember(groupId, { withProfile: false })

    const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)
    const byId = Object.fromEntries(roster.members.map((m) => [m.userId, m]))

    expect(byId[untrainedId].trainingComplete).toBe(false)
    expect(byId[untrainedId].safetyApproved).toBe(false)
    expect(byId[profilelessId]).toBeDefined()
    expect(byId[profilelessId].trainingComplete).toBe(false)
    expect(byId[profilelessId].safetyApproved).toBe(false)
  })

  test('counts this year and all time per member, reports last active with no year bound, and leaves it unset for a member who never tutored', async () => {
    const groupId = await createChapter()
    const memberId = await addMember(groupId, {
      joinedAt: '2026-01-01T00:00:00.000Z',
    })
    await addSession(memberId, {
      volunteerJoinedAt: '2026-06-20T00:00:00.000Z',
    })
    await addSession(memberId, {
      volunteerJoinedAt: '2026-09-01T00:00:00.000Z',
    })
    await addSession(memberId, {
      volunteerJoinedAt: '2026-10-05T00:00:00.000Z',
    })
    await addSession(memberId, {
      volunteerJoinedAt: '2026-10-06T00:00:00.000Z',
      timeTutoredMs: 30_000,
    })
    const neverTutoredId = await addMember(groupId)

    const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)
    const byId = Object.fromEntries(roster.members.map((m) => [m.userId, m]))

    expect(byId[memberId].sessionsThisYear).toBe(2)
    expect(byId[memberId].hoursThisYear).toBe(1.5)
    expect(byId[memberId].periodSessions.thisSchoolYear).toBe(2)
    expect(byId[memberId].periodHours.thisSchoolYear).toBe(1.5)
    expect(byId[memberId].periodHours.allTime).toBe(2.25)
    expect(byId[memberId].periodSessions.allTime).toBe(3)
    expect(byId[memberId].lastActiveAt?.toISOString()).toBe(
      '2026-10-05T00:00:00.000Z'
    )
    expect(byId[neverTutoredId].sessionsThisYear).toBe(0)
    expect(byId[neverTutoredId].hoursThisYear).toBe(0)
    expect(byId[neverTutoredId].periodHours.allTime).toBe(0)
    expect(byId[neverTutoredId].periodSessions.allTime).toBe(0)
    expect(byId[neverTutoredId].lastActiveAt).toBeUndefined()
  })
})

// NOW is Sunday 2026-11-15T00:00Z. Starts as a browser in New York sends them:
// EST from Nov 1, so Monday Nov 9 00:00 local is 05:00Z, and Nov 1 00:00 local is
// still EDT, 04:00Z.
const NEW_YORK_STARTS = {
  weekStartsAt: new Date('2026-11-09T05:00:00.000Z'),
  lastTwoWeeksStartsAt: new Date('2026-11-02T05:00:00.000Z'),
  monthStartsAt: new Date('2026-11-01T04:00:00.000Z'),
}

describe('getChapterRoster periodHours', () => {
  test('counts each period from its start, inclusive', async () => {
    const groupId = await createChapter()
    const memberId = await addMember(groupId)
    for (const volunteerJoinedAt of [
      '2026-11-01T03:59:59.999Z',
      '2026-11-01T04:00:00.000Z',
      '2026-11-02T05:00:00.000Z',
      '2026-11-09T04:59:59.999Z',
      '2026-11-09T05:00:00.000Z',
      '2026-11-14T23:59:59.999Z',
    ]) {
      await addSession(memberId, { volunteerJoinedAt })
    }

    const roster = await NTHSGroupsService.getChapterRoster(
      groupId,
      NOW,
      NEW_YORK_STARTS
    )

    expect(roster.members[0].periodHours).toEqual({
      thisWeek: 1.5,
      lastTwoWeeks: 3,
      thisMonth: 3.75,
      thisSchoolYear: 4.5,
      allTime: 4.5,
    })
    expect(roster.members[0].periodSessions).toEqual({
      thisWeek: 2,
      lastTwoWeeks: 4,
      thisMonth: 5,
      thisSchoolYear: 6,
      allTime: 6,
    })
    expect(roster.members[0].hoursThisYear).toBe(4.5)
  })
})

describe('getChapterRoster topTutorThisMonth', () => {
  // With no month start sent, "this month" is [2026-11-01T00:00Z, NOW).
  test('counts a session by the month it started in', async () => {
    const groupId = await createChapter()
    const lateStarterId = await addMember(groupId, {
      joinedAt: '2026-01-01T00:00:00.000Z',
    })
    const topId = await addMember(groupId, {
      joinedAt: '2026-01-01T00:00:00.000Z',
    })
    // Starts in October and ends in November.
    await addSession(lateStarterId, {
      volunteerJoinedAt: '2026-10-31T23:50:00.000Z',
      timeTutoredMs: 5_400_000,
    })
    await addSession(topId, { volunteerJoinedAt: '2026-11-01T00:00:00.000Z' })

    const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)

    expect(roster.topTutorThisMonth).toEqual({
      userId: topId,
      firstName: expect.any(String),
      lastInitial: expect.any(String),
      hoursTutored: 0.75,
      sessionsCompleted: 1,
    })
  })

  test.each([
    [
      'a member who has left the chapter',
      { deactivatedAt: '2026-11-10T00:00:00.000Z' },
      false,
    ],
    ['a test user', { testUser: true }, false],
    ['a deleted account', { deleted: true }, false],
    ['a deactivated account', { deactivated: true }, true],
  ] as const)(
    'top tutor eligibility for %s',
    async (_label, options, eligible) => {
      const groupId = await createChapter()
      const subjectMemberId = await addMember(groupId, options)
      const otherId = await addMember(groupId)
      await addSession(subjectMemberId, {
        volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
        timeTutoredMs: 5_400_000,
      })
      await addSession(otherId, {
        volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
      })

      const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)

      expect(roster.topTutorThisMonth?.userId).toBe(
        eligible ? subjectMemberId : otherId
      )
    }
  )

  test('skips the chapter president even with the most hours, and keeps another admin', async () => {
    const groupId = await createChapter()
    const presidentId = await addMember(groupId, {
      roleName: 'admin',
      title: 'President',
    })
    const adminId = await addMember(groupId, { roleName: 'admin' })
    await addSession(presidentId, {
      volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
      timeTutoredMs: 5_400_000,
    })
    await addSession(adminId, {
      volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
    })

    const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)

    expect(roster.topTutorThisMonth?.userId).toBe(adminId)
  })

  test('counts a member titled President who no longer holds the admin role', async () => {
    const groupId = await createChapter()
    await addMember(groupId, { roleName: 'admin' })
    const demotedId = await addMember(groupId, {
      roleName: 'member',
      title: 'President',
    })
    await addSession(demotedId, {
      volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
    })

    const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)

    expect(roster.topTutorThisMonth?.userId).toBe(demotedId)
  })

  test('breaks a tie on hours by more sessions, then by the lower user id', async () => {
    const groupId = await createChapter()
    const oneLongId = await addMember(groupId)
    const twoShortId = await addMember(groupId)
    await addSession(oneLongId, {
      volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
      timeTutoredMs: 5_400_000,
    })
    await addSession(twoShortId, {
      volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
    })
    await addSession(twoShortId, {
      volunteerJoinedAt: '2026-11-06T00:00:00.000Z',
    })

    const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)

    expect(roster.topTutorThisMonth?.userId).toBe(twoShortId)

    const tiedGroupId = await createChapter()
    const firstId = await addMember(tiedGroupId)
    const secondId = await addMember(tiedGroupId)
    for (const memberId of [firstId, secondId]) {
      await addSession(memberId, {
        volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
      })
    }

    const tiedRoster = await NTHSGroupsService.getChapterRoster(
      tiedGroupId,
      NOW
    )

    expect(tiedRoster.topTutorThisMonth?.userId).toBe(
      [firstId, secondId].sort()[0]
    )
  })
})

// nths_groups.sql repeats the counted-session predicate in each query, so each reader gets the same fixture.
describe('the counted-session rule, across every reader', () => {
  type CountedSessionReader = (
    groupId: Ulid,
    memberId: Ulid
  ) => Promise<{ sessions?: number; hours: number }>

  async function buildActiveMemberFixture(): Promise<{
    groupId: Ulid
    memberId: Ulid
  }> {
    const groupId = await createChapter()
    const memberId = await addMember(groupId, {
      joinedAt: '2026-11-05T00:00:00.000Z',
    })
    // Valid: ended, over the minimum, after joining.
    await addSession(memberId, {
      volunteerJoinedAt: '2026-11-08T00:00:00.000Z',
    })
    // Exactly at joining, which counts (`>=`, not `>`).
    await addSession(memberId, {
      volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
    })
    // Never ended.
    await addSession(memberId, {
      volunteerJoinedAt: '2026-11-09T00:00:00.000Z',
      ended: false,
    })
    // At the minSessionLength floor, not over it.
    await addSession(memberId, {
      volunteerJoinedAt: '2026-11-09T00:00:00.000Z',
      timeTutoredMs: 60_000,
    })
    // Before joining.
    await addSession(memberId, {
      volunteerJoinedAt: '2026-11-04T23:59:59.999Z',
    })
    const testStudent = await createTestUser(client)
    await client.query(`UPDATE users SET test_user = TRUE WHERE id = $1`, [
      testStudent.id,
    ])
    await addSession(memberId, {
      volunteerJoinedAt: '2026-11-08T00:00:00.000Z',
      studentId: testStudent.id,
    })
    return { groupId, memberId }
  }

  const readers: [string, CountedSessionReader][] = [
    [
      'chapter schoolYearToDate',
      async (groupId) => {
        const impact = await NTHSGroupsService.getChapterImpact(
          groupId,
          OUTSIDE_VIEWER_ID,
          NOW
        )
        return {
          sessions: impact.schoolYearToDate.sessionsCompleted,
          hours: impact.schoolYearToDate.hoursTutored,
        }
      },
    ],
    [
      'roster hoursThisYear',
      async (groupId, memberId) => {
        const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)
        const member = roster.members.find((m) => m.userId === memberId)
        return {
          sessions: member?.sessionsThisYear,
          hours: member?.hoursThisYear ?? -1,
        }
      },
    ],
    [
      'roster allTime periodHours and periodSessions',
      async (groupId, memberId) => {
        const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)
        const member = roster.members.find((m) => m.userId === memberId)
        return {
          sessions: member?.periodSessions.allTime,
          hours: member?.periodHours.allTime ?? -1,
        }
      },
    ],
    [
      'roster topTutorThisMonth',
      async (groupId) => {
        const roster = await NTHSGroupsService.getChapterRoster(groupId, NOW)
        return {
          sessions: roster.topTutorThisMonth?.sessionsCompleted,
          hours: roster.topTutorThisMonth?.hoursTutored ?? -1,
        }
      },
    ],
    [
      'viewerHoursThisMonth',
      async (groupId, memberId) => {
        const impact = await NTHSGroupsService.getChapterImpact(
          groupId,
          memberId,
          NOW
        )
        return { hours: impact.viewerHoursThisMonth }
      },
    ],
  ]

  test.each(readers)(
    '%s counts only the ended, long-enough sessions on or after joining with a real student',
    async (_label, read) => {
      const { groupId, memberId } = await buildActiveMemberFixture()

      const result = await read(groupId, memberId)

      if (result.sessions !== undefined) expect(result.sessions).toBe(2)
      expect(result.hours).toBe(1.5)
    }
  )

  type DepartedHoursReader = (
    groupId: Ulid,
    departedId: Ulid
  ) => Promise<number>

  const departedReaders: [string, DepartedHoursReader][] = [
    [
      'chapter schoolYearToDate',
      async (groupId) => {
        const impact = await NTHSGroupsService.getChapterImpact(
          groupId,
          OUTSIDE_VIEWER_ID,
          NOW
        )
        return impact.schoolYearToDate.hoursTutored
      },
    ],
    [
      'viewerHoursThisMonth',
      async (groupId, departedId) => {
        const impact = await NTHSGroupsService.getChapterImpact(
          groupId,
          departedId,
          NOW
        )
        return impact.viewerHoursThisMonth
      },
    ],
  ]

  test.each(departedReaders)(
    '%s stops counting at the moment the member left',
    async (_label, readHours) => {
      const groupId = await createChapter()
      const departedId = await addMember(groupId, {
        deactivatedAt: '2026-11-10T00:00:00.000Z',
      })
      await addSession(departedId, {
        volunteerJoinedAt: '2026-11-09T23:59:59.999Z',
      })
      await addSession(departedId, {
        volunteerJoinedAt: '2026-11-10T00:00:00.000Z',
        timeTutoredMs: 5_400_000,
      })

      expect(await readHours(groupId, departedId)).toBe(0.75)
    }
  )
})

describe('getChapterImpact this month', () => {
  test("counts only the viewer's own sessions from the month start, inclusive", async () => {
    const groupId = await createChapter()
    const viewerId = await addMember(groupId, {
      joinedAt: '2026-01-01T00:00:00.000Z',
    })
    const otherId = await addMember(groupId)
    // Last month, excluded.
    await addSession(viewerId, {
      volunteerJoinedAt: '2026-10-31T23:59:59.999Z',
    })
    // Exactly at the month start, counted.
    await addSession(viewerId, {
      volunteerJoinedAt: '2026-11-01T00:00:00.000Z',
      timeTutoredMs: 5_400_000,
    })
    // Another member's session never counts toward the viewer's hours.
    await addSession(otherId, {
      volunteerJoinedAt: '2026-11-05T00:00:00.000Z',
    })

    const impact = await NTHSGroupsService.getChapterImpact(
      groupId,
      viewerId,
      NOW
    )

    expect(impact.viewerHoursThisMonth).toBe(1.5)
  })

  test('ignores a member’s hours from a chapter they never joined', async () => {
    const groupId = await createChapter()
    const otherGroupId = await createChapter()
    const viewerId = await addMember(otherGroupId)
    await addSession(viewerId, {
      volunteerJoinedAt: '2026-11-02T00:00:00.000Z',
    })

    const impact = await NTHSGroupsService.getChapterImpact(
      groupId,
      viewerId,
      NOW
    )

    expect(impact.viewerHoursThisMonth).toBe(0)
  })
})

// Every chapter route guard relies on this to reject a departed member, whose
// nths_group_member_roles row stays behind when they leave.
describe('getActiveGroupMember', () => {
  test('finds a current member and their role, but not one who has left', async () => {
    const groupId = await createChapter()
    const adminId = await addMember(groupId, { roleName: 'admin' })
    const departedId = await addMember(groupId, {
      roleName: 'admin',
      deactivatedAt: '2026-10-01T00:00:00.000Z',
    })

    const member = await NTHSGroupsService.getActiveGroupMember(
      adminId,
      groupId
    )

    expect(member?.roleName).toBe('admin')
    expect(
      await NTHSGroupsService.getActiveGroupMember(departedId, groupId)
    ).toBeUndefined()
  })
})

// Feeds the OFFICIAL-status and school-affiliation-approved admin emails, so a
// departed admin's role row (which stays behind, like getActiveGroupMember's)
// must not put them back on the recipient list.
describe('getNTHSGroupAdminsContactInfo', () => {
  test('includes every current admin, excluding one who has left', async () => {
    const groupId = await createChapter()
    const firstAdminId = await addMember(groupId, { roleName: 'admin' })
    const secondAdminId = await addMember(groupId, { roleName: 'admin' })
    await addMember(groupId, {
      roleName: 'admin',
      deactivatedAt: '2026-10-01T00:00:00.000Z',
    })
    await addMember(groupId)

    const admins =
      await NTHSGroupsService.getNTHSGroupAdminsContactInfo(groupId)

    expect(admins.map((admin) => admin.userId).sort()).toEqual(
      [firstAdminId, secondAdminId].sort()
    )
  })

  test('leaves out a deleted admin', async () => {
    const groupId = await createChapter()
    const adminId = await addMember(groupId, { roleName: 'admin' })
    await addMember(groupId, { roleName: 'admin', deleted: true })

    const admins =
      await NTHSGroupsService.getNTHSGroupAdminsContactInfo(groupId)

    expect(admins.map((admin) => admin.userId)).toEqual([adminId])
  })
})

describe('getGroupMembers', () => {
  test('leaves out closed accounts only when asked to', async () => {
    const groupId = await createChapter()
    const memberId = await addMember(groupId)
    const deletedId = await addMember(groupId, { deleted: true })

    const memberIds = async (excludeClosedAccounts?: boolean) =>
      (
        await NTHSGroupsService.getGroupMembers(groupId, undefined, {
          excludeClosedAccounts,
        })
      )
        .map((member) => member.userId)
        .sort()

    expect(await memberIds()).toEqual([memberId, deletedId].sort())
    expect(await memberIds(true)).toEqual([memberId])
  })
})

describe('deleteAction', () => {
  test('deletes every row for that action in that chapter, leaving other actions and other chapters untouched', async () => {
    const groupId = await createChapter()
    const otherGroupId = await createChapter()
    await NTHSGroupsService.createAction(groupId, 'NAMED YOUR TEAM')
    // A duplicate: unique_action_per_group was dropped in
    // 20260213143219_drop_unique_action_per_group_add_school_references.
    await NTHSGroupsService.createAction(groupId, 'NAMED YOUR TEAM')
    await NTHSGroupsService.createAction(groupId, 'REVIEWED RESOURCES')
    await NTHSGroupsService.createAction(otherGroupId, 'NAMED YOUR TEAM')

    await NTHSGroupsService.deleteAction(groupId, 'NAMED YOUR TEAM')

    expect(await getActionNames(groupId)).toEqual(['REVIEWED RESOURCES'])
    expect(await getActionNames(otherGroupId)).toEqual(['NAMED YOUR TEAM'])
  })
})
