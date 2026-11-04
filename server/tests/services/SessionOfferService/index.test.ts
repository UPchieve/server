import * as SessionOfferService from '../../../services/SessionOfferService'
import * as NotifyVolunteerService from '../../../services/NotifyVolunteerService'
import * as PresenceService from '../../../services/PresenceService'
import SocketService from '../../../services/SocketService'
import * as SessionRepo from '../../../models/Session'
import * as SessionOfferRepo from '../../../models/SessionOffer'
import * as VolunteerRepo from '../../../models/Volunteer'
import { VolunteerSessionHoldEligibilityData } from '../../../models/Volunteer/types'
import {
  EXPIRED_KEY_CHANNEL,
  redisClient,
  redisSubClient,
} from '../../../services/RedisService'
import {
  buildCurrentSession,
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

const mockedNotifyVolunteerService = jest.mocked(NotifyVolunteerService)
const mockedSessionRepo = jest.mocked(SessionRepo)
const mockedSessionOfferRepo = jest.mocked(SessionOfferRepo)
const mockedVolunteerRepo = jest.mocked(VolunteerRepo)
const mockedSocketService = {
  emitSessionOffer: jest.fn(),
  emitSessionOfferClosed: jest.fn(),
  emitSessionChange: jest.fn(),
}

let coaches: VolunteerSessionHoldEligibilityData[]

beforeAll(() => {
  SessionOfferService.listenForOfferExpiries()
})

beforeEach(async () => {
  jest.resetAllMocks()
  await redisClient.flushall()
  coaches = []
  jest
    .mocked(SocketService.getInstance)
    .mockReturnValue(mockedSocketService as unknown as SocketService)
  mockedVolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds.mockImplementation(
    async (userIds) => coaches.filter(({ userId }) => userIds.includes(userId))
  )
  mockedSessionRepo.getVolunteersInSessions.mockResolvedValue([])
  mockedSessionRepo.getLastSessionEndedAtByVolunteerIds.mockResolvedValue([])
  mockedSessionRepo.getSessionCountsSinceByVolunteerIds.mockResolvedValue([])
})

async function bringCoachOnline(
  overrides: Partial<VolunteerSessionHoldEligibilityData> = {}
): Promise<Ulid> {
  const coach = buildVolunteerSessionHoldEligibilityData(overrides)
  coaches.push(coach)
  await PresenceService.markOnline(coach.userId, 'volunteer', getUuid())
  return coach.userId
}

// coachId is whoever ranked first, not necessarily the first coach online
async function offerSession(coachesOnline = 1): Promise<{
  session: CurrentSession
  coachId: Ulid
}> {
  for (let i = 0; i < coachesOnline; i++) await bringCoachOnline()
  const session = buildCurrentSession()
  await SessionOfferService.makeInitialOffer(session)
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

// offered sessions are listed and notified as soon as they are requested, so
// stopping does neither
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

describe('withoutSessionsBeingOffered', () => {
  test('leaves out sessions that are being offered', async () => {
    await bringCoachOnline()
    const offered = buildCurrentSession()
    const notOffered = buildCurrentSession()
    await SessionOfferService.makeInitialOffer(offered)

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
    const session = buildCurrentSession()

    await SessionOfferService.makeInitialOffer(session)

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

    await SessionOfferService.makeInitialOffer(buildCurrentSession())
    await SessionOfferService.makeInitialOffer(buildCurrentSession())

    const [firstCoach, secondCoach] = offeredCoaches()
    expect(secondCoach).not.toBe(firstCoach)
  })

  test('stops offering when every coach already has an offer', async () => {
    await offerSession()
    const session = buildCurrentSession()

    await SessionOfferService.makeInitialOffer(session)

    expect(mockedSocketService.emitSessionOffer).toHaveBeenCalledTimes(1)
    await expectStoppedOffering(session)
  })

  test('stops offering when no coach is online', async () => {
    const session = buildCurrentSession()

    await SessionOfferService.makeInitialOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    await expectStoppedOffering(session)
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
    const session = buildCurrentSession()

    await SessionOfferService.makeInitialOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    await expectStoppedOffering(session)
  })

  test('stops offering when the only coach online is in a session', async () => {
    const coachId = await bringCoachOnline()
    mockedSessionRepo.getVolunteersInSessions.mockResolvedValue([coachId])
    const session = buildCurrentSession()

    await SessionOfferService.makeInitialOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    await expectStoppedOffering(session)
  })

  test('stops offering when making the offer fails', async () => {
    await bringCoachOnline()
    mockedSessionRepo.getLastSessionEndedAtByVolunteerIds.mockRejectedValue(
      new Error('db down')
    )
    const session = buildCurrentSession()

    await SessionOfferService.makeInitialOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    await expectStoppedOffering(session)
  })

  test('frees the coach when sending the offer fails', async () => {
    const coachId = await bringCoachOnline()
    mockedSocketService.emitSessionOffer.mockImplementationOnce(() => {
      throw new Error('socket down')
    })
    const failed = buildCurrentSession()
    await SessionOfferService.makeInitialOffer(failed)
    const next = buildCurrentSession()

    await SessionOfferService.makeInitialOffer(next)

    expect(await isBeingOffered(failed.id)).toBe(false)
    expect(mockedSocketService.emitSessionOffer).toHaveBeenLastCalledWith(
      coachId,
      expect.objectContaining({ sessionId: next.id })
    )
  })

  test('does not offer or throw when saving the offer history fails', async () => {
    await bringCoachOnline()
    const set = jest
      .spyOn(redisClient, 'set')
      .mockRejectedValueOnce(new Error('redis down'))
    const session = buildCurrentSession()

    try {
      await SessionOfferService.makeInitialOffer(session)
    } finally {
      set.mockRestore()
    }

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
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
      const session = buildCurrentSession()
      await SessionOfferService.makeInitialOffer(session)
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
    await expectStoppedOffering(session)
  })

  test(`stops offering after ${SessionOfferService.MAX_OFFERS} offers`, async () => {
    for (let i = 0; i <= SessionOfferService.MAX_OFFERS; i++)
      await bringCoachOnline()
    const session = buildCurrentSession()
    await SessionOfferService.makeInitialOffer(session)

    for (let i = 0; i < SessionOfferService.MAX_OFFERS; i++)
      await expireOffer(session.id, lastOfferedCoach())

    expect(offeredCoaches()).toHaveLength(SessionOfferService.MAX_OFFERS)
    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(
      SessionOfferService.MAX_OFFERS
    )
    await expectStoppedOffering(session)
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

  test('saves the offer as shadow-offered when another coach joins', async () => {
    const { session, coachId } = await offerSession(2)

    await SessionOfferService.onSessionJoined(session.id, getDbUlid())

    expect(mockedSessionOfferRepo.insertSessionOffer).toHaveBeenCalledTimes(1)
    expectSaved(session, coachId, 'shadow-offered')
    expect(offeredCoaches()).toEqual([coachId])
    await expectStoppedOffering(session)
  })

  test('stops offering when a coach joins while offering starts', async () => {
    const session = buildCurrentSession()

    await Promise.all([
      SessionOfferService.makeInitialOffer(session),
      SessionOfferService.onSessionJoined(session.id, getDbUlid()),
    ])

    expect(mockedSessionOfferRepo.insertSessionOffer).not.toHaveBeenCalled()
    await expectStoppedOffering(session)
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
    const next = buildCurrentSession()

    await SessionOfferService.makeInitialOffer(next)

    expect(mockedSocketService.emitSessionOffer).toHaveBeenLastCalledWith(
      coachId,
      expect.objectContaining({ sessionId: next.id })
    )
  })

  test('no coach is offered a session the student ended while coaches were being ranked', async () => {
    const coachId = await bringCoachOnline()
    const session = buildCurrentSession()
    mockedSessionRepo.getLastSessionEndedAtByVolunteerIds.mockImplementationOnce(
      async () => {
        await SessionOfferService.onOfferWithdrawn(session.id)
        return []
      }
    )

    await SessionOfferService.makeInitialOffer(session)

    expect(mockedSocketService.emitSessionOffer).not.toHaveBeenCalled()
    const next = buildCurrentSession()
    await SessionOfferService.makeInitialOffer(next)
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

  test('frees the coach to be offered another session', async () => {
    const { session, coachId } = await offerSession()
    await expireOffer(session.id, coachId)
    const next = buildCurrentSession()

    await SessionOfferService.makeInitialOffer(next)

    expect(mockedSocketService.emitSessionOffer).toHaveBeenLastCalledWith(
      coachId,
      expect.objectContaining({ sessionId: next.id })
    )
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
      'shadow-offered',
      (sessionId) =>
        SessionOfferService.onSessionJoined(sessionId, getDbUlid()),
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
