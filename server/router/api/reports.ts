import expressWs from 'express-ws'
import { resError } from '../res-error'

import { authPassport } from '../../utils/auth-utils'
import * as ReportService from '../../services/ReportService'
import type { Response } from 'express'
import type {
  SessionReportResponse,
  UsageReportResponse,
} from '../../contracts/reports'
import {
  toSessionReportPublic,
  toTelecomReport,
  toUsageReportPublic,
} from '../../public/reports'

export function routeReports(router: expressWs.Router): void {
  router.get(
    '/reports/session-report',
    authPassport.isAdmin,
    async function (req, res: Response<SessionReportResponse>) {
      try {
        const sessions = await ReportService.sessionReport(req.query as unknown)
        res.json({ sessions: sessions.map(toSessionReportPublic) })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.get(
    '/reports/usage-report',
    authPassport.isAdmin,
    async function (req, res: Response<UsageReportResponse>) {
      try {
        req.clearTimeout()
        const students = await ReportService.usageReport(req.query as unknown)
        res.json({ students: students.map(toUsageReportPublic) })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.get(
    '/reports/volunteer-telecom-report',
    authPassport.isAdmin,
    async function (req, res) {
      try {
        const data = await ReportService.getTelecomReport(req.query as unknown)
        res.json({ data: data.map(toTelecomReport) })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.get(
    '/reports/partner-analytics-report',
    authPassport.isAdmin,
    async function (req, res: Response<void>) {
      try {
        req.clearTimeout()
        const reportFilePath = await ReportService.getAnalyticsReport(
          req.query as unknown
        )
        res.status(201).download(reportFilePath)
        await ReportService.deleteReport(reportFilePath)
      } catch (error) {
        resError(res, error)
      }
    }
  )
}
