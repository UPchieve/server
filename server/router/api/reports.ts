import expressWs from '@small-tech/express-ws'
import { authPassport } from '../../utils/auth-utils'
import * as ReportService from '../../services/ReportService'
import { Request, Response, NextFunction } from 'express'


export function routeReports(router: expressWs.Router): void {
  router.get('/reports/session-report', authPassport.isAdmin, async function(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const sessions = await ReportService.sessionReport(req.query)
      res.json({ sessions })
    } catch (error) {
      next(error)
    }
  })

  router.get('/reports/usage-report', authPassport.isAdmin, async function(
    req: Request,
    res: Response,
    next: NextFunction
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
    async function(req: Request, res: Response, next: NextFunction) {
      try {
        const data = await ReportService.getTelecomReport(req.query.partnerOrg, req.query.startDate, req.query.endDate)
        res.json({ data })
      } catch (error) {
        next(error)
      }
    }
  )

  router.get(
    '/reports/partner-analytics-report',
    authPassport.isAdmin,
    async function(req: Request, res: Response, next: NextFunction) {
      try {
        const data = await ReportService.generatePartnerAnalyticsReport(
          req.query.partnerOrg, req.query.startDate, req.query.endDate
        )
        res.json(data)
      } catch (error) {
        next(error)
      }
    }
  )
}
