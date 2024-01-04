import {
  getLatestProgressReportSummaryBySubject,
  getProgressReportForUserSession,
  getProgressReportsForSubjectPaginated,
  getProgressReportSummariesBySubject,
  readProgressReportsByIds,
  getUnreadProgressReportOverviewSubjects,
} from '../../services/ProgressReportsService'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import { Router } from 'express'
import { asArray, asNumber, asString, asUlid } from '../../utils/type-utils'
import { ProgressReportNotFoundError } from '../../services/Errors'
import SocketService from '../../services/SocketService'

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

  router.get('/progress-reports/subjects/:subject', async function(req, res) {
    try {
      const user = extractUser(req)
      const subject = asString(req.params.subject)
      const page = asNumber(req.query.page)
      const result = await getProgressReportsForSubjectPaginated(
        user.id,
        subject,
        page
      )
      res.json(result)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/progress-reports/summaries/:subject', async function(req, res) {
    try {
      const user = extractUser(req)
      const subject = asString(req.params.subject)
      const summaries = await getProgressReportSummariesBySubject(
        user.id,
        subject
      )
      res.json(summaries)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/progress-reports/summaries/:subject/latest', async function(
    req,
    res
  ) {
    try {
      const user = extractUser(req)
      const subject = asString(req.params.subject)
      const summary = await getLatestProgressReportSummaryBySubject(
        user.id,
        subject
      )
      res.json(summary)
    } catch (err) {
      if (err instanceof ProgressReportNotFoundError) res.sendStatus(200)
      else resError(res, err)
    }
  })

  router.post('/progress-reports/read', async function(req, res) {
    try {
      const reportIds = asArray(asString)(req.body.reportIds)
      await readProgressReportsByIds(reportIds)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/progress-reports/unread', async function(req, res) {
    try {
      const user = extractUser(req)
      const subjects = await getUnreadProgressReportOverviewSubjects(user.id)
      res.json({ subjects })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/progress-reports/processed', async function(req, res) {
    try {
      const userId = asUlid(req.body.userId)
      const sessionId = asUlid(req.body.sessionId)
      const subject = asString(req.body.subject)
      const report = req.body.report
      if (!userId || !report) return
      const socketService = SocketService.getInstance()
      socketService.emitProgressReportProcessedToUser(userId, {
        sessionId,
        subject,
        report,
      })
    } catch (err) {
      resError(res, err)
    }
  })
}
