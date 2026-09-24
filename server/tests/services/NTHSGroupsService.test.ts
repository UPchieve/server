import * as NTHSGroupsRepo from '../../models/NTHSGroups'
import * as VolunteerRepo from '../../models/Volunteer'
import * as MailService from '../../services/MailService'
import * as NTHSService from '../../services/NTHSGroupsService'
import * as db from '../../db'
import logger from '../../logger'
import { getDbUlid } from '../../models/pgUtils'
import { beforeEach } from '@jest/globals'
import {
  CannotRemoveSoleNTHSAdminError,
  InputError,
  LookupError,
} from '../../models/Errors'
import { VolunteerOccupations } from '../../models/Volunteer'
import {
  buildNTHSGroupMemberWithRole,
  buildNTHSChapterRosterMember,
  buildNTHSChapterTopTutor,
} from '../mocks/generate'

jest.mock('../../db')
jest.mock('../../models/NTHSGroups')
jest.mock('../../models/Volunteer')
jest.mock('../../services/MailService')
jest.mock('../../logger')

const mockedLogger = jest.mocked(logger)
const mockedMailService = jest.mocked(MailService)
const mockedNTHSRepo = jest.mocked(NTHSGroupsRepo)
const mockedVolunteerRepo = jest.mocked(VolunteerRepo)

beforeEach(() => {
  jest.resetAllMocks()

  jest.mocked(db.runInTransaction).mockImplementation((callback) => {
    return callback()
  })
})
describe('makeChaptersSchoolOfficial', () => {
  const baseContact1 = {
    nthsGroupId: 'group-id-1',
    userId: getDbUlid(),
    chapterName: "Bob's Burgers",
  }
  const chapter1AdminContacts = [
    { ...baseContact1, firstName: 'Malzie', email: 'malzie@test.com' },
    { ...baseContact1, firstName: 'Louise', email: 'louise@test.com' },
  ]
  const chapter1AdvisorContacts = [
    { ...baseContact1, firstName: 'Bob Belcher', email: 'bob@burgers.com' },
    {
      ...baseContact1,
      firstName: 'Linda Belcher',
      email: 'linda@burgers.com',
    },
  ]

  const baseContact2 = {
    nthsGroupId: 'group-id-2',
    userId: getDbUlid(),
    chapterName: 'Those Who Can, Dle Candles',
  }
  const chapter2AdminContacts = [
    { ...baseContact2, firstName: 'Mort', email: 'mort@burgers.com' },
  ]
  const chapter2AdvisorContacts = [
    { ...baseContact2, firstName: 'Teddy', email: 'teddy@burgers.com' },
  ]

  it('Sends emails to chapter admins and advisor', async () => {
    // First chapter
    mockedNTHSRepo.getGroupAdminsContactInfo.mockResolvedValueOnce(
      chapter1AdminContacts
    )
    mockedNTHSRepo.getAdvisorContactInfo.mockResolvedValueOnce(
      chapter1AdvisorContacts
    )

    // Second chapter
    mockedNTHSRepo.getGroupAdminsContactInfo.mockResolvedValueOnce(
      chapter2AdminContacts
    )
    mockedNTHSRepo.getAdvisorContactInfo.mockResolvedValueOnce(
      chapter2AdvisorContacts
    )

    await NTHSService.makeChaptersSchoolOfficial([
      baseContact1.nthsGroupId,
      baseContact2.nthsGroupId,
    ])
    expect(
      mockedNTHSRepo.updateSchoolAffiliationStatus
    ).toHaveBeenNthCalledWith(
      1,
      'AFFILIATED',
      baseContact1.nthsGroupId,
      undefined
    )
    expect(
      mockedNTHSRepo.updateSchoolAffiliationStatus
    ).toHaveBeenNthCalledWith(
      2,
      'AFFILIATED',
      baseContact2.nthsGroupId,
      undefined
    )
    expect(
      mockedMailService.sendNTHSChapterSchoolAffiliationApprovedNotification
    ).toHaveBeenNthCalledWith(
      1,
      [...chapter1AdminContacts, ...chapter1AdvisorContacts],
      baseContact1.chapterName
    )
    expect(
      mockedMailService.sendNTHSChapterSchoolAffiliationApprovedNotification
    ).toHaveBeenNthCalledWith(
      2,
      [...chapter2AdminContacts, ...chapter2AdvisorContacts],
      baseContact2.chapterName
    )
  })

  it.each([undefined, []])(
    'Throws an error if the chapter is missing advisors',
    async (advisorsResult) => {
      mockedNTHSRepo.getGroupAdminsContactInfo.mockResolvedValueOnce(
        chapter1AdminContacts
      )
      mockedNTHSRepo.getAdvisorContactInfo.mockResolvedValueOnce(advisorsResult)
      await expect(async () =>
        NTHSService.makeChaptersSchoolOfficial([baseContact1.nthsGroupId])
      ).rejects.toThrow(
        `Could not mark NTHS chapter ${baseContact1.nthsGroupId} as official: Missing chapter advisors`
      )
    }
  )

  it('Emails only the advisors of a chapter with no current admin, and continues the batch', async () => {
    mockedNTHSRepo.getGroupAdminsContactInfo.mockResolvedValueOnce([])
    mockedNTHSRepo.getAdvisorContactInfo.mockResolvedValueOnce(
      chapter1AdvisorContacts
    )
    mockedNTHSRepo.getGroupAdminsContactInfo.mockResolvedValueOnce(
      chapter2AdminContacts
    )
    mockedNTHSRepo.getAdvisorContactInfo.mockResolvedValueOnce(
      chapter2AdvisorContacts
    )

    await NTHSService.makeChaptersSchoolOfficial([
      baseContact1.nthsGroupId,
      baseContact2.nthsGroupId,
    ])

    expect(mockedLogger.warn).toHaveBeenCalledWith(
      { groupId: baseContact1.nthsGroupId },
      expect.any(String)
    )
    expect(mockedNTHSRepo.updateSchoolAffiliationStatus).toHaveBeenCalledTimes(
      2
    )
    expect(
      mockedMailService.sendNTHSChapterSchoolAffiliationApprovedNotification
    ).toHaveBeenNthCalledWith(
      1,
      chapter1AdvisorContacts,
      baseContact1.chapterName
    )
    expect(
      mockedMailService.sendNTHSChapterSchoolAffiliationApprovedNotification
    ).toHaveBeenNthCalledWith(
      2,
      [...chapter2AdminContacts, ...chapter2AdvisorContacts],
      baseContact2.chapterName
    )
    expect(
      mockedMailService.sendNTHSChapterSchoolAffiliationApprovedNotification
    ).toHaveBeenCalledTimes(2)
  })
})

describe('getChapterImpact', () => {
  const groupId = getDbUlid()
  const viewerId = getDbUlid()
  const at = new Date('2026-09-13T12:00:00.000Z')
  const totals = {
    schoolYearToDate: {
      sessionsCompleted: 4,
      studentsHelped: 2,
      hoursTutored: 3,
      membersTutoring: 2,
    },
    allTime: {
      sessionsCompleted: 6,
      studentsHelped: 2,
      hoursTutored: 4.5,
    },
  }

  beforeEach(() => {
    mockedNTHSRepo.getNthsChapterImpact.mockResolvedValue(totals)
    mockedNTHSRepo.getNthsChapterTopTutor.mockResolvedValue(undefined)
    mockedNTHSRepo.getNthsChapterMemberHoursTutored.mockResolvedValue(0)
  })

  it('reports the totals, goals, top tutor and viewer hours for the school year containing `at`', async () => {
    const topTutor = buildNTHSChapterTopTutor()
    mockedNTHSRepo.getNthsChapterTopTutor.mockResolvedValue(topTutor)
    mockedNTHSRepo.getNthsChapterMemberHoursTutored.mockResolvedValue(1.5)

    const impact = await NTHSService.getChapterImpact(groupId, viewerId, at)

    const startsAt = new Date('2026-07-01T00:00:00.000Z')
    const endsAt = new Date('2027-07-01T00:00:00.000Z')
    expect(mockedNTHSRepo.getNthsChapterImpact).toHaveBeenCalledWith(
      groupId,
      startsAt,
      endsAt,
      undefined
    )
    expect(impact).toEqual({
      groupId,
      schoolYear: { label: '2026–27', startsAt, endsAt },
      ...totals,
      goals: NTHSService.CHAPTER_GOALS,
      topTutorThisMonth: topTutor,
      viewerHoursThisMonth: 1.5,
    })
  })

  it.each([
    ['no month start sent', undefined, new Date('2026-09-01T00:00:00.000Z')],
    [
      'the browser month start',
      new Date('2026-09-01T04:00:00.000Z'),
      new Date('2026-09-01T04:00:00.000Z'),
    ],
  ])(
    'measures the month from %s, falling back to the UTC 1st',
    async (_label, monthStartsAt, expectedStart) => {
      await NTHSService.getChapterImpact(groupId, viewerId, at, monthStartsAt)

      expect(mockedNTHSRepo.getNthsChapterTopTutor).toHaveBeenCalledWith(
        groupId,
        expectedStart,
        at,
        undefined
      )
      expect(
        mockedNTHSRepo.getNthsChapterMemberHoursTutored
      ).toHaveBeenCalledWith(groupId, viewerId, expectedStart, at, undefined)
    }
  )
})

describe('isClearedToViewChapterMemberInfo', () => {
  const userId = getDbUlid()
  const readyToCoachStatus = {
    id: userId,
    isOnboarded: true,
    isApproved: true,
    banType: undefined,
  }

  beforeEach(() => {
    mockedVolunteerRepo.getVolunteersReadyToCoachStatus.mockResolvedValue([
      readyToCoachStatus,
    ])
    mockedVolunteerRepo.getVolunteerOccupations.mockResolvedValue([
      VolunteerOccupations.HIGH_SCHOOL_STUDENT,
    ])
  })

  it('clears an onboarded, approved, unbanned high-school volunteer', async () => {
    await expect(
      NTHSService.isClearedToViewChapterMemberInfo(userId)
    ).resolves.toBe(true)
  })

  // VolunteerService.test.ts covers each isReadyToCoach case.
  it.each([
    [
      'not onboarded',
      () => {
        mockedVolunteerRepo.getVolunteersReadyToCoachStatus.mockResolvedValue([
          { ...readyToCoachStatus, isOnboarded: false },
        ])
      },
    ],
    [
      'there is no volunteer profile row at all',
      () => {
        mockedVolunteerRepo.getVolunteersReadyToCoachStatus.mockResolvedValue(
          []
        )
      },
    ],
    [
      'the high-school occupation is missing',
      () => {
        mockedVolunteerRepo.getVolunteerOccupations.mockResolvedValue([
          VolunteerOccupations.WORKING_PART_TIME,
        ])
      },
    ],
  ])('is not cleared when %s', async (_label, setup) => {
    setup()

    await expect(
      NTHSService.isClearedToViewChapterMemberInfo(userId)
    ).resolves.toBe(false)
  })
})

describe('getChapterRoster', () => {
  const groupId = getDbUlid()
  // A Monday.
  const at = new Date('2027-02-01T12:00:00.000Z')

  it('passes the school year containing `at` and returns its members', async () => {
    const member = buildNTHSChapterRosterMember()
    mockedNTHSRepo.getNthsChapterRoster.mockResolvedValue([member])

    const roster = await NTHSService.getChapterRoster(groupId, at)

    expect(mockedNTHSRepo.getNthsChapterRoster).toHaveBeenCalledWith(
      groupId,
      new Date('2026-07-01T00:00:00.000Z'),
      new Date('2027-07-01T00:00:00.000Z'),
      expect.anything(),
      at,
      undefined
    )
    expect(roster.schoolYear.label).toBe('2026–27')
    expect(roster.members).toEqual([member])
  })

  it('keeps closed accounts on the roster only when asked', async () => {
    const closedMember = buildNTHSChapterRosterMember({
      userId: 'closed-user',
      accountClosed: true,
    })
    const openMember = buildNTHSChapterRosterMember({
      userId: 'open-user',
      accountClosed: false,
    })
    mockedNTHSRepo.getNthsChapterRoster.mockResolvedValue([
      closedMember,
      openMember,
    ])

    const withoutClosedAccounts = await NTHSService.getChapterRoster(
      groupId,
      at
    )
    expect(withoutClosedAccounts.members.map((m) => m.userId)).toEqual([
      'open-user',
    ])

    const withClosedAccounts = await NTHSService.getChapterRoster(
      groupId,
      at,
      undefined,
      { includeClosedAccounts: true }
    )
    expect(withClosedAccounts.members.map((m) => m.userId).sort()).toEqual(
      ['closed-user', 'open-user'].sort()
    )
  })

  it.each([
    {
      day: 'a Monday at midnight',
      at: '2027-02-01T00:00:00.000Z',
      weekStartsAt: '2027-02-01T00:00:00.000Z',
      lastTwoWeeksStartsAt: '2027-01-25T00:00:00.000Z',
      monthStartsAt: '2027-02-01T00:00:00.000Z',
    },
    {
      day: 'a Thursday, the last instant of a year',
      at: '2026-12-31T23:59:59.999Z',
      weekStartsAt: '2026-12-28T00:00:00.000Z',
      lastTwoWeeksStartsAt: '2026-12-21T00:00:00.000Z',
      monthStartsAt: '2026-12-01T00:00:00.000Z',
    },
    {
      day: 'a Sunday whose week began last month',
      at: '2027-01-03T23:59:59.999Z',
      weekStartsAt: '2026-12-28T00:00:00.000Z',
      lastTwoWeeksStartsAt: '2026-12-21T00:00:00.000Z',
      monthStartsAt: '2027-01-01T00:00:00.000Z',
    },
  ])(
    'falls back to UTC period starts on $day',
    async ({ at, weekStartsAt, lastTwoWeeksStartsAt, monthStartsAt }) => {
      mockedNTHSRepo.getNthsChapterRoster.mockResolvedValue([])

      await NTHSService.getChapterRoster(groupId, new Date(at))

      expect(mockedNTHSRepo.getNthsChapterRoster).toHaveBeenCalledWith(
        groupId,
        expect.any(Date),
        expect.any(Date),
        {
          weekStartsAt: new Date(weekStartsAt),
          lastTwoWeeksStartsAt: new Date(lastTwoWeeksStartsAt),
          monthStartsAt: new Date(monthStartsAt),
        },
        new Date(at),
        undefined
      )
      expect(mockedNTHSRepo.getNthsChapterTopTutor).toHaveBeenCalledWith(
        groupId,
        new Date(monthStartsAt),
        new Date(at),
        undefined
      )
    }
  )

  it('uses each period start it is given and falls back only for the missing ones', async () => {
    mockedNTHSRepo.getNthsChapterRoster.mockResolvedValue([])
    const weekStartsAt = new Date('2027-02-01T05:00:00.000Z')
    const monthStartsAt = new Date('2027-01-01T05:00:00.000Z')

    await NTHSService.getChapterRoster(groupId, at, {
      weekStartsAt,
      monthStartsAt,
    })

    expect(mockedNTHSRepo.getNthsChapterRoster).toHaveBeenCalledWith(
      groupId,
      expect.any(Date),
      expect.any(Date),
      {
        weekStartsAt,
        lastTwoWeeksStartsAt: new Date('2027-01-25T00:00:00.000Z'),
        monthStartsAt,
      },
      at,
      undefined
    )
    expect(mockedNTHSRepo.getNthsChapterTopTutor).toHaveBeenCalledWith(
      groupId,
      monthStartsAt,
      at,
      undefined
    )
  })
})

describe('updateGroupMember', () => {
  const groupId = getDbUlid()

  it('rejects a userId with no membership row in the group, looking up including departed members', async () => {
    mockedNTHSRepo.getGroupMembers.mockResolvedValueOnce([
      buildNTHSGroupMemberWithRole(),
    ])

    await expect(
      NTHSService.updateGroupMember(getDbUlid(), groupId, { role: 'admin' })
    ).rejects.toThrow(LookupError)
    expect(mockedNTHSRepo.getGroupMembers).toHaveBeenCalledWith(
      groupId,
      undefined,
      { includeDeactivated: true }
    )
    expect(mockedNTHSRepo.upsertNthsGroupMemberRole).not.toHaveBeenCalled()
    expect(mockedNTHSRepo.deactivateGroupMember).not.toHaveBeenCalled()
  })

  it.each([
    ['demoting', { role: 'member' as const }],
    ['deactivating', { isActive: false }],
  ])('refuses %s the sole admin', async (_, update) => {
    const soleAdmin = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
    mockedNTHSRepo.getGroupMembers.mockResolvedValueOnce([
      soleAdmin,
      buildNTHSGroupMemberWithRole(),
    ])

    await expect(
      NTHSService.updateGroupMember(soleAdmin.userId, groupId, update)
    ).rejects.toThrow(CannotRemoveSoleNTHSAdminError)
    expect(mockedNTHSRepo.upsertNthsGroupMemberRole).not.toHaveBeenCalled()
    expect(mockedNTHSRepo.deactivateGroupMember).not.toHaveBeenCalled()
  })

  it.each([
    ['demoting', { role: 'member' as const }],
    ['deactivating', { isActive: false }],
  ])(
    'refuses %s the sole live admin when a deleted account still holds the admin role',
    async (_, update) => {
      const soleLiveAdmin = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
      const deletedAdmin = buildNTHSGroupMemberWithRole({
        roleName: 'admin',
        deleted: true,
      })
      mockedNTHSRepo.getGroupMembers.mockResolvedValueOnce([
        soleLiveAdmin,
        deletedAdmin,
      ])

      await expect(
        NTHSService.updateGroupMember(soleLiveAdmin.userId, groupId, update)
      ).rejects.toThrow(CannotRemoveSoleNTHSAdminError)
      expect(mockedNTHSRepo.upsertNthsGroupMemberRole).not.toHaveBeenCalled()
      expect(mockedNTHSRepo.deactivateGroupMember).not.toHaveBeenCalled()
    }
  )

  it('refuses to make a deleted account an admin', async () => {
    const deletedMember = buildNTHSGroupMemberWithRole({
      roleName: 'member',
      deleted: true,
    })
    mockedNTHSRepo.getGroupMembers.mockResolvedValueOnce([deletedMember])

    await expect(
      NTHSService.updateGroupMember(deletedMember.userId, groupId, {
        role: 'admin',
      })
    ).rejects.toThrow(InputError)
    expect(mockedNTHSRepo.upsertNthsGroupMemberRole).not.toHaveBeenCalled()
    expect(mockedNTHSRepo.deactivateGroupMember).not.toHaveBeenCalled()
  })

  it('lets a sole admin save an update that keeps them an active admin', async () => {
    const soleAdmin = buildNTHSGroupMemberWithRole({ roleName: 'admin' })
    mockedNTHSRepo.getGroupMembers.mockResolvedValueOnce([
      soleAdmin,
      buildNTHSGroupMemberWithRole(),
    ])

    await NTHSService.updateGroupMember(soleAdmin.userId, groupId, {
      role: 'admin',
    })

    expect(mockedNTHSRepo.upsertNthsGroupMemberRole).toHaveBeenCalledWith(
      { userId: soleAdmin.userId, nthsGroupId: groupId, roleName: 'admin' },
      undefined
    )
    expect(mockedNTHSRepo.deactivateGroupMember).not.toHaveBeenCalled()
  })
})
