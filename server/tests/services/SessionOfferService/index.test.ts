import * as SessionOfferService from '../../../services/SessionOfferService'
import {
  OFFERING_PERIOD_MS,
  OFFER_DURATION_MS,
} from '../../../services/SessionOfferService/offer-config'
import * as FeatureFlagService from '../../../services/FeatureFlagService'
import * as NotifyVolunteerService from '../../../services/NotifyVolunteerService'
import * as PresenceService from '../../../services/PresenceService'
import * as UserActionService from '../../../services/UserActionService'
import * as AnalyticsService from '../../../services/AnalyticsService'
import { ACCOUNT_USER_ACTIONS, EVENTS } from '../../../constants'
import SocketService from '../../../services/SocketService'
import * as SessionRepo from '../../../models/Session'
import * as SessionOfferRepo from '../../../models/SessionOffer'
import * as VolunteerRepo from '../../../models/Volunteer'
import * as StudentRepo from '../../../models/Student'
import * as UserRepo from '../../../models/User'
import QueueService from '../../../services/QueueService'
import { VolunteerSessionHoldEligibilityData } from '../../../models/Volunteer/types'
import {
  EXPIRED_KEY_CHANNEL,
  redisClient,
  redisSubClient,
} from '../../../services/RedisService'
import {
  buildWaitingCurrentSession,
  buildVolunteerSessionHoldEligibilityData,
} from '../../mocks/generate'
import { getDbUlid, getUuid } from '../../../models/pgUtils'
import { SUBJECTS } from '../../../constants/subjects'
import { USER_BAN_TYPES } from '../../../constants/user'
import { CurrentSession } from '../../../types/session'
import { Ulid } from '../../../types/shared'
import { daysInMs } from '../../../utils/time-utils'

jest.mock('@sesamecare-oss/redlock', () =>
  jest.requireActual('../../mocks/redlock')
)
jest.mock('../../../services/NotifyVolunteerService')
jest.mock('../../../services/SocketService')
jest.mock('../../../models/Session')
jest.mock('../../../models/SessionOffer')
jest.mock('../../../models/Volunteer')
jest.mock('../../../models/Student')
jest.mock('../../../models/User')
jest.mock('../../../services/QueueService')
jest.mock('../../../services/UserActionService')
jest.mock('../../../services/AnalyticsService')

const mockedFeatureFlagService = jest.mocked(FeatureFlagService)
const mockedNotifyVolunteerService = jest.mocked(NotifyVolunteerService)
const mockedSessionRepo = jest.mocked(SessionRepo)
const mockedSessionOfferRepo = jest.mocked(SessionOfferRepo)
const mockedVolunteerRepo = jest.mocked(VolunteerRepo)
const mockedSocketService = {
  emitSessionOffer: jest.fn(),
  emitSessionOfferClosed: jest.fn(),
  emitSessionChange: jest.fn(),
  emitLeftQueue: jest.fn(),
}

let coaches: VolunteerSessionHoldEligibilityData[]
let clientUUIDs: Map<Ulid, string>

beforeAll(() => {
  // what an API instance runs: the shared offline handlers (via registerListeners
  // in the real app) plus the API-only expiry listeners
  SessionOfferService.registerOfflineHandlers()
  SessionOfferService.listenForOfferExpiries()
})

beforeEach(async () => {
  jest.resetAllMocks()
  await redisClient.flushall()
  coaches = []
  clientUUIDs = new Map()
  jest
    .mocked(SocketService.getInstance)
    .mockReturnValue(mockedSocketService as unknown as SocketService)
  mockedFeatureFlagService.isInSessionOffersTestGroup.mockResolvedValue(true)
  mockedVolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds.mockImplementation(
    async (userIds) => coaches.filter(({ userId }) => userIds.includes(userId))
  )
  mockedSessionRepo.getVolunteersInOrRequestedForSessions.mockResolvedValue([])
  mockedSessionRepo.getVolunteersInSessions.mockResolvedValue([])
  mockedVolunteerRepo.getActiveSponsorshipsByUserId.mockResolvedValue([])
  mockedVolunteerRepo.getUserIdsWithActiveSponsorship.mockResolvedValue([])
  jest.mocked(StudentRepo).getStudentProfilesByUserIds.mockResolvedValue([])
  jest.mocked(UserRepo).getUsersBanStatuses.mockResolvedValue([])
  mockedSessionRepo.getLastSessionEndedAtByVolunteerIds.mockResolvedValue([])
  mockedSessionRepo.getSessionCountsSinceByVolunteerIds.mockResolvedValue([])
  mockedSessionRepo.getCurrentSessionBySessionId.mockImplementation(
    async (id) => buildWaitingCurrentSession({ id })
  )
})

async function bringCoachOnline(
  overrides: Partial<VolunteerSessionHoldEligibilityData> = {}
): Promise<Ulid> {
  const coach = buildVolunteerSessionHoldEligibilityData(overrides)
  coaches.push(coach)
  const clientUUID = getUuid()
  clientUUIDs.set(coach.userId, clientUUID)
  await PresenceService.markOnline(coach.userId, 'volunteer', clientUUID)
  await SessionOfferService.joinQueue(coach.userId)
  return coach.userId
}

async function makeCoachPassive(coachId: Ulid): Promise<void> {
  await makeCoachActive(coachId)
  await PresenceService.trackPassivity({
    userId: coachId,
    clientUUID: clientUUIDs.get(coachId)!,
  })
}

async function makeCoachActive(coachId: Ulid): Promise<void> {
  await PresenceService.trackActivity({
    userId: coachId,
    clientUUID: clientUUIDs.get(coachId)!,
    role: 'volunteer',
  })
}

// what startSession does for a session it offers
async function startAndOffer(session: CurrentSession): Promise<void> {
  await SessionOfferService.hideFromSessionList(session)
  await SessionOfferService.makeInitialOffer(session)
}

// coachId is whoever ranked first, not necessarily the first coach online
async function offerSession(coachesOnline = 1): Promise<{
  session: CurrentSession
  coachId: Ulid
}> {
  for (let i = 0; i < coachesOnline; i++) await bringCoachOnline()
  const session = buildWaitingCurrentSession()
  await startAndOffer(session)
  return { session, coachId: lastOfferedCoach() }
}

function offeredCoaches(): Ulid[] {
  return mockedSocketService.emitSessionOffer.mock.calls.map(
    ([volunteerId]) => volunteerId
  )
}

function lastOfferedCoach(): Ulid {
  return offeredCoaches()[offeredCoaches().length - 1]
}

// redis only tells us the name of the expired key, and the timer is the only
// key named with both the session and the coach
async function timerKeyFor(sessionId: Ulid, coachId: Ulid): Promise<string> {
  const [key] = await redisClient.keys(`*${sessionId}*${coachId}*`)
  return key
}

// like redisSubClient.emit, but waits for the listeners to finish
async function hearExpiredKey(key: string, channel = EXPIRED_KEY_CHANNEL) {
  await Promise.all(
    redisSubClient
      .listeners('message')
      .map((listener) => listener(channel, key))
  )
}

async function expireOffer(sessionId: Ulid, coachId: Ulid): Promise<void> {
  await hearExpiredKey(await timerKeyFor(sessionId, coachId))
}

async function isBeingOffered(sessionId: Ulid): Promise<boolean> {
  const notOffered = await SessionOfferService.withoutSessionsBeingOffered([
    { id: sessionId },
  ])
  return notOffered.length === 0
}

// no coach took the offer, so the session goes to every coach as usual
async function expectOpenedToEveryCoach(session: CurrentSession) {
  expect(await isBeingOffered(session.id)).toBe(false)
  expect(
    mockedNotifyVolunteerService.beginRegularNotifications
  ).toHaveBeenCalledTimes(1)
  expect(
    mockedNotifyVolunteerService.beginRegularNotifications
  ).toHaveBeenCalledWith(expect.objectContaining({ id: session.id }))
  expect(mockedSocketService.emitSessionChange).toHaveBeenCalledWith(session.id)
}

// the session was joined or ended, so no other coach should hear about it
async function expectStoppedOffering(session: CurrentSession) {
  expect(await isBeingOffered(session.id)).toBe(false)
  expect(
    mockedNotifyVolunteerService.beginRegularNotifications
  ).not.toHaveBeenCalled()
  expect(mockedSocketService.emitSessionChange).not.toHaveBeenCalled()
}

function expectSaved(
  session: CurrentSession,
  coachId: Ulid,
  outcome: SessionOfferRepo.SessionOfferOutcome
) {
  expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledWith(
    expect.objectContaining({
      sessionId: session.id,
      volunteerId: coachId,
      outcome,
      offeredAt: expect.any(Date),
      closedAt: expect.any(Date),
    })
  )
}

describe('getInQueueSince', () => {
  const JOINED_AT = new Date('2026-11-13T15:00:00.000Z')

  // only Date is faked, so join times are exact
  beforeEach(() => {
    jest.useFakeTimers({
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
    jest.setSystemTime(JOINED_AT)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('is when the coach joined the queue', async () => {
    const coachId = getDbUlid()

    await SessionOfferService.joinQueue(coachId)

    expect(await SessionOfferService.getInQueueSince(coachId)).toEqual(
      JOINED_AT
    )
  })

  test('is null for a coach who never joined the queue', async () => {
    expect(await SessionOfferService.getInQueueSince(getDbUlid())).toBeNull()
  })

  test('is null once the coach leaves the queue', async () => {
    const coachId = getDbUlid()
    await SessionOfferService.joinQueue(coachId)

    await SessionOfferService.leaveQueue(coachId, 'manually exited queue')

    expect(await SessionOfferService.getInQueueSince(coachId)).toBeNull()
  })

  test('keeps the original time when a coach already in the queue joins again', async () => {
    const coachId = getDbUlid()
    await SessionOfferService.joinQueue(coachId)
    jest.advanceTimersByTime(5 * 60 * 1000)

    await SessionOfferService.joinQueue(coachId)

    expect(await SessionOfferService.getInQueueSince(coachId)).toEqual(
      JOINED_AT
    )
  })

  test('is the latest join time after the coach leaves and rejoins', async () => {
    const coachId = getDbUlid()
    await SessionOfferService.joinQueue(coachId)
    await SessionOfferService.leaveQueue(coachId, 'manually exited queue')
    jest.advanceTimersByTime(5 * 60 * 1000)

    await SessionOfferService.joinQueue(coachId)

    expect(await SessionOfferService.getInQueueSince(coachId)).toEqual(
      new Date(JOINED_AT.getTime() + 5 * 60 * 1000)
    )
  })
})

describe('queue analytics events', () => {
  test('joinQueue captures QUEUE_JOINED', async () => {
    const coachId = getDbUlid()

    await SessionOfferService.joinQueue(coachId)

    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      coachId,
      EVENTS.QUEUE_JOINED
    )
  })

  test('leaveQueue captures QUEUE_LEFT with the reason', async () => {
    const coachId = getDbUlid()
    await SessionOfferService.joinQueue(coachId)

    await SessionOfferService.leaveQueue(coachId, 'manually exited queue')

    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      coachId,
      EVENTS.QUEUE_LEFT,
      { reason: 'manually exited queue' }
    )
  })
})

describe('withoutSessionsBeingOffered', () => {
  test('leaves out sessions that are being offered', async () => {
    await bringCoachOnline()
    const offered = buildWaitingCurrentSession()
    const notOffered = buildWaitingCurrentSession()
    await startAndOffer(offered)

    const result = await SessionOfferService.withoutSessionsBeingOffered([
      offered,
      notOffered,
    ])

    expect(result).toEqual([notOffered])
  })

  test('returns nothing for no sessions', async () => {
    expect(await SessionOfferService.withoutSessionsBeingOffered([])).toEqual(
      []
    )
  })
})

describe('makeInitialOffer', () => {
  test('offers the session to the top-ranked coach', async () => {
    await bringCoachOnline()
    const topCoach = await bringCoachOnline()
    await bringCoachOnline()
    mockedSessionRepo.getLastSessionEndedAtByVolunteerIds.mockImplementation(
      async (volunteerIds) =>
        volunteerIds.map((volunteerId) => ({
          volunteerId,
          endedAt: new Date(
            Date.now() - daysInMs(volunteerId === topCoach ? 20 : 1)
          ),
        }))
    )
    const session = buildWaitingCurrentSession()

    await startAndOffer(session)

    expect(mockedSocketService.emitSessionOffer).toHaveBeenCalledTimes(1)
    expect(mockedSocketService.emitSessionOffer).toHaveBeenCalledWith(
      topCoach,
      {
        sessionId: session.id,
        subject: session.subject,
        subjectDisplayName: session.subjectDisplayName,
        topic: session.topic,
        studentFirstName: session.student.firstName,
        expiresAt: expect.any(Date),
      }
    )
    const [, { expiresAt }] = mockedSocketService.emitSessionOffer.mock.calls[0]
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now())
    expect(await isBeingOffered(session.id)).toBe(true)
  })

  test('skips coaches who already have an offer for another session', async () => {
    await bringCoachOnline()
    await bringCoachOnline()

    await startAndOffer(buildWaitingCurrentSession())
    await startAndOffer(buildWaitingCurrentSession())

    const [firstCoach, secondCoach] = offeredCoaches()
    expect(secondCoach).not.toBe(firstCoach)
  })

  test('stops offering when every coach already has an offer', async () => {
    await offerSession()
    const session = buildWaitingCurrentSession()

    await startAndOffer(session)

    expect(mockedSocketService.emitSessionOffer).toHaveBeenCalledTimes(1)
    await expectOpenedToEveryCoach(session)
  })

  test('stops offering when no coach is online', async () => {
    const session = buildWaitingCurrentSession()

    await startAndOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    await expectOpenedToEveryCoach(session)
  })

  test.each<[string, Partial<VolunteerSessionHoldEligibilityData>]>([
    [
      'has not unlocked the subject',
      { unlockedSubjects: ['prealgebra' as SUBJECTS] },
    ],
    ['has muted the subject', { mutedSubjects: ['algebraOne' as SUBJECTS] }],
    ['is not ready to coach', { isReadyToCoach: false }],
    ['is deactivated', { isDeactivated: true }],
    ['is banned', { banType: USER_BAN_TYPES.COMPLETE }],
    ['is shadow banned', { banType: USER_BAN_TYPES.SHADOW }],
  ])('stops offering when the only coach online %s', async (_, overrides) => {
    await bringCoachOnline(overrides)
    const session = buildWaitingCurrentSession()

    await startAndOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    await expectOpenedToEveryCoach(session)
  })

  test('expects a passive coach to respond to a session no coach was offered', async () => {
    const coachId = await bringCoachOnline()
    await makeCoachPassive(coachId)
    mockedFeatureFlagService.isInSessionOffersTestGroup.mockResolvedValue(false)
    const session = buildWaitingCurrentSession()

    await startAndOffer(session)

    expect(jest.mocked(QueueService).add).toHaveBeenCalledWith(
      'MarkPassiveCoachesInactive',
      expect.anything(),
      expect.objectContaining({ sessionId: session.id, coachIds: [coachId] })
    )
  })

  test('stops offering when the only coach online is not in the test group', async () => {
    const coachId = await bringCoachOnline()
    mockedFeatureFlagService.isInSessionOffersTestGroup.mockResolvedValue(false)
    const session = buildWaitingCurrentSession()

    await startAndOffer(session)

    expect(
      mockedFeatureFlagService.isInSessionOffersTestGroup
    ).toHaveBeenCalledWith(coachId)
    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    await expectOpenedToEveryCoach(session)
  })

  test('stops offering when the only coach online is in or requested for a session', async () => {
    const coachId = await bringCoachOnline()
    mockedSessionRepo.getVolunteersInOrRequestedForSessions.mockResolvedValue([
      coachId,
    ])
    const session = buildWaitingCurrentSession()

    await startAndOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    await expectOpenedToEveryCoach(session)
  })

  test('stops offering when making the offer fails', async () => {
    await bringCoachOnline()
    mockedSessionRepo.getLastSessionEndedAtByVolunteerIds.mockRejectedValue(
      new Error('db down')
    )
    const session = buildWaitingCurrentSession()

    await startAndOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    await expectOpenedToEveryCoach(session)
  })

  test('frees the coach when sending the offer fails', async () => {
    const coachId = await bringCoachOnline()
    mockedSocketService.emitSessionOffer.mockImplementationOnce(() => {
      throw new Error('socket down')
    })
    const failed = buildWaitingCurrentSession()
    await startAndOffer(failed)
    const next = buildWaitingCurrentSession()

    await startAndOffer(next)

    expect(await isBeingOffered(failed.id)).toBe(false)
    expect(mockedSocketService.emitSessionOffer).toHaveBeenLastCalledWith(
      coachId,
      expect.objectContaining({ sessionId: next.id })
    )
  })
})

describe('claimTopCoach', () => {
  test('ranks only coaches who are both online and in the queue', async () => {
    const onlineAndQueued = await bringCoachOnline()
    // online, but left the queue
    const onlineNotQueued = await bringCoachOnline()
    await SessionOfferService.leaveQueue(
      onlineNotQueued,
      'manually exited queue'
    )
    // in the queue, but not online
    const queuedNotOnline = buildVolunteerSessionHoldEligibilityData()
    coaches.push(queuedNotOnline)
    await SessionOfferService.joinQueue(queuedNotOnline.userId)
    const session = buildWaitingCurrentSession()
    // claiming a coach needs the offer history that hiding the session saves
    await SessionOfferService.hideFromSessionList(session)

    const offer = await SessionOfferService.claimTopCoach({
      id: session.id,
      subject: session.subject,
      subjectDisplayName: session.subjectDisplayName,
      topic: session.topic,
      studentFirstName: session.student.firstName,
    })

    expect(
      offer?.pending.scores.ranked.map(({ candidate }) => candidate.volunteerId)
    ).toEqual([onlineAndQueued])
    expect(offer?.pending.volunteerId).toBe(onlineAndQueued)
  })
})

describe('hideFromSessionList', () => {
  test('hides the session from the session list without offering it to a coach', async () => {
    await bringCoachOnline()
    const session = buildWaitingCurrentSession()

    expect(await SessionOfferService.hideFromSessionList(session)).toBe(true)

    expect(await isBeingOffered(session.id)).toBe(true)
    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
  })

  test('returns false without throwing when saving the offer history fails', async () => {
    const set = jest
      .spyOn(redisClient, 'set')
      .mockRejectedValueOnce(new Error('redis down'))
    const session = buildWaitingCurrentSession()

    let hidden: boolean
    try {
      hidden = await SessionOfferService.hideFromSessionList(session)
    } finally {
      set.mockRestore()
    }

    expect(hidden).toBe(false)
    expect(await isBeingOffered(session.id)).toBe(false)
  })
})

describe('offering the session to the next coach', () => {
  test.each<[string, (sessionId: Ulid, coachId: Ulid) => Promise<void>]>([
    ['expires', expireOffer],
    [
      'is declined',
      (sessionId, coachId) =>
        SessionOfferService.onOfferDeclined(sessionId, coachId),
    ],
  ])(
    'offers the session to a coach who has not had it when the offer %s',
    async (_, closeOffer) => {
      await bringCoachOnline()
      await bringCoachOnline()
      const session = buildWaitingCurrentSession()
      await startAndOffer(session)
      const firstCoach = lastOfferedCoach()

      await closeOffer(session.id, firstCoach)

      expect(offeredCoaches()).toHaveLength(2)
      expect(lastOfferedCoach()).not.toBe(firstCoach)
      expect(await isBeingOffered(session.id)).toBe(true)
    }
  )

  test('stops offering when every coach online has had the offer', async () => {
    const { session, coachId } = await offerSession()

    await expireOffer(session.id, coachId)

    expect(offeredCoaches()).toEqual([coachId])
    await expectOpenedToEveryCoach(session)
  })
})

describe('offering for up to OFFERING_PERIOD_MS', () => {
  // enough that offering runs out of time before it runs out of coaches
  const COACHES = Math.ceil(OFFERING_PERIOD_MS / OFFER_DURATION_MS) + 2

  let offeringEndsAt: number

  // only Date is faked, so redis keys expire as the clock moves
  beforeEach(() => {
    jest.useFakeTimers({
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
    offeringEndsAt = Date.now() + OFFERING_PERIOD_MS
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  function expiresAts(): number[] {
    return mockedSocketService.emitSessionOffer.mock.calls.map(
      ([, { expiresAt }]) => expiresAt.getTime()
    )
  }

  // each coach declines as their offer ends, so the offer history is written
  // often enough not to lapse
  async function keepOfferingUntil(session: CurrentSession, time: number) {
    while (Date.now() + OFFER_DURATION_MS < time) {
      jest.advanceTimersByTime(OFFER_DURATION_MS)
      await SessionOfferService.onOfferDeclined(session.id, lastOfferedCoach())
    }
    jest.setSystemTime(time)
  }

  test('when every offer expires, offers until another could not close in time', async () => {
    const { session } = await offerSession(COACHES)

    while (await isBeingOffered(session.id)) {
      const key = await timerKeyFor(session.id, lastOfferedCoach())
      jest.advanceTimersByTime(await redisClient.pttl(key))
      await hearExpiredKey(key)
    }

    expect(offeredCoaches().length).toBeLessThan(COACHES)
    for (const expiresAt of expiresAts())
      expect(expiresAt).toBeLessThanOrEqual(offeringEndsAt)
    expect(Date.now() + OFFER_DURATION_MS).toBeGreaterThan(offeringEndsAt)
    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(
      offeredCoaches().length
    )
    await expectOpenedToEveryCoach(session)
  })

  test('keeps offering when coaches decline right away', async () => {
    const { session } = await offerSession(COACHES)

    for (let i = 1; i < COACHES; i++)
      await SessionOfferService.onOfferDeclined(session.id, lastOfferedCoach())

    expect(offeredCoaches()).toHaveLength(COACHES)
  })

  test('offers the next coach when their offer would close right at the end', async () => {
    const { session } = await offerSession(COACHES)
    await keepOfferingUntil(session, offeringEndsAt - OFFER_DURATION_MS)
    const offered = offeredCoaches().length

    await SessionOfferService.onOfferDeclined(session.id, lastOfferedCoach())

    expect(offeredCoaches()).toHaveLength(offered + 1)
    expect(await isBeingOffered(session.id)).toBe(true)
  })

  test('stops offering when the next offer could not close in time', async () => {
    const { session } = await offerSession(COACHES)
    await keepOfferingUntil(session, offeringEndsAt - OFFER_DURATION_MS + 1)
    const offered = offeredCoaches().length

    await SessionOfferService.onOfferDeclined(session.id, lastOfferedCoach())

    expect(offeredCoaches()).toHaveLength(offered)
    await expectOpenedToEveryCoach(session)
  })
})

describe('onOfferDeclined', () => {
  test('saves the offer as declined', async () => {
    const { session, coachId } = await offerSession()

    await SessionOfferService.onOfferDeclined(session.id, coachId)

    expectSaved(session, coachId, 'declined')
  })

  test('does nothing when a coach without the offer declines', async () => {
    const { session } = await offerSession()

    await SessionOfferService.onOfferDeclined(session.id, getDbUlid())

    expect(mockedSessionOfferRepo.insertSessionOffer).not.toHaveBeenCalled()
    expect(await isBeingOffered(session.id)).toBe(true)
  })

  test('does nothing when the offer already expired', async () => {
    const { session, coachId } = await offerSession()
    await expireOffer(session.id, coachId)

    await SessionOfferService.onOfferDeclined(session.id, coachId)

    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(1)
  })
})

describe('onSessionJoined', () => {
  test('saves the offer as accepted when the coach with the offer joins', async () => {
    const { session, coachId } = await offerSession(2)

    await SessionOfferService.onSessionJoined(session.id, coachId)

    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(1)
    expectSaved(session, coachId, 'accepted')
    expect(offeredCoaches()).toEqual([coachId])
    await expectStoppedOffering(session)
  })

  test('does not save the offer when another coach joins', async () => {
    const { session, coachId } = await offerSession(2)

    await SessionOfferService.onSessionJoined(session.id, getDbUlid())

    expect(mockedSessionOfferRepo.insertSessionOffer).not.toHaveBeenCalled()
    expect(mockedSocketService.emitSessionOfferClosed).toHaveBeenCalledWith(
      coachId,
      { sessionId: session.id, outcome: 'expired' }
    )
    expect(offeredCoaches()).toEqual([coachId])
    await expectStoppedOffering(session)
  })

  test('does not save the next offer when a coach whose offer expired joins', async () => {
    const { session, coachId: lateCoach } = await offerSession(2)
    await expireOffer(session.id, lateCoach)
    const nextCoach = lastOfferedCoach()

    await SessionOfferService.onSessionJoined(session.id, lateCoach)

    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(1)
    expectSaved(session, lateCoach, 'expired')
    expect(mockedSocketService.emitSessionOfferClosed).toHaveBeenCalledWith(
      nextCoach,
      { sessionId: session.id, outcome: 'expired' }
    )
    expect(await isBeingOffered(session.id)).toBe(false)
  })

  test('saves the next offer as accepted when its coach joins after the expired coach', async () => {
    const { session, coachId: lateCoach } = await offerSession(2)
    await expireOffer(session.id, lateCoach)
    const nextCoach = lastOfferedCoach()

    await SessionOfferService.onSessionJoined(session.id, nextCoach)

    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(2)
    expectSaved(session, lateCoach, 'expired')
    expectSaved(session, nextCoach, 'accepted')
  })

  test('stops offering when a coach joins while offering starts', async () => {
    const session = buildWaitingCurrentSession()

    await Promise.all([
      startAndOffer(session),
      SessionOfferService.onSessionJoined(session.id, getDbUlid()),
    ])

    expect(mockedSessionOfferRepo.insertSessionOffer).not.toHaveBeenCalled()
    expect(await isBeingOffered(session.id)).toBe(false)
  })

  test('still stops offering when saving the offer fails', async () => {
    const { session, coachId } = await offerSession()
    mockedSessionOfferRepo.insertSessionOffer.mockRejectedValue(
      new Error('db down')
    )

    await SessionOfferService.onSessionJoined(session.id, coachId)

    expect(await isBeingOffered(session.id)).toBe(false)
  })

  test('does nothing for a session that was never offered', async () => {
    await SessionOfferService.onSessionJoined(getDbUlid(), getDbUlid())

    expect(mockedSessionOfferRepo.insertSessionOffer).not.toHaveBeenCalled()
  })

  describe('leaving the queue', () => {
    function expectLeftQueueForJoining(coachId: Ulid) {
      expect(mockedSocketService.emitLeftQueue).toHaveBeenCalledTimes(1)
      expect(mockedSocketService.emitLeftQueue).toHaveBeenCalledWith(
        coachId,
        'joined session'
      )
    }

    test('the coach with the offer leaves the queue when they join', async () => {
      const { session, coachId } = await offerSession()

      await SessionOfferService.onSessionJoined(session.id, coachId)

      expect(await SessionOfferService.isInQueue(coachId)).toBe(false)
      expectLeftQueueForJoining(coachId)
    })

    test('a coach leaves the queue when they join a session offered to another coach', async () => {
      // Technically this shouldn't happen, but just in case, here's a test O_O"
      const { session, coachId: offeredCoach } = await offerSession()
      const joiningCoach = await bringCoachOnline()

      await SessionOfferService.onSessionJoined(session.id, joiningCoach)

      expect(await SessionOfferService.isInQueue(joiningCoach)).toBe(false)
      expectLeftQueueForJoining(joiningCoach)
      // only the coach who joined leaves the queue
      expect(await SessionOfferService.isInQueue(offeredCoach)).toBe(true)
    })

    test('a coach leaves the queue when they join a session that was never offered', async () => {
      const coachId = await bringCoachOnline()

      await SessionOfferService.onSessionJoined(
        buildWaitingCurrentSession().id,
        coachId
      )

      expect(await SessionOfferService.isInQueue(coachId)).toBe(false)
      expectLeftQueueForJoining(coachId)
    })
  })
})

describe('onOfferWithdrawn', () => {
  test('saves the offer as withdrawn and stops offering', async () => {
    const { session, coachId } = await offerSession(2)

    await SessionOfferService.onOfferWithdrawn(session.id)

    expectSaved(session, coachId, 'withdrawn-by-student')
    expect(offeredCoaches()).toEqual([coachId])
    await expectStoppedOffering(session)
  })

  test('frees the coach to be offered another session', async () => {
    const { session, coachId } = await offerSession()
    await SessionOfferService.onOfferWithdrawn(session.id)
    const next = buildWaitingCurrentSession()

    await startAndOffer(next)

    expect(mockedSocketService.emitSessionOffer).toHaveBeenLastCalledWith(
      coachId,
      expect.objectContaining({ sessionId: next.id })
    )
  })

  test('no coach is offered a session the student ended while coaches were being ranked', async () => {
    const coachId = await bringCoachOnline()
    const session = buildWaitingCurrentSession()
    mockedSessionRepo.getLastSessionEndedAtByVolunteerIds.mockImplementationOnce(
      async () => {
        await SessionOfferService.onOfferWithdrawn(session.id)
        return []
      }
    )

    await startAndOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    const next = buildWaitingCurrentSession()
    await startAndOffer(next)
    expect(mockedSocketService.emitSessionOffer).toHaveBeenCalledWith(
      coachId,
      expect.objectContaining({ sessionId: next.id })
    )
  })

  test('does nothing for a session that was never offered', async () => {
    await SessionOfferService.onOfferWithdrawn(getDbUlid())

    expect(mockedSessionOfferRepo.insertSessionOffer).not.toHaveBeenCalled()
  })
})

describe('when an offer timer expires', () => {
  test('saves the offer as expired', async () => {
    const { session, coachId } = await offerSession()

    await expireOffer(session.id, coachId)

    expectSaved(session, coachId, 'expired')
  })

  test('frees an active coach to be offered another session', async () => {
    const { session, coachId } = await offerSession()
    await makeCoachActive(coachId)
    await expireOffer(session.id, coachId)
    const next = buildWaitingCurrentSession()

    await startAndOffer(next)

    expect(mockedSocketService.emitSessionOffer).toHaveBeenLastCalledWith(
      coachId,
      expect.objectContaining({ sessionId: next.id })
    )
  })

  test('takes a passive coach offline so they are not offered another session', async () => {
    const { session, coachId } = await offerSession()
    await expireOffer(session.id, coachId)
    const next = buildWaitingCurrentSession()

    await startAndOffer(next)

    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([])
    expect(mockedSocketService.emitSessionOffer).toHaveBeenCalledTimes(1)
  })

  test('does nothing when the offer was already accepted', async () => {
    const { session, coachId } = await offerSession()
    const timerKey = await timerKeyFor(session.id, coachId)
    await SessionOfferService.onSessionJoined(session.id, coachId)

    await hearExpiredKey(timerKey)

    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(1)
  })

  test('does nothing when the student already ended the session', async () => {
    const { session, coachId } = await offerSession()
    const timerKey = await timerKeyFor(session.id, coachId)
    await SessionOfferService.onOfferWithdrawn(session.id)

    await hearExpiredKey(timerKey)

    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(1)
  })

  test('closes the offer and offers the next coach once when the expiry is heard twice', async () => {
    const { session, coachId } = await offerSession(2)
    const timerKey = await timerKeyFor(session.id, coachId)

    await hearExpiredKey(timerKey)
    await hearExpiredKey(timerKey)

    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(1)
    expect(offeredCoaches()).toHaveLength(2)
  })

  test('only one of a join and an expiry at the same time closes the offer', async () => {
    const { session, coachId } = await offerSession()
    const timerKey = await timerKeyFor(session.id, coachId)

    await Promise.all([
      SessionOfferService.onSessionJoined(session.id, coachId),
      hearExpiredKey(timerKey),
    ])

    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(1)
  })

  test('ignores other keys that expire', async () => {
    const { session } = await offerSession()

    await hearExpiredKey(getDbUlid())

    expect(mockedSessionOfferRepo.insertSessionOffer).not.toHaveBeenCalled()
    expect(await isBeingOffered(session.id)).toBe(true)
  })

  test('ignores messages on other channels', async () => {
    const { session, coachId } = await offerSession()

    await hearExpiredKey(
      await timerKeyFor(session.id, coachId),
      'some-other-channel'
    )

    expect(mockedSessionOfferRepo.insertSessionOffer).not.toHaveBeenCalled()
    expect(await isBeingOffered(session.id)).toBe(true)
  })
})

describe('telling the coach their offer closed', () => {
  test.each<
    [
      SessionOfferRepo.SessionOfferOutcome,
      (sessionId: Ulid, coachId: Ulid) => Promise<void>,
    ]
  >([
    [
      'accepted',
      (sessionId, coachId) =>
        SessionOfferService.onSessionJoined(sessionId, coachId),
    ],
    [
      'declined',
      (sessionId, coachId) =>
        SessionOfferService.onOfferDeclined(sessionId, coachId),
    ],
    [
      'withdrawn-by-student',
      (sessionId) => SessionOfferService.onOfferWithdrawn(sessionId),
    ],
    ['expired', expireOffer],
  ])('tells the coach when the offer is %s', async (outcome, closeOffer) => {
    const { session, coachId } = await offerSession()

    await closeOffer(session.id, coachId)

    expect(mockedSocketService.emitSessionOfferClosed).toHaveBeenCalledTimes(1)
    expect(mockedSocketService.emitSessionOfferClosed).toHaveBeenCalledWith(
      coachId,
      { sessionId: session.id, outcome }
    )
  })

  test('tells no one when no offer closed', async () => {
    const { session } = await offerSession()

    await SessionOfferService.onOfferDeclined(session.id, getDbUlid())

    expect(mockedSocketService.emitSessionOfferClosed).not.toHaveBeenCalled()
  })

  test('still offers the next coach when telling the coach fails', async () => {
    const { session, coachId } = await offerSession(2)
    mockedSocketService.emitSessionOfferClosed.mockImplementation(() => {
      throw new Error('socket down')
    })

    await expireOffer(session.id, coachId)

    expect(offeredCoaches()).toHaveLength(2)
  })
})

describe('Inactivity/presence grace period before kicking the coach out of the queue', () => {
  async function simulateDisconnect(coachId: Ulid) {
    await PresenceService.trackInactivity({
      userId: coachId,
      clientUUID: clientUUIDs.get(coachId)!,
    })
  }

  // socket drops, then the new page tracks activity with the same client UUID
  async function simulatePageRefresh(coachId: Ulid) {
    await simulateDisconnect(coachId)
    await makeCoachActive(coachId)
  }

  async function gracePeriodKeyFor(coachId: Ulid): Promise<string | undefined> {
    const [key] = await redisClient.keys(`*leave-queue-grace*${coachId}`)
    return key
  }

  async function listenForExpiredGracePeriod(coachId: Ulid) {
    const key = await gracePeriodKeyFor(coachId)
    // asserting the key exists makes the test fail if the grace period never started
    expect(key).toBeDefined()
    await hearExpiredKey(key!)
  }

  async function isInQueue(coachId: Ulid) {
    return SessionOfferService.isInQueue(coachId)
  }

  it('Keeps them in the queue until the grace period is over', async () => {
    const coachId = await bringCoachOnline()
    await simulateDisconnect(coachId)
    expect(mockedSocketService.emitLeftQueue).not.toHaveBeenCalled()
    expect(await isInQueue(coachId)).toEqual(true)

    // Now test that once the grace period is over, they are kicked out of the queue
    await listenForExpiredGracePeriod(coachId)
    expect(mockedSocketService.emitLeftQueue).toHaveBeenCalled()
    expect(await isInQueue(coachId)).toEqual(false)
  })

  it('Keeps coach in the queue when they refresh the page', async () => {
    const coachId = await bringCoachOnline()
    await simulatePageRefresh(coachId)
    await listenForExpiredGracePeriod(coachId)
    expect(mockedSocketService.emitLeftQueue).not.toHaveBeenCalled()
    expect(await isInQueue(coachId)).toEqual(true)
  })

  it('Still records the disconnect in presence', async () => {
    const coachId = await bringCoachOnline()
    // trackInactivity only logs INACTIVE_ON_SITE for a client with presence keys,
    // which trackActivity creates
    await makeCoachActive(coachId)
    await simulateDisconnect(coachId)

    expect(await PresenceService.getOnlineUsers('volunteer')).toEqual([])
    expect(
      jest.mocked(UserActionService).createAccountAction
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        action: ACCOUNT_USER_ACTIONS.INACTIVE_ON_SITE,
        userId: coachId,
      })
    )
    expect(await isInQueue(coachId)).toEqual(true) // grace period has not run out yet
    await listenForExpiredGracePeriod(coachId)
    expect(await isInQueue(coachId)).toEqual(false) // now it has.
  })

  it('Restarts the grace period on each disconnect', async () => {
    // only Date is faked, so redis keys expire as the clock moves
    jest.useFakeTimers({
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
      const coachId = await bringCoachOnline()
      await simulateDisconnect(coachId)
      const key = (await gracePeriodKeyFor(coachId))!
      const fullGracePeriodMs = await redisClient.pttl(key)

      // partway through the grace period, the coach comes back and disconnects again
      jest.advanceTimersByTime(fullGracePeriodMs / 2)
      expect(await redisClient.pttl(key)).toBeLessThan(fullGracePeriodMs)
      await makeCoachActive(coachId)
      await simulateDisconnect(coachId)

      expect(await redisClient.pttl(key)).toEqual(fullGracePeriodMs)
    } finally {
      jest.useRealTimers()
    }
  })

  it('Emits once when the expiry is heard twice', async () => {
    // every subway server hears each key expiry
    const coachId = await bringCoachOnline()
    await simulateDisconnect(coachId)
    const key = (await gracePeriodKeyFor(coachId))!

    await hearExpiredKey(key)
    await hearExpiredKey(key)

    expect(mockedSocketService.emitLeftQueue).toHaveBeenCalledTimes(1)
    expect(mockedSocketService.emitLeftQueue).toHaveBeenCalledWith(
      coachId,
      'inactive'
    )
  })

  it('Does nothing for a coach who left manually during the grace period', async () => {
    const coachId = await bringCoachOnline()
    await simulateDisconnect(coachId)
    await SessionOfferService.leaveQueue(coachId, 'manually exited queue')

    await listenForExpiredGracePeriod(coachId)

    expect(mockedSocketService.emitLeftQueue).toHaveBeenCalledTimes(1)
    expect(mockedSocketService.emitLeftQueue).toHaveBeenCalledWith(
      coachId,
      'manually exited queue'
    )
    expect(await isInQueue(coachId)).toEqual(false)
  })
})
