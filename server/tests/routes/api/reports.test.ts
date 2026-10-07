import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockRouter } from '../../mock-app'
import { routeReports } from '../../../router/api/reports'
import * as ReportService from '../../../services/ReportService'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import {
  buildSessionReportPublic,
  buildSessionReportRow,
  buildTelecomReportRow,
  buildUsageReportRow,
  buildUsageReportRowPublic,
} from '../../mocks/generate'

function isAdmin(
  _req: ExpressRequest<string, unknown>,
  _res: ExpressResponse,
  next: () => void
): void {
  next()
}

jest.mock('../../../utils/auth-utils', () => ({
  authPassport: {
    isAdmin,
  },
}))

jest.mock('../../../services/ReportService')

const mockedReportService = mocked(ReportService)

const router = mockRouter()
routeReports(router)

const app = mockApp()
app.use(function (req: ExpressRequest, _res, next) {
  req.clearTimeout = function () {}
  next()
})
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

const start = '2026-01-01'
const end = '2026-01-31'

describe('routeReports', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /api/reports/session-report', () => {
    test.each([
      ['2026-01-02T02:30:00.000Z', '1/1/2026 9:30 pm'],
      ['2026-07-02T02:30:00.000Z', '7/1/2026 10:30 pm'],
    ])(
      'formats session dates in Eastern time for %s',
      async (timestamp, expected) => {
        const date = new Date(timestamp)
        mockedReportService.sessionReport.mockResolvedValueOnce([
          buildSessionReportRow({
            createdAt: date,
            volunteerJoinedAt: date,
            endedAt: date,
            partnerSite: 'Example site',
          }),
        ])
        const response = await sendGet('/api/reports/session-report')
        expect(response.status).toBe(200)
        expect(response.body.sessions[0]).toMatchObject({
          'Created at': expected,
          'Volunteer join date': expected,
          'Ended at': expected,
          'Partner site': 'Example site',
        })
        expect(response.body.sessions[0]).not.toHaveProperty('Partner Site')
      }
    )

    test('returns session report data', async () => {
      const sessions = [buildSessionReportRow()]
      const sessionReportPublic = sessions.map(buildSessionReportPublic)
      mockedReportService.sessionReport.mockResolvedValueOnce(sessions)

      const response = await sendGet(
        `/api/reports/session-report?start=${start}&end=${end}`
      )
      expect(response.status).toBe(200)
      expect(mockedReportService.sessionReport).toHaveBeenCalledWith({
        start,
        end,
      })
      expect(response.body).toEqual({
        sessions: sessionReportPublic,
      })
    })
  })

  describe('GET /api/reports/usage-report', () => {
    test('formats the usage join date in Eastern time', async () => {
      mockedReportService.usageReport.mockResolvedValueOnce([
        buildUsageReportRow({ joinDate: new Date('2026-01-02T02:30:00.000Z') }),
      ])
      const response = await sendGet('/api/reports/usage-report')
      expect(response.status).toBe(200)
      expect(response.body.students[0]['Join date']).toBe('1/1/2026 9:30 pm')
    })

    test('returns usage report data', async () => {
      const usageReport = [buildUsageReportRow()]
      const usageReportPublic = usageReport.map(buildUsageReportRowPublic)
      mockedReportService.usageReport.mockResolvedValueOnce(usageReport)

      const response = await sendGet(
        `/api/reports/usage-report?start=${start}&end=${end}`
      )
      expect(response.status).toBe(200)
      expect(mockedReportService.usageReport).toHaveBeenCalledWith({
        start,
        end,
      })
      expect(response.body).toEqual({
        students: usageReportPublic,
      })
    })
  })

  describe('GET /api/reports/volunteer-telecom-report', () => {
    test('returns telecom report data', async () => {
      const data = [buildTelecomReportRow()]
      mockedReportService.getTelecomReport.mockResolvedValueOnce(data)

      const response = await sendGet(
        `/api/reports/volunteer-telecom-report?start=${start}&end=${end}`
      )
      expect(response.status).toBe(200)
      expect(mockedReportService.getTelecomReport).toHaveBeenCalledWith({
        start,
        end,
      })
      expect(response.body).toEqual({ data })
    })
  })

  describe('GET /api/reports/partner-analytics-report', () => {
    test('downloads the analytics report and then deletes it', async () => {
      const reportFilePath = '/analytics-report.xlsx'
      const partnerOrg = 'example'
      mockedReportService.getAnalyticsReport.mockResolvedValueOnce(
        reportFilePath
      )
      mockedReportService.deleteReport.mockResolvedValueOnce()

      await sendGet(
        `/api/reports/partner-analytics-report?partnerOrg=${partnerOrg}`
      )
      expect(mockedReportService.getAnalyticsReport).toHaveBeenCalledWith({
        partnerOrg,
      })
      expect(mockedReportService.deleteReport).toHaveBeenCalledWith(
        reportFilePath
      )
    })
  })
})
