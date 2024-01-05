import * as VolunteerRepo from '../../models/Volunteer'
import * as AssociatedPartnerRepo from '../../models/AssociatedPartner'
import * as VolunteerService from '../../services/VolunteerService'
import { generatePartnerAnalyticsReport } from '../../services/ReportService'
import { VolunteersForAnalyticsReport } from '../../models/Volunteer'
import { times } from 'lodash'
import Logger from '../../logger'

jest.mock('../../models/Volunteer/queries')
jest.mock('../../models/AssociatedPartner')
jest.mock('../../services/VolunteerService')

describe('ReportService', () => {
  let mockGetVolunteersForAnalyticsReport: jest.Mock
  let mockGetAssociatedPartnersAndSchools: jest.Mock
  let mockGetHourSummaryStats: jest.Mock

  beforeEach(() => {
    mockGetAssociatedPartnersAndSchools = AssociatedPartnerRepo.getAssociatedPartnersAndSchools as jest.Mock
    mockGetAssociatedPartnersAndSchools.mockResolvedValue({
      associatedPartnerSchools: ['1'],
      associatedStudentPartnerOrgs: ['2'],
    })
    mockGetHourSummaryStats = VolunteerService.getHourSummaryStats as jest.Mock
    mockGetHourSummaryStats.mockResolvedValue({
      totalCoachingHours: 10,
      totalQuizzesPassed: 10,
      totalElapsedAvailability: 10,
      totalVolunteerHours: 10,
    })
    mockGetVolunteersForAnalyticsReport = VolunteerRepo.getVolunteersForAnalyticsReport as jest.Mock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Generates the full report in several batches', async () => {
    const volunteers = [
      buildTestVolunteerForAnalyticsReport({ userId: '1', email: '1@test.co' }),
      buildTestVolunteerForAnalyticsReport({ userId: '2', email: '2@test.co' }),
      buildTestVolunteerForAnalyticsReport({ userId: '3', email: '3@test.co' }),
      buildTestVolunteerForAnalyticsReport({ userId: '4', email: '4@test.co' }),
      buildTestVolunteerForAnalyticsReport({ userId: '5', email: '5@test.co' }),
    ]
    // Mock returning multiple batches of volunteers (batchSize=2)
    mockGetVolunteersForAnalyticsReport
      .mockResolvedValueOnce({
        volunteers: [volunteers[0], volunteers[1]],
        isLastPage: false,
      })
      .mockResolvedValueOnce({
        volunteers: [volunteers[2], volunteers[3]],
        isLastPage: false,
      })
      .mockResolvedValueOnce({
        volunteers: [volunteers[4]],
        isLastPage: true,
      })

    const actual = await generatePartnerAnalyticsReport(
      'testOrg',
      'testOrgId',
      '01-01-2023',
      '12-31-2023',
      2
    )
    expect(mockGetVolunteersForAnalyticsReport).toHaveBeenCalledTimes(3) // 3 batches
    expect(mockGetHourSummaryStats).toHaveBeenCalledTimes(10) // 5 total volunteers, called 2x per volunteer
    expect(actual.report.length).toEqual(volunteers.length)
    expect(actual.report.map(row => row.email)).toEqual(
      volunteers.map(v => v.email)
    )

    // Verify the expected batch starts/finishes are logged
    times(3, n =>
      expect(Logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining(`Attempting to fetch volunteer batch #${n + 1}`)
      )
    )
    times(3, n =>
      expect(Logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining(`Completed batch #${n + 1}`)
      )
    )
    expect(Logger.info).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('batch #4')
    )
  })

  it.each([
    // batch size, total volunteers
    [2, 2],
    [2, 1],
  ])(
    'May generate a full report in a single batch',
    async (batchSize, totalVolunteers) => {
      mockGetVolunteersForAnalyticsReport.mockResolvedValue({
        isLastPage: true,
        volunteers: times(
          totalVolunteers,
          buildTestVolunteerForAnalyticsReport
        ),
      })
      const actual = await generatePartnerAnalyticsReport(
        'testOrg',
        'testOrgId',
        '01-01-2023',
        '12-31-2023',
        batchSize
      )
      expect(actual.report.length).toEqual(totalVolunteers)
      expect(mockGetVolunteersForAnalyticsReport).toHaveBeenCalledTimes(1) // 1 batch
      expect(mockGetHourSummaryStats).toHaveBeenCalledTimes(2 * totalVolunteers) // Called 2x per volunteer
      // Verify the expected batch starts/finishes are logged
      expect(Logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('Attempting to fetch volunteer batch #1')
      )
      expect(Logger.info).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('Completed batch #1')
      )
      expect(Logger.info).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('batch #2')
      )
    }
  )

  it('Throws an error if no volunteers were found and not on the last page', async () => {
    mockGetVolunteersForAnalyticsReport.mockResolvedValue({
      isLastPage: false,
      volunteers: [],
    })
    await expect(() =>
      generatePartnerAnalyticsReport(
        'testOrg',
        'testOrgId',
        '01-01-2023',
        '12-31-2023',
        2
      )
    ).rejects.toThrowError('Did not find any volunteers for partner org')
  })
})

const buildTestVolunteerForAnalyticsReport = (overrides = {}) => {
  return {
    userId: 'abc-123',
    firstName: 'Louise',
    lastName: 'Belcher',
    email: '1@test.co',
    isOnboarded: true,
    createdAt: new Date(),
    dateOnboarded: new Date(),
    totalQuizzesPassed: 10,
    totalNotifications: 10,
    totalNotificationsWithinRange: 5,
    totalPartnerSessions: 10,
    totalPartnerSessionsWithinRange: 5,
    totalPartnerTimeTutored: 10,
    totalPartnerTimeTutoredWithinRange: 5,
    totalSessions: 10,
    totalSessionsWithinRange: 5,
    totalUniquePartnerStudentsHelped: 10,
    totalUniquePartnerStudentsHelpedWithinRange: 5,
    totalUniqueStudentsHelped: 10,
    totalUniqueStudentsHelpedWithinRange: 5,
    ...overrides,
  } as VolunteersForAnalyticsReport
}
