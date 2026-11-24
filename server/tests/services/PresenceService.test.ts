import { redisClient } from '../../services/RedisService'
import * as PresenceService from '../../services/PresenceService'
import { registerOfflineHandler } from '../../services/PresenceService/offline-handlers'
import * as UserActionService from '../../services/UserActionService'
import { getDbUlid, getUuid } from '../../models/pgUtils'
import { ACCOUNT_USER_ACTIONS, USER_BAN_TYPES } from '../../constants'
import logger from '../../logger'
import QueueService from '../../services/QueueService'
import * as VolunteerRepo from '../../models/Volunteer'
import * as SessionRepo from '../../models/Session'
import * as StudentRepo from '../../models/Student'
import * as UserRepo from '../../models/User'
import {
  buildWaitingCurrentSession,
  buildVolunteerSessionHoldEligibilityData,
} from '../mocks/generate'
import { VolunteerSessionHoldEligibilityData } from '../../models/Volunteer/types'
import { SUBJECTS } from '../../constants/subjects'

jest.mock('../../services/UserActionService')
jest.mock('../../services/QueueService')
jest.mock('../../models/Volunteer')
jest.mock('../../models/Session')
jest.mock('../../models/Student')
jest.mock('../../models/User')
jest.mock('../../logger')

const mockedUserActionService = jest.mocked(UserActionService)
const mockedLogger = jest.mocked(logger)

beforeEach(async () => {
  jest.clearAllMocks()
  await redisClient.flushall()
})

describe('online presence sets', () => {
  test('markOnline tracks users by role and getOnlineUserIds returns the online users', async () => {
    const studentId = getDbUlid()
    const volunteerId = getDbUlid()

    await PresenceService.markOnline(studentId, 'student', getUuid())
    await PresenceService.markOnline(volunteerId, 'volunteer', getUuid())

    const onlineUserIds = await PresenceService.getOnlineUserIds()
    expect(onlineUserIds.students).toEqual([studentId])
    expect(onlineUserIds.volunteers).toEqual([volunteerId])
  })

  test('markOffline removes the user from both role sets', async () => {
    const userId = getDbUlid()
    await PresenceService.markOnline(userId, 'student', getUuid())

    await PresenceService.markOffline(userId)

    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [],
      volunteers: [],
    })
  })

  test('markOnline moves a user when their tracked role changes', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    await PresenceService.markOnline(userId, 'student', clientUUID)
    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [userId],
      volunteers: [],
    })

    await PresenceService.markOnline(userId, 'volunteer', clientUUID)

    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [],
      volunteers: [userId],
    })
  })

  describe('role exit handlers', () => {
    const onVolunteerOffline = jest.fn().mockResolvedValue(undefined)
    const onStudentOffline = jest.fn().mockResolvedValue(undefined)
    beforeAll(() => {
      registerOfflineHandler(
        ['volunteer'],
        'test: volunteer role exit spy',
        onVolunteerOffline
      )
      registerOfflineHandler(
        ['student'],
        'test: student role exit spy',
        onStudentOffline
      )
    })

    test('markOnline does not run exit handlers for a role the user was never in', async () => {
      await PresenceService.markOnline(getDbUlid(), 'student', getUuid())
      await PresenceService.markOnline(getDbUlid(), 'teacher', getUuid())
      expect(onVolunteerOffline).not.toHaveBeenCalled()
    })

    test('markOnline runs exit handlers when the user switches out of a role', async () => {
      const coachId = getDbUlid()
      await PresenceService.markOnline(coachId, 'volunteer', getUuid())
      await PresenceService.markOnline(coachId, 'student', getUuid())

      expect(onVolunteerOffline).toHaveBeenCalledTimes(1)
      expect(onVolunteerOffline).toHaveBeenCalledWith(coachId)
      expect(onStudentOffline).not.toHaveBeenCalled()
    })

    test('markOffline runs exit handlers and drops the client index in the same call', async () => {
      const coachId = getDbUlid()
      await PresenceService.markOnline(coachId, 'volunteer', getUuid())

      await PresenceService.markOffline(coachId)

      expect(onVolunteerOffline).toHaveBeenCalledTimes(1)
      expect(onVolunteerOffline).toHaveBeenCalledWith(coachId)
      // the del makes it into markRolesOffline's transaction now
      expect(await redisClient.keys(`*${coachId}*`)).toEqual([])
    })
  })

  test('markOfflineIfNoPresence removes users whose last client is gone', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    await PresenceService.markOnline(userId, 'student', clientUUID)
    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [userId],
      volunteers: [],
    })

    await PresenceService.markOfflineIfNoPresence(userId, clientUUID)

    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [],
      volunteers: [],
    })
  })

  test('markOfflineIfNoPresence keeps users with another live client online', async () => {
    const userId = getDbUlid()
    const clientUUIDA = getUuid()
    const clientUUIDB = getUuid()
    await PresenceService.markOnline(userId, 'student', clientUUIDA)
    await PresenceService.markOnline(userId, 'student', clientUUIDB)
    expect((await PresenceService.getOnlineUserIds()).students).toEqual([
      userId,
    ])

    await PresenceService.markOfflineIfNoPresence(userId, clientUUIDA)

    expect((await PresenceService.getOnlineUserIds()).students).toEqual([
      userId,
    ])
  })

  test('an active client does not keep an expired client in the index', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const userId = getDbUlid()
    const staleClientUUID = getUuid()
    const activeClientUUID = getUuid()
    await PresenceService.markOnline(userId, 'student', staleClientUUID)

    // advance past the expiration deadline so the first client is expired
    jest.advanceTimersByTime(
      (PresenceService.CLIENT_INDEX_TTL_IN_SECONDS + 1) * 1000
    )
    await PresenceService.markOnline(userId, 'student', activeClientUUID)
    await PresenceService.markOfflineIfNoPresence(userId, activeClientUUID)

    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [],
      volunteers: [],
    })
    jest.useRealTimers()
  })

  test('markOfflineIfNoPresence ignores untracked clients', async () => {
    const userId = getDbUlid()
    await PresenceService.markOnline(userId, 'student', getUuid())

    await PresenceService.markOfflineIfNoPresence(userId, getUuid())

    expect((await PresenceService.getOnlineUserIds()).students).toEqual([
      userId,
    ])
  })

  test('a user with multiple tabs open is only counted once', async () => {
    const userId = getDbUlid()
    await PresenceService.markOnline(userId, 'student', getUuid())
    await PresenceService.markOnline(userId, 'student', getUuid())

    const onlineUserIds = await PresenceService.getOnlineUserIds()
    expect(onlineUserIds.students).toEqual([userId])
    expect(onlineUserIds.volunteers).toEqual([])
  })
})

describe('online status', () => {
  const firstOnlineAt = new Date('2026-01-01T00:00:00Z')
  const laterAt = new Date('2026-01-01T00:10:00Z')

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(firstOnlineAt)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('markOffline resets online status for the next time the user comes online', async () => {
    const userId = getDbUlid()
    await PresenceService.markOnline(userId, 'volunteer', getUuid())
    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([userId])
    await PresenceService.markOffline(userId)
    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([])

    jest.setSystemTime(laterAt)
    await PresenceService.markOnline(userId, 'volunteer', getUuid())

    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([userId])
  })

  test('markOfflineIfNoPresence resets online status once the last client is gone', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    await PresenceService.markOnline(userId, 'volunteer', clientUUID)
    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([userId])
    await PresenceService.markOfflineIfNoPresence(userId, clientUUID)
    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([])

    jest.setSystemTime(laterAt)
    await PresenceService.markOnline(userId, 'volunteer', getUuid())

    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([userId])
  })

  test('a role change starts online status over in the new role', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    await PresenceService.markOnline(userId, 'student', clientUUID)

    jest.setSystemTime(laterAt)
    await PresenceService.markOnline(userId, 'volunteer', clientUUID)

    expect(await PresenceService.getOnlineUsers('student')).toEqual([])
    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([userId])
  })

  test('an expired user does not keep their online status when they come back', async () => {
    const userId = getDbUlid()
    await PresenceService.markOnline(userId, 'volunteer', getUuid())

    // expire the user without an offline event, e.g. all servers went down
    jest.advanceTimersByTime(
      (PresenceService.CLIENT_INDEX_TTL_IN_SECONDS + 1) * 1000
    )
    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([])

    await PresenceService.markOnline(userId, 'volunteer', getUuid())

    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([userId])
  })
})

describe('isUserOnline', () => {
  test('is true only for the role the user is online in', async () => {
    const userId = getDbUlid()
    await PresenceService.markOnline(userId, 'volunteer', getUuid())

    expect(await PresenceService.isUserOnline(userId, 'volunteer')).toBe(true)
    expect(await PresenceService.isUserOnline(userId, 'student')).toBe(false)
  })

  test('is false for a user who was never online or has gone offline', async () => {
    const userId = getDbUlid()
    expect(await PresenceService.isUserOnline(userId, 'volunteer')).toBe(false)

    await PresenceService.markOnline(userId, 'volunteer', getUuid())
    await PresenceService.markOffline(userId)

    expect(await PresenceService.isUserOnline(userId, 'volunteer')).toBe(false)
  })

  test('is false once the online deadline has passed', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const userId = getDbUlid()
    await PresenceService.markOnline(userId, 'volunteer', getUuid())

    jest.advanceTimersByTime(
      (PresenceService.CLIENT_INDEX_TTL_IN_SECONDS + 1) * 1000
    )

    expect(await PresenceService.isUserOnline(userId, 'volunteer')).toBe(false)
    jest.useRealTimers()
  })
})

describe('countOnlineUsers', () => {
  it('Counts correctly by role', async () => {
    const studentIds = [getUuid(), getUuid()]
    const volunteerIds = [getUuid(), getUuid()]
    for (const id of studentIds) {
      await PresenceService.markOnline(id, 'student', getUuid())
    }
    for (const id of volunteerIds) {
      await PresenceService.markOnline(id, 'volunteer', getUuid())
    }
    const actualStudents = await PresenceService.countOnlineUsers('student')
    const actualVolunteers = await PresenceService.countOnlineUsers('volunteer')
    expect(actualStudents).toEqual(2)
    expect(actualVolunteers).toEqual(2)
  })

  it('Counts 0 when there are none online', async () => {
    expect(await PresenceService.countOnlineUsers('student')).toEqual(0)
  })
})

describe('trackActivity', () => {
  test('marks the user as online in their role set', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    const ipAddress = '192.168.0.1'

    await PresenceService.trackActivity({
      userId,
      clientUUID,
      ipAddress,
      role: 'volunteer',
    })

    expect((await PresenceService.getOnlineUserIds()).volunteers).toEqual([
      userId,
    ])
    expect(mockedUserActionService.createAccountAction).toHaveBeenCalledTimes(1)
    expect(mockedUserActionService.createAccountAction).toHaveBeenCalledWith({
      action: ACCOUNT_USER_ACTIONS.ACTIVE_ON_SITE,
      userId,
      clientUUID,
      ipAddress,
    })
  })

  test('repeated heartbeats do not duplicate set membership or actions', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()

    await PresenceService.trackActivity({
      userId,
      clientUUID,
      role: 'student',
    })
    await PresenceService.trackActivity({
      userId,
      clientUUID,
      role: 'student',
    })

    const onlineUserIds = await PresenceService.getOnlineUserIds()
    expect(onlineUserIds.students).toEqual([userId])
    expect(onlineUserIds.volunteers).toEqual([])
    // ACTIVE_ON_SITE is only logged once per presence period
    expect(mockedUserActionService.createAccountAction).toHaveBeenCalledTimes(1)
  })
})

describe('markOfflineIfPassive', () => {
  test('takes a passive user offline and logs INACTIVE_ON_SITE', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    await PresenceService.trackActivity({
      userId,
      clientUUID,
      role: 'volunteer',
    })
    await PresenceService.trackPassivity({ userId, clientUUID })
    expect((await PresenceService.getOnlineUserIds()).volunteers).toEqual([
      userId,
    ])

    await PresenceService.markOfflineIfPassive(userId)

    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [],
      volunteers: [],
    })
    expect(
      mockedUserActionService.createAccountAction
    ).toHaveBeenLastCalledWith({
      action: ACCOUNT_USER_ACTIONS.INACTIVE_ON_SITE,
      userId,
      clientUUID,
    })
  })

  test('keeps an active user online', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    await PresenceService.trackActivity({
      userId,
      clientUUID,
      role: 'volunteer',
    })

    await PresenceService.markOfflineIfPassive(userId)

    expect((await PresenceService.getOnlineUserIds()).volunteers).toEqual([
      userId,
    ])
    // only the ACTIVE_ON_SITE from trackActivity
    expect(mockedUserActionService.createAccountAction).toHaveBeenCalledTimes(1)
  })

  test('keeps a user online while any of their clients is active', async () => {
    const userId = getDbUlid()
    const passiveClientUUID = getUuid()
    const activeClientUUID = getUuid()
    await PresenceService.trackActivity({
      userId,
      clientUUID: passiveClientUUID,
      role: 'volunteer',
    })
    await PresenceService.trackPassivity({
      userId,
      clientUUID: passiveClientUUID,
    })
    await PresenceService.trackActivity({
      userId,
      clientUUID: activeClientUUID,
      role: 'volunteer',
    })

    await PresenceService.markOfflineIfPassive(userId)

    expect((await PresenceService.getOnlineUserIds()).volunteers).toEqual([
      userId,
    ])
  })

  test('takes a user with no presence keys offline without logging an action', async () => {
    const userId = getDbUlid()
    // e.g. an active-timeout expiry whose notification was never delivered
    await PresenceService.markOnline(userId, 'volunteer', getUuid())

    await PresenceService.markOfflineIfPassive(userId)

    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [],
      volunteers: [],
    })
    expect(mockedUserActionService.createAccountAction).not.toHaveBeenCalled()
  })

  test('a passive user who was taken offline comes back online on activity', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    await PresenceService.trackActivity({
      userId,
      clientUUID,
      role: 'volunteer',
    })
    await PresenceService.trackPassivity({ userId, clientUUID })
    await PresenceService.markOfflineIfPassive(userId)

    await PresenceService.trackActivity({
      userId,
      clientUUID,
      role: 'volunteer',
    })

    expect((await PresenceService.getOnlineUserIds()).volunteers).toEqual([
      userId,
    ])
  })
})

async function makePassive(userId: string, clientUUID = getUuid()) {
  await PresenceService.trackActivity({ userId, clientUUID, role: 'volunteer' })
  await PresenceService.trackPassivity({ userId, clientUUID })
}

async function makeActive(userId: string, clientUUID = getUuid()) {
  await PresenceService.trackActivity({ userId, clientUUID, role: 'volunteer' })
}

describe('expectPassiveCoachesToRespondTo', () => {
  const mockedVolunteerRepo = jest.mocked(VolunteerRepo)
  const mockedSessionRepo = jest.mocked(SessionRepo)
  const mockedStudentRepo = jest.mocked(StudentRepo)
  const mockedUserRepo = jest.mocked(UserRepo)
  const mockedQueueService = jest.mocked(QueueService)
  const session = buildWaitingCurrentSession({ subject: 'algebraOne' })

  function coachCanTakeSessions(
    overrides: Partial<VolunteerSessionHoldEligibilityData> = {}
  ) {
    const coach = buildVolunteerSessionHoldEligibilityData(overrides)
    mockedVolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds.mockResolvedValue(
      [coach]
    )
    return coach.userId
  }

  function studentIsInGrade(gradeLevel: string) {
    mockedStudentRepo.getStudentProfilesByUserIds.mockResolvedValue([
      { gradeLevel },
    ] as Awaited<ReturnType<typeof StudentRepo.getStudentProfilesByUserIds>>)
  }

  function studentHasBanType(banType: USER_BAN_TYPES | null) {
    mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
      { id: session.studentId, banType },
    ])
  }

  function coachIsSponsoredByAmericaCounts(coachId: string) {
    mockedVolunteerRepo.getUserIdsWithActiveSponsorship.mockResolvedValue([
      coachId,
    ])
  }

  function coachIdsToCheck() {
    return mockedQueueService.add.mock.calls.flatMap(
      ([, , data]) => (data as { coachIds: string[] }).coachIds
    )
  }

  beforeEach(() => {
    mockedSessionRepo.getVolunteersInSessions.mockResolvedValue([])
    mockedVolunteerRepo.getUserIdsWithActiveSponsorship.mockResolvedValue([])
    mockedStudentRepo.isTestUser.mockResolvedValue(false)
    studentHasBanType(null)
    studentIsInGrade('11th')
  })

  test('schedules a check, one minute out, of a passive coach who can take the session', async () => {
    const coachId = coachCanTakeSessions()
    await makePassive(coachId)

    await PresenceService.expectPassiveCoachesToRespondTo(session)

    expect(mockedQueueService.add).toHaveBeenCalledWith(
      'MarkPassiveCoachesInactive',
      expect.objectContaining({
        delay: 60 * 1000,
        jobId: `MarkPassiveCoachesInactive:${session.id}`,
        removeOnComplete: true,
      }),
      {
        sessionId: session.id,
        coachIds: [coachId],
        listedAtEpochMs: expect.any(Number),
      }
    )
    expect(mockedQueueService.add.mock.calls[0][1].attempts).toBeGreaterThan(1)
    expect(mockedQueueService.add.mock.calls[0][1].removeOnFail).not.toBe(true)
  })

  test('does not check any coach for a session from a test student', async () => {
    await makePassive(coachCanTakeSessions())
    mockedStudentRepo.isTestUser.mockResolvedValue(true)

    await PresenceService.expectPassiveCoachesToRespondTo(session)

    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })

  test.each([USER_BAN_TYPES.SHADOW, USER_BAN_TYPES.COMPLETE])(
    'does not check any coach for a session from a student who now has a %s ban',
    async (banType) => {
      await makePassive(coachCanTakeSessions())
      studentHasBanType(banType)

      await PresenceService.expectPassiveCoachesToRespondTo(session)

      expect(mockedUserRepo.getUsersBanStatuses).toHaveBeenCalledWith([
        session.studentId,
      ])
      expect(mockedQueueService.add).not.toHaveBeenCalled()
    }
  )

  test('checks coaches for a session from a student who is only banned from live media', async () => {
    const coachId = coachCanTakeSessions()
    await makePassive(coachId)
    studentHasBanType(USER_BAN_TYPES.LIVE_MEDIA)

    await PresenceService.expectPassiveCoachesToRespondTo(session)

    expect(coachIdsToCheck()).toEqual([coachId])
  })

  test('does not check any coach for a session requested exclusively for another coach', async () => {
    await makePassive(coachCanTakeSessions())

    await PresenceService.expectPassiveCoachesToRespondTo({
      ...session,
      requestedVolunteerId: getUuid(),
    })

    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })

  test('checks coaches for a requested session once it is opened to all', async () => {
    const coachId = coachCanTakeSessions()
    await makePassive(coachId)

    await PresenceService.expectPassiveCoachesToRespondTo({
      ...session,
      requestedVolunteerId: getUuid(),
      openedToAllAt: new Date(),
    })

    expect(coachIdsToCheck()).toEqual([coachId])
  })

  test('does not check an active coach', async () => {
    const coachId = coachCanTakeSessions()
    await makeActive(coachId)

    await PresenceService.expectPassiveCoachesToRespondTo(session)

    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })

  test('does not check a coach who is active in one of their tabs', async () => {
    const coachId = coachCanTakeSessions()
    await makePassive(coachId)
    await makeActive(coachId)

    await PresenceService.expectPassiveCoachesToRespondTo(session)

    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })

  test('does not check a coach who is in a session', async () => {
    const coachId = coachCanTakeSessions()
    await makePassive(coachId)
    mockedSessionRepo.getVolunteersInSessions.mockResolvedValue([coachId])

    await PresenceService.expectPassiveCoachesToRespondTo(session)

    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })

  test.each([
    ['has not unlocked the subject', { unlockedSubjects: [] }],
    ['muted the subject', { mutedSubjects: ['algebraOne' as SUBJECTS] }],
    ['is not ready to coach', { isReadyToCoach: false }],
    ['is deactivated', { isDeactivated: true }],
  ])('does not check a coach who %s', async (_, overrides) => {
    await makePassive(coachCanTakeSessions(overrides))

    await PresenceService.expectPassiveCoachesToRespondTo(session)

    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })

  test('does not check an America Counts coach for a session outside their grades', async () => {
    const coachId = coachCanTakeSessions()
    await makePassive(coachId)
    coachIsSponsoredByAmericaCounts(coachId)
    studentIsInGrade('11th')

    await PresenceService.expectPassiveCoachesToRespondTo(session)

    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })

  test('does not check an America Counts coach for a session outside their subjects', async () => {
    const coachId = coachCanTakeSessions({
      unlockedSubjects: ['geometry' as SUBJECTS],
    })
    await makePassive(coachId)
    coachIsSponsoredByAmericaCounts(coachId)
    studentIsInGrade('8th')

    await PresenceService.expectPassiveCoachesToRespondTo(
      buildWaitingCurrentSession({ subject: 'geometry' })
    )

    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })

  test('checks an America Counts coach for a session in their subjects and grades', async () => {
    const coachId = coachCanTakeSessions()
    await makePassive(coachId)
    coachIsSponsoredByAmericaCounts(coachId)
    studentIsInGrade('8th')

    await PresenceService.expectPassiveCoachesToRespondTo(session)

    expect(coachIdsToCheck()).toEqual([coachId])
  })

  test('logs instead of throwing when finding the coaches fails', async () => {
    await makePassive(coachCanTakeSessions())
    mockedSessionRepo.getVolunteersInSessions.mockRejectedValue(
      new Error('db down')
    )

    await expect(
      PresenceService.expectPassiveCoachesToRespondTo(session)
    ).resolves.toBeUndefined()
    expect(mockedLogger.error).toHaveBeenCalled()
    expect(mockedQueueService.add).not.toHaveBeenCalled()
  })
})

describe('markOfflineIfPassive with passiveSinceEpochMs', () => {
  async function isOnline(coachId: string) {
    return (await PresenceService.getOnlineUserIds()).volunteers.includes(
      coachId
    )
  }

  function inactiveActionsFor(coachId: string) {
    return mockedUserActionService.createAccountAction.mock.calls.filter(
      ([{ action, userId }]) =>
        action === ACCOUNT_USER_ACTIONS.INACTIVE_ON_SITE && userId === coachId
    )
  }

  test('marks every tab of a coach who stayed passive as INACTIVE_ON_SITE and takes them offline', async () => {
    const coachId = getDbUlid()
    await makePassive(coachId)
    await makePassive(coachId)

    await PresenceService.markOfflineIfPassive(coachId, {
      passiveSinceEpochMs: Date.now(),
    })

    expect(inactiveActionsFor(coachId)).toHaveLength(2)
    expect(await isOnline(coachId)).toBe(false)
  })

  test('leaves a coach who became active', async () => {
    const coachId = getDbUlid()
    const clientUUID = getUuid()
    await makePassive(coachId, clientUUID)
    const listedAtEpochMs = Date.now()
    await makeActive(coachId, clientUUID)

    await PresenceService.markOfflineIfPassive(coachId, {
      passiveSinceEpochMs: listedAtEpochMs,
    })

    expect(inactiveActionsFor(coachId)).toHaveLength(0)
    expect(await isOnline(coachId)).toBe(true)
  })

  test('leaves a coach who became active and then passive again', async () => {
    const coachId = getDbUlid()
    const clientUUID = getUuid()
    await makePassive(coachId, clientUUID)
    const listedAtEpochMs = Date.now()
    jest.spyOn(Date, 'now').mockReturnValue(listedAtEpochMs + 1000)
    await makePassive(coachId, clientUUID)
    jest.spyOn(Date, 'now').mockRestore()

    await PresenceService.markOfflineIfPassive(coachId, {
      passiveSinceEpochMs: listedAtEpochMs,
    })

    expect(inactiveActionsFor(coachId)).toHaveLength(0)
    expect(await isOnline(coachId)).toBe(true)
  })

  test('leaves a coach who is active in another tab', async () => {
    const coachId = getDbUlid()
    await makePassive(coachId)
    const listedAtEpochMs = Date.now()
    await makeActive(coachId)

    await PresenceService.markOfflineIfPassive(coachId, {
      passiveSinceEpochMs: listedAtEpochMs,
    })

    expect(inactiveActionsFor(coachId)).toHaveLength(0)
    expect(await isOnline(coachId)).toBe(true)
  })

  test('finishes marking a coach on retry when marking one of their tabs failed', async () => {
    const coachId = getDbUlid()
    await makePassive(coachId)
    await makePassive(coachId)
    const listedAtEpochMs = Date.now()
    mockedUserActionService.createAccountAction
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('db down'))

    await expect(
      PresenceService.markOfflineIfPassive(coachId, {
        passiveSinceEpochMs: listedAtEpochMs,
      })
    ).rejects.toThrow('db down')
    expect(await isOnline(coachId)).toBe(true)

    await PresenceService.markOfflineIfPassive(coachId, {
      passiveSinceEpochMs: listedAtEpochMs,
    })

    expect(await isOnline(coachId)).toBe(false)
    expect(await redisClient.keys(`user-presence:*${coachId}*`)).toEqual([])
  })

  test('leaves a coach with no presence keys online', async () => {
    const coachId = getDbUlid()
    await PresenceService.markOnline(coachId, 'volunteer', getUuid())

    await PresenceService.markOfflineIfPassive(coachId, {
      passiveSinceEpochMs: Date.now(),
    })

    expect(await isOnline(coachId)).toBe(true)
  })

  test('is safe to retry', async () => {
    const coachId = getDbUlid()
    await makePassive(coachId)
    const listedAtEpochMs = Date.now()

    await PresenceService.markOfflineIfPassive(coachId, {
      passiveSinceEpochMs: listedAtEpochMs,
    })
    await PresenceService.markOfflineIfPassive(coachId, {
      passiveSinceEpochMs: listedAtEpochMs,
    })

    expect(inactiveActionsFor(coachId)).toHaveLength(1)
  })
})

describe('trackInactivity', () => {
  test('removes the user and logs INACTIVE_ON_SITE when their last presence keys are removed', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    await PresenceService.trackActivity({
      userId,
      clientUUID,
      role: 'student',
    })

    await PresenceService.trackInactivity({ userId, clientUUID })

    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [],
      volunteers: [],
    })

    expect(mockedUserActionService.createAccountAction).toHaveBeenNthCalledWith(
      1,
      {
        action: ACCOUNT_USER_ACTIONS.ACTIVE_ON_SITE,
        userId,
        clientUUID,
      }
    )
    expect(mockedUserActionService.createAccountAction).toHaveBeenNthCalledWith(
      2,
      {
        action: ACCOUNT_USER_ACTIONS.INACTIVE_ON_SITE,
        userId,
        clientUUID,
      }
    )
  })

  test('is a no-op and warns for a client with no presence keys', async () => {
    const userId = getDbUlid()
    const clientUUID = getUuid()
    await PresenceService.trackActivity({
      userId,
      clientUUID,
      role: 'student',
    })

    // e.g. a disconnect for a client that never sent a heartbeat
    await PresenceService.trackInactivity({ userId, clientUUID: getUuid() })

    expect((await PresenceService.getOnlineUserIds()).students).toEqual([
      userId,
    ])
    // no INACTIVE_ON_SITE action is logged without presence keys to remove
    expect(mockedUserActionService.createAccountAction).toHaveBeenCalledTimes(1)
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1)
  })

  test('keeps the user online when another device still has presence keys', async () => {
    const userId = getDbUlid()
    const clientUUIDA = getUuid()
    const clientUUIDB = getUuid()
    await PresenceService.trackActivity({
      userId,
      clientUUID: clientUUIDA,
      role: 'student',
    })
    await PresenceService.trackActivity({
      userId,
      clientUUID: clientUUIDB,
      role: 'student',
    })

    await PresenceService.trackInactivity({ userId, clientUUID: clientUUIDA })

    expect((await PresenceService.getOnlineUserIds()).students).toEqual([
      userId,
    ])

    await PresenceService.trackInactivity({ userId, clientUUID: clientUUIDB })

    expect(await PresenceService.getOnlineUserIds()).toEqual({
      students: [],
      volunteers: [],
    })
  })
})
