import { redisClient } from '../../services/RedisService'
import * as PresenceService from '../../services/PresenceService'
import * as UserActionService from '../../services/UserActionService'
import { getDbUlid, getUuid } from '../../models/pgUtils'
import { ACCOUNT_USER_ACTIONS } from '../../constants'
import logger from '../../logger'

jest.mock('../../services/UserActionService')
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
