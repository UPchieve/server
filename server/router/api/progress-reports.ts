import {
  getLatestProgressReportSummaryBySubject,
  getProgressReportForUserSession,
  getProgressReportsForSubjectPaginated,
  getProgressReportSummariesBySubject,
  readProgressReportsByIds,
  getProgressReportOverviewSubjectStats,
  getLatestProgressReportOverviewSubject,
} from '../../services/ProgressReportsService'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import type { Response, Router } from 'express'
import { asArray, asNumber, asString, asUlid } from '../../utils/type-utils'
import { ProgressReportNotFoundError } from '../../services/Errors'
import {
  ProgressReportOverviewSubjectStatPublic,
  ProgressReportPublic,
  ProgressReportSessionPaginateResponse,
  ProgressReportSummaryPublic,
} from '../../contracts/progress-reports'
import {
  toProgressReportOverviewSubjectStatPublic,
  toProgressReportPublic,
  toProgressReportSessionPublic,
  toProgressReportSummaryPublic,
} from '../../public/progress-reports'

export function routeProgressReports(router: Router): void {
  router.get(
    '/progress-reports/sessions/:sessionId',
    async function (req, res: Response<ProgressReportPublic>) {
      try {
        const user = extractUser(req)
        const sessionId = asUlid(req.params.sessionId)
        const report = await getProgressReportForUserSession(user.id, sessionId)
        res.json(toProgressReportPublic(report))
      } catch (err) {
        if (err instanceof ProgressReportNotFoundError) res.sendStatus(200)
        else resError(res, err)
      }
    }
  )

  router.get(
    '/progress-reports/subjects/:subject',
    async function (req, res: Response<ProgressReportSessionPaginateResponse>) {
      try {
        const user = extractUser(req)
        const subject = asString(req.params.subject)
        const page = asNumber(req.query.page)
        const result = await getProgressReportsForSubjectPaginated(
          user.id,
          subject,
          page
        )
        res.json({
          sessions: result.sessions.map(toProgressReportSessionPublic),
          page: result.page,
          isLastPage: result.isLastPage,
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get(
    '/progress-reports/summaries/:subject',
    async function (req, res: Response<ProgressReportSummaryPublic[]>) {
      try {
        const user = extractUser(req)
        const subject = asString(req.params.subject)
        const summaries = await getProgressReportSummariesBySubject(
          user.id,
          subject
        )
        res.json(summaries.map(toProgressReportSummaryPublic))
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get(
    '/progress-reports/summaries/:subject/latest',
    async function (req, res: Response<ProgressReportPublic>) {
      try {
        const user = extractUser(req)
        const subject = asString(req.params.subject)
        const summary = await getLatestProgressReportSummaryBySubject(
          user.id,
          subject
        )
        res.json(toProgressReportPublic(summary))
      } catch (err) {
        if (err instanceof ProgressReportNotFoundError) res.sendStatus(200)
        else resError(res, err)
      }
    }
  )

  router.post(
    '/progress-reports/read',
    async function (req, res: Response<void>) {
      try {
        const reportIds = asArray(asString)(req.body.reportIds)
        await readProgressReportsByIds(reportIds)
        res.sendStatus(200)
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get(
    '/progress-reports/overview/stats',
    async function (
      req,
      res: Response<ProgressReportOverviewSubjectStatPublic[]>
    ) {
      try {
        const user = extractUser(req)
        const result = await getProgressReportOverviewSubjectStats(user.id)
        res.json(result.map(toProgressReportOverviewSubjectStatPublic))
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get(
    '/progress-reports/overview/latest/subject',
    async function (req, res: Response<string | undefined>) {
      try {
        const user = extractUser(req)
        const subject = await getLatestProgressReportOverviewSubject(user.id)
        res.json(subject)
      } catch (err) {
        resError(res, err)
      }
    }
  )
}
