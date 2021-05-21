import moment from 'moment'
import {
  generateTelecomReport,
  telecomHourSummaryStats,
  getAccumulatedSummaryAnalytics,
  getAnalyticsReportRow,
  PartnerVolunteerAnalytics
} from '../../utils/reportUtils'
import * as UserActionService from '../../services/UserActionService'
import SessionService from '../../services/SessionService'
import * as AvailabilityService from '../../services/AvailabilityService'
import { buildVolunteer } from '../generate'

function buildAnalyticVolunteer(
  overrides: Partial<PartnerVolunteerAnalytics> = {}
): PartnerVolunteerAnalytics {
  const volunteer = buildVolunteer()
  return {
    _id: volunteer._id,
    firstName: volunteer.firstname,
    lastName: volunteer.lastname,
    email: volunteer.email,
    state: volunteer.state,
    isOnboarded: volunteer.isOnboarded,
    createdAt: volunteer.createdAt,
    dateOnboarded: new Date(),
    firstSessionDate: new Date(),
    certifications: volunteer.certifications,
    availabilityLastModifiedAt: new Date(),
    sessionAnalytics: {
      uniqueStudentsHelped: [
        {
          _id: null,
          total: 0,
          totalWithinDateRange: 0
        }
      ],
      sessionStats: [
        {
          _id: null,
          total: 0,
          totalWithinDateRange: 0,
          firstSessionDate: new Date()
        }
      ]
    },
    textNotifications: { _id: null, total: 0, totalWithinDateRange: 0 },
    isDeactivated: volunteer.isDeactivated,
    lastActivityAt: volunteer.lastActivityAt,
    hourSummaryTotal: {
      totalCoachingHours: 0,
      totalQuizzesPassed: 0,
      totalElapsedAvailability: 0,
      totalVolunteerHours: 0
    },
    hourSummaryDateRange: {
      totalCoachingHours: 0,
      totalQuizzesPassed: 0,
      totalElapsedAvailability: 0,
      totalVolunteerHours: 0
    },
    ...overrides
  }
}

describe('Generate telecom report', () => {
  // @ts-expect-error
  const rootTime = moment('2021-04-20', 'YYYY-MM-DD').tz('America/New_York')
  const certifications = {
    math: {
      passed: true
    }
  }
  const volunteers = [
    {
      _id: '1234567890ab',
      firstname: 'Test',
      lastname: 'User',
      email: 'email@email.com',
      certifications: certifications
    }
  ]
  const session1Time = moment(rootTime)
    .subtract(1, 'week')
    .hour(12)
    .minute(44)
  const session2Time = moment(rootTime)
    .subtract(1, 'week')
    .hour(14)
    .minute(1)
  const session3Time = moment(rootTime)
    .subtract(1, 'week')
    .hour(17)
    .minute(20)
  const session4Time = moment(rootTime)
    .subtract(1, 'week')
    .hour(21)
    .minute(0)
  const sessions = [
    {
      timeTutored: 43 * 60000,
      volunteerJoinedAt: session1Time,
      endedAt: moment(session1Time).add(43, 'minutes'), // contribute 30 min
      name: 'session 1'
    },
    {
      timeTutored: 12 * 60000,
      volunteerJoinedAt: session2Time,
      endedAt: moment(session2Time).add(12, 'minutes'), // contribute 0 min
      name: 'session 2'
    },
    {
      timeTutored: 88 * 60000,
      volunteerJoinedAt: session3Time,
      endedAt: moment(session3Time).add(88, 'minutes'), // contribute 90 min
      name: 'session 3'
    },
    {
      timeTutored: 60 * 60000,
      volunteerJoinedAt: session4Time,
      endedAt: moment(session4Time).add(60, 'minutes'), // contribute 60 min
      name: 'session 4'
    }
  ]
  const availabilityDateRange = [
    {
      date: moment(session1Time).toDate(),
      availability: {
        '12a': false,
        '1a': false,
        '2a': false,
        '3a': false,
        '4a': false,
        '5a': false,
        '6a': false,
        '7a': false,
        '8a': false,
        '9a': false,
        '10a': false,
        '11a': false,
        '12p': false,
        '1p': true, // contribute 60 min
        '2p': true, // contribute 60 min
        '3p': true, // contribute 60 min
        '4p': false,
        '5p': false,
        '6p': false,
        '7p': false,
        '8p': false,
        '9p': false,
        '10p': false,
        '11p': false
      }
    }
  ]
  const actions = [
    {
      // contribute 60 min
      createdAt: moment(rootTime)
        .subtract(1, 'week')
        .hour(10)
        .toDate()
    }
  ]

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Test hour sum algorithm', async () => {
    jest
      .spyOn(UserActionService, 'getActionsWithPipeline')
      // @ts-expect-error
      .mockImplementationOnce(() => {
        return actions
      })
    SessionService.getSessionsWithPipeline = jest.fn(() => {
      return sessions
    })
    jest
      .spyOn(AvailabilityService, 'getAvailabilityHistoryWithPipeline')
      // @ts-expect-error
      .mockImplementationOnce(() => {
        return availabilityDateRange
      })

    const result = await generateTelecomReport(volunteers, [])
    expect(result[0].hours).toBe(7)
  })
  test('Test summary stats', async () => {
    jest
      .spyOn(UserActionService, 'getActionsWithPipeline')
      // @ts-expect-error
      .mockImplementationOnce(() => {
        return actions
      })
    SessionService.getSessionsWithPipeline = jest.fn(() => {
      return sessions
    })
    jest
      .spyOn(AvailabilityService, 'getAvailabilityHistoryWithPipeline')
      // @ts-expect-error
      .mockImplementationOnce(() => {
        return availabilityDateRange
      })

    const row = await telecomHourSummaryStats(volunteers[0], [])
    expect(row.totalVolunteerHours).toBe(7)
    expect(row.totalCoachingHours).toBe(3.5) // 3.5hrs in session
    expect(row.totalElapsedAvailability).toBe(2.25) // 45min session time subtracted from availability
    expect(row.totalQuizzesPassed).toBe(1) // 1 quiz
  })
})

describe('getAnalyticsReportRow', () => {
  test('Should give the shape of the analytic report row ', async () => {
    const volunteer = buildAnalyticVolunteer()
    const row = getAnalyticsReportRow(volunteer)

    expect(row).toMatchObject({
      firstName: volunteer.firstName,
      certificationsReceived: 0,
      onboardingStatus: 'In progress',
      dateRangeTextsReceived: 0
    })
  })
})

describe('getAccumulatedSummaryAnalytics', () => {
  test('Should return a summary of the analytics report with summed values', async () => {
    const rowOne = getAnalyticsReportRow(
      buildAnalyticVolunteer({
        createdAt: new Date('2021-01-05T00:00:00.000+00:00'),
        isOnboarded: true,
        dateOnboarded: new Date('2021-02-01T00:00:00.000+00:00'),
        sessionAnalytics: {
          uniqueStudentsHelped: [
            {
              _id: null,
              total: 0,
              totalWithinDateRange: 0
            }
          ],
          sessionStats: [
            {
              _id: null,
              total: 5,
              totalWithinDateRange: 2,
              firstSessionDate: new Date('2021-02-05T00:00:00.000+00:00')
            }
          ]
        },
        textNotifications: { _id: null, total: 10, totalWithinDateRange: 5 },
        hourSummaryTotal: {
          totalCoachingHours: 2,
          totalQuizzesPassed: 2,
          totalElapsedAvailability: 1,
          totalVolunteerHours: 5
        },
        hourSummaryDateRange: {
          totalCoachingHours: 2,
          totalQuizzesPassed: 1,
          totalElapsedAvailability: 1,
          totalVolunteerHours: 4
        }
      })
    )
    const rowTwo = getAnalyticsReportRow(
      buildAnalyticVolunteer({
        createdAt: new Date('2020-09-01T00:00:00.000+00:00'),
        isOnboarded: true,
        dateOnboarded: new Date('2020-10-01T00:00:00.000+00:00'),
        sessionAnalytics: {
          uniqueStudentsHelped: [
            {
              _id: null,
              total: 0,
              totalWithinDateRange: 0
            }
          ],
          sessionStats: [
            {
              _id: null,
              total: 12,
              totalWithinDateRange: 4,
              firstSessionDate: new Date('2020-10-10T00:00:00.000+00:00')
            }
          ]
        },
        textNotifications: { _id: null, total: 100, totalWithinDateRange: 30 },
        hourSummaryTotal: {
          totalCoachingHours: 10,
          totalQuizzesPassed: 4,
          totalElapsedAvailability: 5,
          totalVolunteerHours: 19
        },
        hourSummaryDateRange: {
          totalCoachingHours: 5,
          totalQuizzesPassed: 3,
          totalElapsedAvailability: 3,
          totalVolunteerHours: 11
        }
      })
    )
    const report = [rowOne, rowTwo]
    const startDate = new Date('2021-01-01T00:00:00.000+00:00')
    const endDate = new Date('2021-03-01T00:00:00.000+00:00')
    const summary = getAccumulatedSummaryAnalytics(report, startDate, endDate)
    const expected = {
      dateRangeSignUps: 1,
      dateRangeVolunteersOnboarded: 1,
      dateRangeTextsReceived: 35,
      dateRangeSessionsCompleted: 6,
      dateRangeVolunteerHours: 15,
      // @note: UNIQUE_STUDENTS_HELPED gets summed from the callee of getAccumulatedSummaryAnalytics
      dateRangeUniqueStudentsHelped: 0,
      totalSignUps: 2,
      totalVolunteersOnboarded: 2,
      totalTextsReceived: 110,
      totalSessionsCompleted: 17,
      totalVolunteerHours: 24,
      totalUniqueStudentsHelped: 0
    }

    expect(summary).toEqual(expected)
  })
})
