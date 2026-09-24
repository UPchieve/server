import * as SessionHoldsService from '../../services/SessionHoldsService'
import * as PresenceService from '../../services/PresenceService'
import * as FeatureFlagsService from '../../services/FeatureFlagService'
import * as SessionRepo from '../../models/Session'
import * as VolunteerRepo from '../../models/Volunteer'
import * as Cache from '../../cache'
import moment from 'moment'
import { SUBJECTS } from '../../constants'
import { buildVolunteerSessionHoldEligibilityData } from '../mocks/generate'
import {
  getEligibleOnlineCoaches,
  getOrCreateSessionHolds,
  HOLD_PARAMETERS,
} from '../../services/SessionHoldsService'

jest.mock('../../cache')
jest.mock('../../services/FeatureFlagService')
jest.mock('../../services/PresenceService')
jest.mock('../../models/Session')
jest.mock('../../models/Volunteer')

const mockedCache = jest.mocked(Cache)
const mockedFeatureFlagsService = jest.mocked(FeatureFlagsService)
const mockedPresenceService = jest.mocked(PresenceService)
const mockedSessionRepo = jest.mocked(SessionRepo)
const mockedVolunteerRepo = jest.mocked(VolunteerRepo)
const TEST_TIME = new Date()
const coachIds: any[] = ['coach-1', 'coach-2', 'coach-3']
const COACH_DATA = [
  buildVolunteerSessionHoldEligibilityData({ userId: coachIds[0] }),
  buildVolunteerSessionHoldEligibilityData({ userId: coachIds[1] }),
  buildVolunteerSessionHoldEligibilityData({ userId: coachIds[2] }),
]

beforeEach(() => {
  jest.useFakeTimers()
  jest.setSystemTime(TEST_TIME)
  jest.resetAllMocks()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('saveSessionHoldToCache', () => {
  it('Saves with the TTL that is the number of seconds until the last hold ends', async () => {
    const secondsToAdd = 37
    const endDate = moment(TEST_TIME).add(secondsToAdd, 'seconds').toDate()
    const holds = [
      { coachId: 'coach-123', startsAt: new Date(), endsAt: new Date() },
      { coachId: 'coach-456', startsAt: new Date(), endsAt: endDate },
    ]
    await SessionHoldsService.saveSessionHoldToCache('session-123', holds)
    expect(mockedCache.saveWithExpiration).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(holds),
      60 * 10
    )
  })
})

describe('dismissHold', () => {
  it('Moves all the other coaches up in their timeline', async () => {
    const sessionId = 'session-123'
    const hold1 = {
      coachId: '1',
      startsAt: TEST_TIME,
      endsAt: moment(TEST_TIME).add(10, 'seconds').toDate(),
    }
    const hold2 = {
      coachId: '2',
      startsAt: moment(TEST_TIME).add(10, 'seconds'),
      endsAt: moment(TEST_TIME).add(20, 'seconds').toDate(),
    }
    const hold3 = {
      coachId: '3',
      startsAt: moment(TEST_TIME).add(20, 'seconds'),
      endsAt: moment(TEST_TIME).add(30, 'seconds').toDate(),
    }

    mockedCache.getIfExists.mockResolvedValueOnce(
      JSON.stringify([hold1, hold2, hold3])
    )
    await SessionHoldsService.dismissHold(hold1.coachId, sessionId)

    // Updated holds have the times shifted up
    // and first hold ends now
    const updatedHold1 = {
      ...hold1,
      endsAt: TEST_TIME,
    }
    const updatedHold2 = {
      ...hold2,
      startsAt: TEST_TIME,
      endsAt: moment(TEST_TIME).add(10, 'seconds').toDate(),
    }
    const updatedHold3 = {
      ...hold3,
      startsAt: moment(updatedHold2.startsAt).add(10, 'seconds').toDate(),
      endsAt: moment(updatedHold2.startsAt).add(20, 'seconds').toDate(),
    }

    expect(mockedCache.saveWithExpiration).toHaveBeenCalledTimes(1) // cached under the session key once
    expect(mockedCache.saveWithExpiration).toHaveBeenNthCalledWith(
      1,
      `SESSION_HOLD:${sessionId}`,
      JSON.stringify([updatedHold1, updatedHold2, updatedHold3]),
      10 * 60
    )
    expect(mockedCache.addToSortedSet).toHaveBeenCalledTimes(3) // cached under the coach in a sorted set, once per coach.
    expect(mockedCache.addToSortedSet).toHaveBeenNthCalledWith(
      1,
      `COACH_HOLDS:${updatedHold1.coachId}`,
      JSON.stringify(updatedHold1),
      TEST_TIME.getTime()
    )
    expect(mockedCache.addToSortedSet).toHaveBeenNthCalledWith(
      2,
      `COACH_HOLDS:${updatedHold2.coachId}`,
      JSON.stringify(updatedHold2),
      moment(TEST_TIME).add(10, 'seconds').toDate().getTime()
    )
    expect(mockedCache.addToSortedSet).toHaveBeenNthCalledWith(
      3,
      `COACH_HOLDS:${updatedHold3.coachId}`,
      JSON.stringify(updatedHold3),
      moment(TEST_TIME).add(20, 'seconds').toDate().getTime()
    )
  })
})

describe('buildHolds', () => {
  it('Builds the holds', () => {
    const actual = SessionHoldsService.buildHolds(['1', '2', '3'])
    const now = TEST_TIME
    const tenSecondsLater = moment(TEST_TIME).add(10, 'seconds').toDate()
    const twentySecondsLater = moment(TEST_TIME).add(20, 'seconds').toDate()
    const thirtySecondsLater = moment(TEST_TIME).add(30, 'seconds').toDate()

    expect(actual).toEqual([
      {
        coachId: '1',
        startsAt: now,
        endsAt: tenSecondsLater,
      },
      {
        coachId: '2',
        startsAt: tenSecondsLater,
        endsAt: twentySecondsLater,
      },
      {
        coachId: '3',
        startsAt: twentySecondsLater,
        endsAt: thirtySecondsLater,
      },
    ])
  })
})

describe('clearHoldsForSession', () => {
  it('Removes all the cached hold info for the session and its coaches on hold from the cache', async () => {
    const coachId1 = '1'
    const coachId2 = '2'
    const coachId3 = '3'
    const cachedHolds: SessionHoldsService.SessionHold[] = [
      {
        coachId: coachId1,
        startsAt: TEST_TIME,
        endsAt: moment(TEST_TIME).add(30, 'seconds').toDate(),
      },
      {
        coachId: coachId2,
        startsAt: TEST_TIME,
        endsAt: moment(TEST_TIME).add(60, 'seconds').toDate(),
      },
      {
        coachId: coachId3,
        startsAt: TEST_TIME,
        endsAt: moment(TEST_TIME).add(90, 'seconds').toDate(),
      },
    ]
    const sessionId = 'session-123'
    mockedCache.getIfExists.mockResolvedValueOnce(JSON.stringify(cachedHolds))
    await SessionHoldsService.clearSessionHolds(sessionId)
    expect(mockedCache.getIfExists).toHaveBeenCalledTimes(1)
    expect(mockedCache.remove).toHaveBeenCalledTimes(4)
    expect(mockedCache.remove).toHaveBeenNthCalledWith(
      1,
      `SESSION_HOLD:${sessionId}`
    )
    expect(mockedCache.remove).toHaveBeenNthCalledWith(
      2,
      `COACH_HOLDS:${coachId1}`
    )
    expect(mockedCache.remove).toHaveBeenNthCalledWith(
      3,
      `COACH_HOLDS:${coachId2}`
    )
    expect(mockedCache.remove).toHaveBeenNthCalledWith(
      4,
      `COACH_HOLDS:${coachId3}`
    )
  })
})

describe('getOrCreateSessionHolds', () => {
  const SESSION_DATA = {
    id: 'session-123',
    subject: SUBJECTS.PREALGREBA,
    createdAt: new Date(),
    studentId: 'student-123',
  }

  beforeEach(() => {
    mockedCache.getIfExists.mockResolvedValue(undefined)
    mockedFeatureFlagsService.getSessionHoldsStudentFeatureFlag.mockResolvedValue(
      true
    )
  })

  it('Returns the cached holds if there are any', async () => {
    const hold = buildSessionHold()
    mockedCache.getIfExists.mockResolvedValueOnce(JSON.stringify([hold]))
    const actual = await SessionHoldsService.getOrCreateSessionHolds(
      SESSION_DATA,
      COACH_DATA
    )
    expect(actual).toEqual([hold])
    expect(mockedCache.saveWithExpiration).not.toHaveBeenCalled()
    expect(mockedCache.removeFromSortedSetByRange).not.toHaveBeenCalled()
    expect(mockedCache.addToSortedSet).not.toHaveBeenCalled()
    expect(mockedCache.setExpiration).not.toHaveBeenCalled()
  })

  it('Returns the cached holds even if the input eligible coach list is empty', async () => {
    const hold1 = buildSessionHold({ coachId: coachIds[0] })
    const hold2 = buildSessionHold({ coachId: coachIds[1] })
    mockedCache.getIfExists.mockResolvedValueOnce(
      JSON.stringify([hold1, hold2])
    )
    const actual = await SessionHoldsService.getOrCreateSessionHolds(
      SESSION_DATA,
      []
    )
    expect(actual).toEqual([hold1, hold2])
    expect(mockedCache.saveWithExpiration).not.toHaveBeenCalled()
    expect(mockedCache.removeFromSortedSetByRange).not.toHaveBeenCalled()
    expect(mockedCache.addToSortedSet).not.toHaveBeenCalled()
    expect(mockedCache.setExpiration).not.toHaveBeenCalled()
  })

  it('Returns no holds if the student level feature flag is off', async () => {
    mockedCache.getIfExists.mockResolvedValueOnce(undefined)
    mockedFeatureFlagsService.getSessionHoldsStudentFeatureFlag.mockResolvedValueOnce(
      false
    )
    const actual = await SessionHoldsService.getOrCreateSessionHolds(
      SESSION_DATA,
      ['coach-123']
    )
    expect(actual).toEqual([])
    expect(
      mockedFeatureFlagsService.getSessionHoldsStudentFeatureFlag
    ).toHaveBeenCalledTimes(1)
    expect(mockedCache.saveWithExpiration).toHaveBeenCalledTimes(1)
    // Still saves [] to cache
    expect(mockedCache.saveWithExpiration).toHaveBeenNthCalledWith(
      1,
      `SESSION_HOLD:${SESSION_DATA.id}`,
      JSON.stringify([]),
      HOLD_PARAMETERS.SESSION_TTL_SECONDS
    )
  })

  it('Returns no holds when there are no coaches online', async () => {
    mockedCache.getIfExists.mockResolvedValueOnce(undefined)
    const actual = await SessionHoldsService.getOrCreateSessionHolds(
      SESSION_DATA,
      []
    )
    expect(actual).toEqual([])
    expect(
      mockedFeatureFlagsService.getSessionHoldsStudentFeatureFlag
    ).toHaveBeenCalledTimes(0)
    expect(mockedCache.getIfExists).toHaveBeenCalledTimes(1)
    expect(mockedCache.saveWithExpiration).toHaveBeenNthCalledWith(
      1,
      `SESSION_HOLD:${SESSION_DATA.id}`,
      JSON.stringify([]),
      HOLD_PARAMETERS.SESSION_TTL_SECONDS
    )
  })

  it('Saves and returns holds', async () => {
    mockedCache.getIfExists.mockResolvedValueOnce(undefined)
    const actual = await SessionHoldsService.getOrCreateSessionHolds(
      SESSION_DATA,
      COACH_DATA
    )
    expect(actual.length).toEqual(3)
    expect(mockedCache.saveWithExpiration).toHaveBeenCalledTimes(1)
    // Saves everything to cache
    expect(mockedCache.saveWithExpiration).toHaveBeenNthCalledWith(
      1,
      `SESSION_HOLD:${SESSION_DATA.id}`,
      JSON.stringify(actual),
      HOLD_PARAMETERS.SESSION_TTL_SECONDS
    )
    expect(mockedCache.removeFromSortedSetByRange).toHaveBeenCalledTimes(3) // for each coach
    expect(mockedCache.addToSortedSet).toHaveBeenCalledTimes(3)
    expect(mockedCache.setExpiration).toHaveBeenCalledTimes(3)
  })

  describe('Coach eligibility', () => {
    beforeEach(() => {
      // Set up default mocks for the positive path: all flags on, all coaches certified, no prior holds, etc.
      mockedFeatureFlagsService.getSessionHoldsStudentFeatureFlag.mockResolvedValue(
        true
      )
      mockedFeatureFlagsService.getSessionHoldsCoachFeatureFlag.mockResolvedValue(
        true
      )
      mockedCache.getIfExists.mockResolvedValueOnce(undefined) // no pre-existing holds in the cache.
    })

    it('Only returns holds for the coaches who are certified in the subject AND do not have it muted', async () => {
      const coachData = [
        buildVolunteerSessionHoldEligibilityData({ userId: coachIds[0] }),
        buildVolunteerSessionHoldEligibilityData({
          userId: coachIds[1],
          unlockedSubjects: [],
        }), // missing the cert
        buildVolunteerSessionHoldEligibilityData({
          userId: coachIds[2],
          mutedSubjects: [SESSION_DATA.subject],
        }), // muted the subject
      ]
      const actual = await SessionHoldsService.getOrCreateSessionHolds(
        SESSION_DATA,
        coachData
      )
      const actualCoachIds = new Set(actual.map((hold) => hold.coachId))
      expect(actualCoachIds).toEqual(new Set([coachIds[0]]))
    })

    it('Only returns a limited number of coaches', async () => {
      // HOLD_PARAMETERS configuration drives how many holds we can create.
      // Current configuration is 3, but if we change that, this test could fail, so just update
      // the number of coaches as needed.
      const coachIds = ['1', '2', '3', '4']
      const maxNumberOfHolds = HOLD_PARAMETERS.MAX_HOLDS_PER_SESSION
      const coachData = [
        ...COACH_DATA,
        // 4 total volunteers who could have this session hold eventually
        buildVolunteerSessionHoldEligibilityData({ userId: coachIds[3] }),
      ]
      const actual = await getOrCreateSessionHolds(SESSION_DATA, coachData)
      expect(actual.length).toEqual(maxNumberOfHolds) // only 3 holds returned
    })
  })
})

describe('getEligibleOnlineCoaches', () => {
  beforeEach(() => {
    mockedCache.getFromSortedSetByRange.mockResolvedValue([]) // no existing holds for each coach
    mockedFeatureFlagsService.getSessionHoldsCoachFeatureFlag.mockResolvedValue(
      true
    )
    mockedPresenceService.getOnlineUserIds.mockResolvedValue({
      students: [],
      volunteers: coachIds,
    })
    mockedVolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds.mockResolvedValue(
      COACH_DATA
    )
    mockedSessionRepo.getVolunteersInSessions.mockResolvedValue([])
  })

  it('Only returns coaches who are not already in a session', async () => {
    mockedSessionRepo.getVolunteersInSessions.mockResolvedValue([
      coachIds[0],
      coachIds[1],
    ])
    const actual = await SessionHoldsService.getEligibleOnlineCoaches()
    expect(actual.length).toEqual(1)
    expect(actual[0]).toEqual(COACH_DATA[2])
  })

  it('Only returns ready-to-coach, non-deactivated, non-banned coaches', async () => {
    const deactivated = buildVolunteerSessionHoldEligibilityData({
      isDeactivated: true,
    })
    const completeBanned = buildVolunteerSessionHoldEligibilityData({
      banType: 'complete',
    })
    const shadowBanned = buildVolunteerSessionHoldEligibilityData({
      banType: 'shadow',
    })
    const notReadyToCoach = buildVolunteerSessionHoldEligibilityData({
      isReadyToCoach: false,
    })
    const eligible = buildVolunteerSessionHoldEligibilityData({
      userId: coachIds[0],
    })
    const onlineCoaches = [
      deactivated,
      completeBanned,
      shadowBanned,
      notReadyToCoach,
      eligible,
    ]
    mockedVolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds.mockResolvedValue(
      onlineCoaches
    )

    const actual = await SessionHoldsService.getEligibleOnlineCoaches()
    expect(actual).toEqual([eligible])
  })

  it('Returns nobody if there are no currently online/present coaches', async () => {
    mockedPresenceService.getOnlineUserIds.mockResolvedValue({
      volunteers: [],
      students: [],
    })
    const actual = await SessionHoldsService.getEligibleOnlineCoaches()
    expect(actual).toEqual([])
  })

  it('Excludes coaches who have the FF off', async () => {
    mockedFeatureFlagsService.getSessionHoldsCoachFeatureFlag.mockResolvedValueOnce(
      true
    )
    mockedFeatureFlagsService.getSessionHoldsCoachFeatureFlag.mockResolvedValueOnce(
      true
    )
    mockedFeatureFlagsService.getSessionHoldsCoachFeatureFlag.mockResolvedValueOnce(
      false
    ) // 3rd coach ineligible
    const actual = await SessionHoldsService.getEligibleOnlineCoaches()
    expect(actual.length).toEqual(2)
    expect(new Set(actual.map((coach) => coach.userId))).toEqual(
      new Set([coachIds[0], coachIds[1]])
    )
  })

  it('Excludes coaches with holds coming up in the immediate future', async () => {
    // Coaches #1 and #3 are free, but coach #2 has an upcoming hold.
    mockedCache.getFromSortedSetByRange.mockResolvedValueOnce([])
    mockedCache.getFromSortedSetByRange.mockResolvedValueOnce([
      TEST_TIME.getTime(),
    ])
    mockedCache.getFromSortedSetByRange.mockResolvedValueOnce([])
    const actual = await getEligibleOnlineCoaches()
    expect(actual.length).toEqual(2)
    expect(actual[0].userId).toEqual(coachIds[0])
    expect(actual[1].userId).toEqual(coachIds[2])
  })
})

function buildSessionHold(
  overrides: Partial<SessionHoldsService.SessionHold> = {}
): SessionHoldsService.SessionHold {
  return {
    coachId: 'coach-123',
    startsAt: TEST_TIME,
    endsAt: moment(TEST_TIME).add(30, 'seconds').toDate(),
    ...overrides,
  }
}
