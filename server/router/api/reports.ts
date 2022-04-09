import expressWs from 'express-ws'
import { resError } from '../res-error'

import { authPassport } from '../../utils/auth-utils'
import * as ReportService from '../../services/ReportService'

export function routeReports(router: expressWs.Router): void {
  router.get('/reports/session-report', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const sessions = await ReportService.sessionReport(req.query as unknown)
      res.json({ sessions })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/reports/usage-report', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const students = await ReportService.usageReport(req.query as unknown)
      res.json({ students })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get(
    '/reports/volunteer-telecom-report',
    authPassport.isAdmin,
    async function(req, res) {
      try {
        const data = await ReportService.getTelecomReport(req.query as unknown)
        res.json({ data })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.get(
    '/reports/partner-analytics-report',
    authPassport.isAdmin,
    async function(req, res) {
      try {
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
