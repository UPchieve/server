import { mocked } from 'jest-mock'
import * as VolunteerRepo from '../../models/Volunteer'
import * as AssociatedPartnerRepo from '../../models/AssociatedPartner'
import * as VolunteerService from '../../services/VolunteerService'
import { generatePartnerAnalyticsReport } from '../../services/ReportService'
import { times } from 'lodash'
import logger from '../../logger'
import { buildTestVolunteerForAnalyticsReport } from '../mocks/generate'
import { RepoReadError } from '../../models/Errors'

jest.mock('../../models/Volunteer/queries')
jest.mock('../../models/AssociatedPartner')
jest.mock('../../services/VolunteerService')
jest.mock('../../logger')
const mockedLogger = mocked(logger)

describe('ReportService', () => {
  let mockGetVolunteersForAnalyticsReport: jest.Mock
  let mockGetAssociatedPartnersAndSchools: jest.Mock
  let mockGetHourSummaryStats: jest.Mock

  beforeEach(() => {
    mockGetAssociatedPartnersAndSchools =
      AssociatedPartnerRepo.getAssociatedPartnersAndSchools as jest.Mock
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
    mockGetVolunteersForAnalyticsReport =
      VolunteerRepo.getVolunteersForAnalyticsReport as jest.Mock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('generatePartnerAnalyticsReport', () => {
    it('Generates the full report in several batches', async () => {
      const volunteers = [
        buildTestVolunteerForAnalyticsReport({
          userId: '1',
          email: '1@test.co',
        }),
        buildTestVolunteerForAnalyticsReport({
          userId: '2',
          email: '2@test.co',
        }),
        buildTestVolunteerForAnalyticsReport({
          userId: '3',
          email: '3@test.co',
        }),
        buildTestVolunteerForAnalyticsReport({
          userId: '4',
          email: '4@test.co',
        }),
        buildTestVolunteerForAnalyticsReport({
          userId: '5',
          email: '5@test.co',
        }),
      ]
      // Mock returning multiple batches of volunteers (batchSize=2)
      mockGetVolunteersForAnalyticsReport
        .mockResolvedValueOnce([volunteers[0], volunteers[1], volunteers[2]])
        .mockResolvedValueOnce([volunteers[2], volunteers[3], volunteers[4]])
        .mockResolvedValueOnce([volunteers[4]])

      const actual = await generatePartnerAnalyticsReport(
        'testOrg',
        'testOrgId',
        '01-01-2023',
        '12-31-2023'
      )
      expect(mockGetVolunteersForAnalyticsReport).toHaveBeenCalledTimes(3) // 3 batches
      expect(mockGetHourSummaryStats).toHaveBeenCalledTimes(10) // 5 total volunteers, called 2x per volunteer
      expect(actual.report.length).toEqual(volunteers.length)
      expect(actual.report.map((row) => row.email)).toEqual(
        volunteers.map((v) => v.email)
      )

      // Verify the expected batch starts/finishes are logged
      times(3, (n) =>
        expect(mockedLogger.info).toHaveBeenCalledWith(
          expect.anything(),
          expect.stringContaining(
            `Attempting to fetch volunteer batch #${n + 1}`
          )
        )
      )
      times(3, (n) =>
        expect(mockedLogger.info).toHaveBeenCalledWith(
          expect.anything(),
          expect.stringContaining(`Completed batch #${n + 1}`)
        )
      )
      expect(mockedLogger.info).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('batch #4')
      )
    })

    it.each([2, 1])(
      'May generate a full report in a single batch',
      async (totalVolunteers) => {
        mockGetVolunteersForAnalyticsReport.mockResolvedValue(
          times(totalVolunteers, buildTestVolunteerForAnalyticsReport)
        )

        const actual = await generatePartnerAnalyticsReport(
          'testOrg',
          'testOrgId',
          '01-01-2023',
          '12-31-2023'
        )
        expect(actual.report.length).toEqual(totalVolunteers)
        expect(mockGetVolunteersForAnalyticsReport).toHaveBeenCalledTimes(1) // 1 batch
        expect(mockGetHourSummaryStats).toHaveBeenCalledTimes(
          2 * totalVolunteers
        ) // Called 2x per volunteer
        // Verify the expected batch starts/finishes are logged
        expect(mockedLogger.info).toHaveBeenCalledWith(
          expect.anything(),
          expect.stringContaining('Attempting to fetch volunteer batch #1')
        )
        expect(mockedLogger.info).toHaveBeenCalledWith(
          expect.anything(),
          expect.stringContaining('Completed batch #1')
        )
        expect(mockedLogger.info).not.toHaveBeenCalledWith(
          expect.anything(),
          expect.stringContaining('batch #2')
        )
      }
    )

    it('Throws an error if no volunteers were found and not on the last page', async () => {
      mockGetVolunteersForAnalyticsReport.mockRejectedValue(
        new RepoReadError('No volunteers found')
      )
      await expect(() =>
        generatePartnerAnalyticsReport(
          'testOrg',
          'testOrgId',
          '01-01-2023',
          '12-31-2023'
        )
      ).rejects.toThrowError('No volunteers found')
    })
  })
})
