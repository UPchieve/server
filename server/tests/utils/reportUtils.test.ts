test.todo('postgres migration')
/*import moment from 'moment'
import { mocked } from 'jest-mock';
import * as reportUtils from '../../utils/reportUtils'
import * as UserActionRepo from '../../models/UserAction/queries'
import * as SessionRepo from '../../models/Session/queries'
import * as VolunteerRepo from '../../models/Volunteer/queries'
import * as AvailabilityRepo from '../../models/Availability/queries'
import { buildVolunteer, getObjectId, buildUserAction } from '../generate'
import { InputError } from '../../models/Errors'
import { asObjectId } from '../../utils/type-utils'
jest.mock('../../services/SessionService')
jest.mock('../../services/VolunteerService')
jest.mock('../../models/Session/queries')
jest.mock('../../models/Volunteer/queries')

const mockedSessionRepo = mocked(SessionRepo, true)
const mockedVolunteerRepo = mocked(VolunteerRepo, true)

function buildAnalyticVolunteer(
  overrides: Partial<reportUtils.PartnerVolunteerAnalytics> = {}
): reportUtils.PartnerVolunteerAnalytics {
  const volunteer = buildVolunteer({
    volunteerPartnerOrg: 'example',
  })
  return {
    _id: volunteer._id,
    firstName: volunteer.firstname,
    lastName: volunteer.lastname,
    email: volunteer.email,
    state: volunteer.state,
    isOnboarded: volunteer.isOnboarded,
    createdAt: volunteer.createdAt,
    dateOnboarded: new Date(),
    certifications: volunteer.certifications,
    availabilityLastModifiedAt: new Date(),
    isDeactivated: volunteer.isDeactivated,
    lastActivityAt: volunteer.lastActivityAt,
    sessionAnalytics: {
      uniqueStudentsHelped: [
        {
          _id: null,
          total: 0,
          totalWithinDateRange: 0,
        },
      ],
      sessionStats: [
        {
          _id: null,
          total: 0,
          totalWithinDateRange: 0,
        },
      ],
      uniquePartnerStudentsHelped: [
        {
          _id: null,
          total: 0,
          totalWithinDateRange: 0,
        },
      ],
      sessionPartnerStats: [
        {
          _id: null,
          total: 0,
          totalWithinDateRange: 0,
        },
      ],
      timeTutoredPartnerStats: [
        {
          _id: null,
          total: 0,
          totalWithinDateRange: 0,
        },
      ],
    },
    textNotifications: { _id: null, total: 0, totalWithinDateRange: 0 },
    hourSummaryTotal: {
      totalCoachingHours: 0,
      totalQuizzesPassed: 0,
      totalElapsedAvailability: 0,
      totalVolunteerHours: 0,
    },
    hourSummaryDateRange: {
      totalCoachingHours: 0,
      totalQuizzesPassed: 0,
      totalElapsedAvailability: 0,
      totalVolunteerHours: 0,
    },
    ...overrides,
  }
}

describe('Generate telecom report', () => {
  const rootTime = moment('2021-04-20', 'YYYY-MM-DD').tz('America/New_York')
  const certifications = {
    math: {
      passed: true,
    },
  }
  const volunteers = [buildVolunteer({ certifications })]
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
      name: 'session 1',
    },
    {
      timeTutored: 12 * 60000,
      volunteerJoinedAt: session2Time,
      endedAt: moment(session2Time).add(12, 'minutes'), // contribute 0 min
      name: 'session 2',
    },
    {
      timeTutored: 88 * 60000,
      volunteerJoinedAt: session3Time,
      endedAt: moment(session3Time).add(88, 'minutes'), // contribute 90 min
      name: 'session 3',
    },
    {
      timeTutored: 60 * 60000,
      volunteerJoinedAt: session4Time,
      endedAt: moment(session4Time).add(60, 'minutes'), // contribute 60 min
      name: 'session 4',
    },
  ]
  const availabilityDateRange = [
    {
      _id: getObjectId(),
      volunteerId: volunteers[0]._id,
      timezone: 'America/New_York',
      modifiedAt: new Date(),
      createdAt: new Date(),
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
        '11p': false,
      },
    },
  ]
  const actions = [
    buildUserAction({
      createdAt: moment(rootTime)
        .subtract(1, 'week')
        .hour(10)
        .toDate(),
    }),
  ]

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Test hour sum algorithm', async () => {
    jest
      .spyOn(UserActionRepo, 'getActionsWithPipeline')
      .mockResolvedValueOnce(actions)
    mockedSessionRepo.getSessionsWithPipeline.mockResolvedValueOnce(sessions)
    jest
      .spyOn(AvailabilityRepo, 'getHistoryForDatesByVolunteerId')
      .mockResolvedValueOnce(availabilityDateRange)

    const result = await reportUtils.generateTelecomReport(volunteers, [])
    expect(result[0].hours).toBe(7)
  })
  test('Test summary stats', async () => {
    jest
      .spyOn(UserActionRepo, 'getActionsWithPipeline')
      .mockResolvedValueOnce(actions)

    mockedSessionRepo.getSessionsWithPipeline.mockResolvedValueOnce(sessions)
    jest
      .spyOn(AvailabilityRepo, 'getHistoryForDatesByVolunteerId')
      .mockResolvedValueOnce(availabilityDateRange)

    const row = await reportUtils.telecomHourSummaryStats(volunteers[0], [])
    expect(row.totalVolunteerHours).toBe(7)
    expect(row.totalCoachingHours).toBe(3.5) // 3.5hrs in session
    expect(row.totalElapsedAvailability).toBe(2.25) // 45min session time subtracted from availability
    expect(row.totalQuizzesPassed).toBe(1) // 1 quiz
  })
})

describe('getAnalyticsReportRow', () => {
  test('Should give the shape of the analytic report row ', async () => {
    const volunteer = buildAnalyticVolunteer()
    const row = reportUtils.getAnalyticsReportRow(volunteer)

    expect(row).toMatchObject({
      firstName: volunteer.firstName, // tests pulling property straight off volunteer
      certificationsReceived: 0, // tests cert sum calculation
      onboardingStatus: 'In progress', // tests onboarding status calculation
      // tests all stat calculations get included
      totalTextsReceived: 0,
      totalSessionsCompleted: 0,
      totalUniqueStudentsHelped: 0,
      totalTutoringHours: 0,
      totalTrainingHours: 0,
      totalElapsedAvailabilityHours: 0,
      totalVolunteerHours: 0,
      dateRangeTextsReceived: 0,
      dateRangeSessionsCompleted: 0,
      dateRangeUniqueStudentsHelped: 0,
      dateRangeTutoringHours: 0,
      dateRangeTrainingHours: 0,
      dateRangeElapsedAvailabilityHours: 0,
      dateRangeVolunteerHours: 0,
    })
  })
})

describe('getAnalyticsReportSummary', () => {
  test('Should return a summary of the analytics report with summed values', async () => {
    const rowOne = reportUtils.getAnalyticsReportRow(
      buildAnalyticVolunteer({
        createdAt: new Date('2021-01-05T00:00:00.000+00:00'),
        isOnboarded: true,
        dateOnboarded: new Date('2021-02-01T00:00:00.000+00:00'),
        sessionAnalytics: {
          uniqueStudentsHelped: [
            {
              _id: null,
              total: 0,
              totalWithinDateRange: 0,
            },
          ],
          sessionStats: [
            {
              _id: null,
              total: 5,
              totalWithinDateRange: 2,
            },
          ],
          uniquePartnerStudentsHelped: [
            {
              _id: null,
              total: 1,
              totalWithinDateRange: 1,
            },
          ],
          sessionPartnerStats: [
            {
              _id: null,
              total: 2,
              totalWithinDateRange: 2,
            },
          ],
          timeTutoredPartnerStats: [
            {
              _id: null,
              total: 1000 * 60 * 10,
              totalWithinDateRange: 1000 * 60 * 10,
            },
          ],
        },
        textNotifications: { _id: null, total: 10, totalWithinDateRange: 5 },
        hourSummaryTotal: {
          totalCoachingHours: 2,
          totalQuizzesPassed: 2,
          totalElapsedAvailability: 1,
          totalVolunteerHours: 5,
        },
        hourSummaryDateRange: {
          totalCoachingHours: 2,
          totalQuizzesPassed: 1,
          totalElapsedAvailability: 1,
          totalVolunteerHours: 4,
        },
      })
    )
    const rowTwo = reportUtils.getAnalyticsReportRow(
      buildAnalyticVolunteer({
        createdAt: new Date('2020-09-01T00:00:00.000+00:00'),
        isOnboarded: true,
        dateOnboarded: new Date('2020-10-01T00:00:00.000+00:00'),
        sessionAnalytics: {
          uniqueStudentsHelped: [
            {
              _id: null,
              total: 0,
              totalWithinDateRange: 0,
            },
          ],
          sessionStats: [
            {
              _id: null,
              total: 12,
              totalWithinDateRange: 4,
            },
          ],
          uniquePartnerStudentsHelped: [
            {
              _id: null,
              total: 5,
              totalWithinDateRange: 2,
            },
          ],
          sessionPartnerStats: [
            {
              _id: null,
              total: 5,
              totalWithinDateRange: 2,
            },
          ],
          timeTutoredPartnerStats: [
            {
              _id: null,
              total: 1000 * 60 * 20,
              totalWithinDateRange: 1000 * 60 * 10,
            },
          ],
        },
        textNotifications: { _id: null, total: 100, totalWithinDateRange: 30 },
        hourSummaryTotal: {
          totalCoachingHours: 10,
          totalQuizzesPassed: 4,
          totalElapsedAvailability: 5,
          totalVolunteerHours: 19,
        },
        hourSummaryDateRange: {
          totalCoachingHours: 5,
          totalQuizzesPassed: 3,
          totalElapsedAvailability: 3,
          totalVolunteerHours: 11,
        },
      })
    )
    const report = [rowOne, rowTwo]
    const startDate = new Date('2021-01-01T00:00:00.000+00:00')
    const endDate = new Date('2021-03-01T00:00:00.000+00:00')

    mockedVolunteerRepo.getVolunteersWithPipeline.mockResolvedValue([] as any[])

    const summary = await reportUtils.getAnalyticsReportSummary(
      'example',
      report,
      startDate,
      endDate
    )
    const expected = {
      signUps: {
        total: 2,
        totalWithinDateRange: 1,
      },
      volunteersOnboarded: {
        total: 2,
        totalWithinDateRange: 1,
      },
      onboardingRate: {
        total: 100,
        totalWithinDateRange: 100,
      },
      opportunities: {
        total: 110,
        totalWithinDateRange: 35,
      },
      sessionsCompleted: {
        total: 17,
        totalWithinDateRange: 6,
      },
      pickupRate: {
        total: 15.45,
        totalWithinDateRange: 17.14,
      },
      volunteerHours: {
        total: 24,
        totalWithinDateRange: 15,
      },
      uniqueStudentsHelped: {
        total: 0,
        totalWithinDateRange: 0,
      },
      uniquePartnerStudentsHelped: {
        total: 0,
        totalWithinDateRange: 0,
      },
    }

    expect(summary).toEqual(expected)
  })
})

describe('validateSessionDateRanges', () => {
  test('Should throw an error for invalid sessionFrom date format', () => {
    const t = () => {
      reportUtils.validateSessionDateRanges({
        sessionRangeFrom: '01/01/2021',
        sessionRangeTo: '',
      })
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow('"Session from" date does not follow a MM-DD-YYYY format')
  })

  test('Should throw an error for invalid sessionFrom date format', () => {
    const t = () => {
      reportUtils.validateSessionDateRanges({
        sessionRangeFrom: '01-01-2021',
        sessionRangeTo: '01/02/2021',
      })
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow('"Session to" date does not follow a MM-DD-YYYY format')
  })

  test('Should throw an error for when passing an empty string as a date', () => {
    const t = () => {
      reportUtils.validateSessionDateRanges({
        sessionRangeFrom: '',
        sessionRangeTo: '01-02-2021',
      })
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow('"Session from" date does not follow a MM-DD-YYYY format')
  })
})

describe('validateJoinedDateRanges', () => {
  test('Should throw an error for invalid joinedAfter date format', () => {
    const t = () => {
      reportUtils.validateJoinedDateRanges({
        joinedAfter: '01/01/2021',
        joinedBefore: '',
      })
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow('"Joined after" date does not follow a MM-DD-YYYY format')
  })

  test('Should throw an error for invalid joinedBefore date format', () => {
    const t = () => {
      reportUtils.validateJoinedDateRanges({
        joinedAfter: '01-01-2021',
        joinedBefore: '01/02/2021',
      })
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow(
      '"Joined before" date does not follow a MM-DD-YYYY format'
    )
  })

  test('Should throw an error for when passing an empty string as a date', () => {
    const t = () => {
      reportUtils.validateJoinedDateRanges({
        joinedAfter: '',
        joinedBefore: '01-02-2021',
      })
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow('"Joined after" date does not follow a MM-DD-YYYY format')
  })
})

describe('validateStudentReportQuery', () => {
  test('Should throw an error for invalid student partner org', () => {
    const t = () => {
      reportUtils.validateStudentReportQuery({
        sessionRangeFrom: '01-01-2021',
        sessionRangeTo: '01-02-2021',
        studentPartnerOrg: 'bogus-org',
        studentPartnerSite: '',
        highschoolId: '',
      } as reportUtils.StudentReportQuery)
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow('Invalid student partner organization')
  })

  test('Should throw an error for invalid student partner org site for a partner with no sites', () => {
    const data = {
      sessionRangeFrom: '01-01-2021',
      sessionRangeTo: '01-02-2021',
      studentPartnerOrg: 'example',
      studentPartnerSite: 'bogus',
      highschoolId: '',
    } as reportUtils.StudentReportQuery
    const t = () => {
      reportUtils.validateStudentReportQuery(data)
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow(
      `Invalid student partner site for ${data.studentPartnerOrg}`
    )
  })

  test('Should throw an error for invalid student partner org site if not a listed site for a parter', () => {
    const data = {
      sessionRangeFrom: '01-01-2021',
      sessionRangeTo: '01-02-2021',
      studentPartnerOrg: 'example4',
      studentPartnerSite: 'bogus',
      highschoolId: '',
    } as reportUtils.StudentReportQuery
    const t = () => {
      reportUtils.validateStudentReportQuery(data)
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow(
      `Invalid student partner site for ${data.studentPartnerOrg}`
    )
  })

  test('Should throw an error for invalid high school id', () => {
    const data = {
      sessionRangeFrom: '01-01-2021',
      sessionRangeTo: '01-02-2021',
      studentPartnerOrg: '',
      studentPartnerSite: '',
      highSchoolId: '1234',
    } as reportUtils.StudentReportQuery
    const t = () => {
      reportUtils.validateStudentReportQuery(data)
    }
    expect(t).toThrow(InputError)
    expect(t).toThrow('Invalid high school id')
  })
})

describe('getAssociatedPartnersAndSchools', () => {
  test('Should get student partner org when associated partner only has a student partner org listed', () => {
    const result = reportUtils.getAssociatedPartnersAndSchools('example')
    const expected = {
      associatedPartnerSchools: [],
      associatedStudentPartnerOrgs: ['example'],
    }

    expect(result).toEqual(expected)
  })

  test('Should get student partner orgs when associated partner has a sponsor org with only partner schools', () => {
    const result = reportUtils.getAssociatedPartnersAndSchools('example2')
    const expected = {
      associatedPartnerSchools: [
        asObjectId('618abe7ba0e5212595a7bf98'),
        asObjectId('618abe7ba0e5212595a7bf99'),
        asObjectId('618abe7ba0e5212595a7bf9a'),
      ],
      associatedStudentPartnerOrgs: [],
    }

    expect(result).toEqual(expected)
  })

  test('Should get both student partner orgs and partner schools when associated partner has a sponsor org with schools and partner orgs', () => {
    const result = reportUtils.getAssociatedPartnersAndSchools('example3')
    const expected = {
      associatedPartnerSchools: [
        asObjectId('618abe7ba0e5212595a7bf9b'),
        asObjectId('618abe7ba0e5212595a7bf9c'),
      ],
      associatedStudentPartnerOrgs: ['example', 'example2'],
    }

    expect(result).toEqual(expected)
  })

  test('Should return empty lists of partner orgs and partner schools if there is no matching associated partner', () => {
    const result = reportUtils.getAssociatedPartnersAndSchools('bogus')
    const expected = {
      associatedPartnerSchools: [],
      associatedStudentPartnerOrgs: [],
    }

    expect(result).toEqual(expected)
  })
})
*/
