import { generateProgressReportForUser } from '../../services/ProgressReportsService'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import { Router } from 'express'

export function routeProgressReports(router: Router): void {
  router.get('/progress-reports/generate', async function(req, res) {
    try {
      const user = extractUser(req)
      // Force reading until we are passing in a subject from the client
      const analysis = await generateProgressReportForUser(user.id, {
        subject: 'reading',
      })
      res.json(analysis)
    } catch (err) {
      resError(res, err)
    }
  })
}
