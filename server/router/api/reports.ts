import expressWs from '@small-tech/express-ws'

const { authPassport } = require('../../utils/auth-utils')
const ReportService = require('../../services/ReportService')

export function routeReports(router: expressWs.Router): void {
  router.get('/reports/session-report', authPassport.isAdmin, async function(
    req,
    res,
    next
  ) {
    try {
      const sessions = await ReportService.sessionReport(req.query)
      res.json({ sessions })
    } catch (error) {
      next(error)
    }
  })

  router.get('/reports/usage-report', authPassport.isAdmin, async function(
    req,
    res,
    next
  ) {
    try {
      const students = await ReportService.usageReport(req.query)
      res.json({ students })
    } catch (error) {
      next(error)
    }
  })

  router.get(
    '/reports/volunteer-telecom-report',
    authPassport.isAdmin,
    async function(req, res, next) {
      try {
        const data = await ReportService.getTelecomReport(req.query)
        res.json({ data })
      } catch (error) {
        next(error)
      }
    }
  )

  router.get(
    '/reports/partner-analytics-report',
    authPassport.isAdmin,
    async function(req, res, next) {
      try {
        const data = await ReportService.generatePartnerAnalyticsReport(
          req.query
        )
        res.json(data)
      } catch (error) {
        next(error)
      }
    }
  )
}
