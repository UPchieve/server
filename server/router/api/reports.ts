const expressWs: any = require('@small-tech/express-ws')
import { authPassport } from '../../utils/auth-utils'
import * as ReportService from '../../services/ReportService'
import { Request, Response, NextFunction, Router } from 'express'


export function routeReports(router: Router): void {
  router.get('/reports/session-report', authPassport.isAdmin, async function(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const sessions = await ReportService.sessionReport(
        new Date(req.query.sessionRangeFrom as string),
        new Date(req.query.sessionRangeTo as string),
        req.query.highSchooId as string,
        req.query.studentPartnerOrg as string,
        req.query.studentPartnerSite as string
      )
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
      const students = await ReportService.usageReport(
        parseInt(req.query.joinedBefore as string),
        parseInt(req.query.joinedAfter as string),
        parseInt(req.query.sessionRangeFrom as string),
        parseInt(req.query.sessionRangeTo as string),
        req.query.highSchoolId as string,
        req.query.studentPartnerOrg as string,
        req.query.studentPartnerSite as string
      )
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
        const data = await ReportService.getTelecomReport(
          req.query.partnerOrg as string,
          req.query.startDate as string,
          req.query.endDate as string
        )
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
          req.query.partnerOrg as string,
          req.query.startDate as string,
          req.query.endDate as string
        )
        res.json(data)
      } catch (error) {
        next(error)
      }
    }
  )
}
