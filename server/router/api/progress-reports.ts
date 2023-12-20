import { getProgressReportForUserSession } from '../../services/ProgressReportsService'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import { Router } from 'express'
import { asUlid } from '../../utils/type-utils'
import { ProgressReportNotFoundError } from '../../services/Errors'

export function routeProgressReports(router: Router): void {
  router.get('/progress-reports/sessions/:sessionId', async function(req, res) {
    try {
      const user = extractUser(req)
      const sessionId = asUlid(req.params.sessionId)
      const report = await getProgressReportForUserSession(user.id, sessionId)
      res.json(report)
    } catch (err) {
      if (err instanceof ProgressReportNotFoundError) res.sendStatus(200)
      else resError(res, err)
    }
  })
}
