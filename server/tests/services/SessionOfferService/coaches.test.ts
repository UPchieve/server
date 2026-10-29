import * as SessionRepo from '../../../models/Session'
import * as VolunteerRepo from '../../../models/Volunteer'
import * as PresenceService from '../../../services/PresenceService'
import { eligibleCoaches } from '../../../services/SessionOfferService/coaches'
import { minutesInMs } from '../../../utils/time-utils'
import { SUBJECTS } from '../../../constants/subjects'
import { buildVolunteerSessionHoldEligibilityData } from '../../mocks/generate'

jest.mock('../../../models/Session')
jest.mock('../../../models/Volunteer')
jest.mock('../../../services/PresenceService')

const mockedSessionRepo = jest.mocked(SessionRepo)
const mockedVolunteerRepo = jest.mocked(VolunteerRepo)
const mockedPresenceService = jest.mocked(PresenceService)
const NOW = new Date('2026-01-01T12:00:00Z')

function minutesAgo(minutes: number) {
  return new Date(NOW.getTime() - minutesInMs(minutes))
}

describe('eligibleCoaches', () => {
  const subject = 'algebraOne' as SUBJECTS

  function setup(
    coaches: Parameters<typeof buildVolunteerSessionHoldEligibilityData>[0][]
  ) {
    const coachData = coaches.map((c) =>
      buildVolunteerSessionHoldEligibilityData(c)
    )
    mockedPresenceService.getOnlineUsers.mockResolvedValue(
      coachData.map(({ userId }) => ({ userId, onlineSince: minutesAgo(10) }))
    )
    mockedVolunteerRepo.getSubjectAndReadyToCoachInfoByUserIds.mockResolvedValue(
      coachData
    )
    mockedSessionRepo.getVolunteersInSessions.mockResolvedValue([])
    return coachData.map(({ userId }) => userId)
  }

  test('returns coaches who have the subject unlocked and not muted', async () => {
    const [canTutor] = setup([{ unlockedSubjects: [subject] }])

    const actual = await eligibleCoaches(subject)

    expect(actual.map(({ userId }) => userId)).toEqual([canTutor])
  })

  test('excludes coaches who have not unlocked the subject', async () => {
    const [canTutor] = setup([
      { unlockedSubjects: [subject] },
      { unlockedSubjects: ['prealgebra' as SUBJECTS] },
    ])

    const actual = await eligibleCoaches(subject)

    expect(actual.map(({ userId }) => userId)).toEqual([canTutor])
  })

  test('excludes coaches who have muted the subject', async () => {
    const [canTutor] = setup([
      { unlockedSubjects: [subject] },
      { unlockedSubjects: [subject], mutedSubjects: [subject] },
    ])

    const actual = await eligibleCoaches(subject)

    expect(actual.map(({ userId }) => userId)).toEqual([canTutor])
  })
})
