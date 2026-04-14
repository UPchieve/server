import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import {
  buildProgressReport,
  buildProgressReportsPaginatedResult,
  buildProgressReportSummary,
  buildVolunteer,
  buildProgressReportOverviewSubjectStats,
} from '../../mocks/generate'
import { routeProgressReports } from '../../../router/api/progress-reports'
import * as ProgressReportsService from '../../../services/ProgressReportsService'
import { ProgressReportNotFoundError } from '../../../services/Errors'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../services/ProgressReportsService')

const mockedProgressReportsService = mocked(ProgressReportsService)

let mockUser = buildVolunteer()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeProgressReports(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

const subject = 'algebraOne'

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(path: string, payload?: object): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routeProgressReports', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildVolunteer()
  })

  describe('GET /api/progress-reports/sessions/:sessionId', () => {
    test('returns the progress report for the user session', async () => {
      const report = buildProgressReport()
      const sessionId = getUuid()
      mockedProgressReportsService.getProgressReportForUserSession.mockResolvedValueOnce(
        report
      )

      const response = await sendGet(
        `/api/progress-reports/sessions/${sessionId}`
      )
      expect(response.status).toBe(200)
      expect(
        mockedProgressReportsService.getProgressReportForUserSession
      ).toHaveBeenCalledWith(mockUser.id, sessionId)
      expect(response.body).toEqual({
        ...report,
        createdAt: report.createdAt.toISOString(),
        summary: {
          ...report.summary,
          createdAt: report.summary.createdAt.toISOString(),
          sessionCreatedAt: report.summary.sessionCreatedAt.toISOString(),
        },
        concepts: [
          {
            ...report.concepts[0],
            createdAt: report.concepts[0].createdAt.toISOString(),
          },
        ],
      })
    })

    test('returns 200 when the progress report is not found', async () => {
      mockedProgressReportsService.getProgressReportForUserSession.mockRejectedValueOnce(
        new ProgressReportNotFoundError()
      )

      const response = await sendGet(
        `/api/progress-reports/sessions/${getUuid}`
      )
      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/progress-reports/subjects/:subject', () => {
    test('returns paginated progress reports for a subject', async () => {
      const result = buildProgressReportsPaginatedResult()
      mockedProgressReportsService.getProgressReportsForSubjectPaginated.mockResolvedValueOnce(
        result
      )
      const pageNum = 1

      const response = await sendGet(
        `/api/progress-reports/subjects/${subject}?page=${pageNum}`
      )
      expect(response.status).toBe(200)
      expect(
        mockedProgressReportsService.getProgressReportsForSubjectPaginated
      ).toHaveBeenCalledWith(mockUser.id, subject, 1)
      expect(response.body).toEqual({
        ...result,
        sessions: [
          {
            ...result.sessions[0],
            createdAt: result.sessions[0].createdAt.toISOString(),
          },
        ],
      })
    })
  })

  describe('GET /api/progress-reports/summaries/:subject', () => {
    test('returns progress report summaries for a subject', async () => {
      const summaries = [buildProgressReportSummary()]
      mockedProgressReportsService.getProgressReportSummariesBySubject.mockResolvedValueOnce(
        summaries
      )

      const response = await sendGet(
        `/api/progress-reports/summaries/${subject}`
      )

      expect(response.status).toBe(200)
      expect(
        mockedProgressReportsService.getProgressReportSummariesBySubject
      ).toHaveBeenCalledWith(mockUser.id, subject)
      expect(response.body).toEqual([
        {
          ...summaries[0],
          createdAt: summaries[0].createdAt.toISOString(),
          sessionCreatedAt: summaries[0].sessionCreatedAt.toISOString(),
        },
      ])
    })
  })

  describe('GET /api/progress-reports/summaries/:subject/latest', () => {
    test('returns the latest progress report summary for a subject', async () => {
      const report = buildProgressReport()
      mockedProgressReportsService.getLatestProgressReportSummaryBySubject.mockResolvedValueOnce(
        report
      )

      const response = await sendGet(
        `/api/progress-reports/summaries/${subject}/latest`
      )
      expect(response.status).toBe(200)
      expect(
        mockedProgressReportsService.getLatestProgressReportSummaryBySubject
      ).toHaveBeenCalledWith(mockUser.id, subject)
      expect(response.body).toEqual({
        ...report,
        concepts: [
          {
            ...report.concepts[0],
            createdAt: report.concepts[0].createdAt.toISOString(),
          },
        ],
        summary: {
          ...report.summary,
          createdAt: report.summary.createdAt.toISOString(),
          sessionCreatedAt: report.summary.sessionCreatedAt.toISOString(),
        },
        createdAt: report.createdAt.toISOString(),
      })
    })

    test('returns 200 when the latest summary is not found', async () => {
      mockedProgressReportsService.getLatestProgressReportSummaryBySubject.mockRejectedValueOnce(
        new ProgressReportNotFoundError()
      )

      const response = await sendGet(
        `/api/progress-reports/summaries/${subject}/latest`
      )
      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/progress-reports/read', () => {
    test('marks reports as read', async () => {
      const reportIds = [getUuid(), getUuid()]
      mockedProgressReportsService.readProgressReportsByIds.mockResolvedValueOnce()

      const response = await sendPost('/api/progress-reports/read', {
        reportIds,
      })
      expect(response.status).toBe(200)
      expect(
        mockedProgressReportsService.readProgressReportsByIds
      ).toHaveBeenCalledWith(reportIds)
    })
  })

  describe('GET /api/progress-reports/overview/stats', () => {
    test('returns overview subject stats', async () => {
      const stats = buildProgressReportOverviewSubjectStats()
      mockedProgressReportsService.getProgressReportOverviewSubjectStats.mockResolvedValueOnce(
        [stats]
      )

      const response = await sendGet('/api/progress-reports/overview/stats')
      expect(response.status).toBe(200)
      expect(
        mockedProgressReportsService.getProgressReportOverviewSubjectStats
      ).toHaveBeenCalledWith(mockUser.id)
      expect(response.body).toEqual([
        {
          ...stats,
          latestReportCreatedAt: stats.latestReportCreatedAt.toISOString(),
        },
      ])
    })
  })

  describe('GET /api/progress-reports/overview/latest/subject', () => {
    test('returns the latest overview subject', async () => {
      mockedProgressReportsService.getLatestProgressReportOverviewSubject.mockResolvedValueOnce(
        subject
      )
      const response = await sendGet(
        '/api/progress-reports/overview/latest/subject'
      )
      expect(response.status).toBe(200)
      expect(
        mockedProgressReportsService.getLatestProgressReportOverviewSubject
      ).toHaveBeenCalledWith(mockUser.id)
      expect(response.body).toEqual(subject)
    })
  })
})
