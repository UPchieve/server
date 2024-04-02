import { resError } from '../res-error'
import { Router } from 'express'
import { asString, asUlid } from '../../utils/type-utils'
import SocketService from '../../services/SocketService'
import { authPassport } from '../../utils/auth-utils'
import { ProgressReportAnalysisTypes } from '../../models/ProgressReports'

export function routeWebhooks(router: Router): void {
  router.post(
    '/webhooks/progress-reports/processed',
    authPassport.isWorker,
    async function(req, res) {
      try {
        const userId = asUlid(req.body.userId)
        const sessionId = asUlid(req.body.sessionId)
        const subject = asString(req.body.subject)
        const analysisType = asString(
          req.body.analysisType
        ) as ProgressReportAnalysisTypes
        const report = req.body.report
        if (!userId || !report) return res.sendStatus(400)
        const socketService = SocketService.getInstance()
        socketService.emitProgressReportProcessedToUser(userId, {
          sessionId,
          subject,
          report,
          analysisType,
        })
        return res.sendStatus(200)
      } catch (err) {
        resError(res, err)
      }
    }
  )
}
