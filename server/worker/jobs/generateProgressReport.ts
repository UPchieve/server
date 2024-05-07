import { Job } from 'bull'
import { getSessionById } from '../../models/Session'
import { Ulid } from '../../models/pgUtils'
import {
  generateProgressReportForUser,
  hasActiveSubjectPrompt,
  ProgressReport,
  ProgressReportSessionFilter,
} from '../../services/ProgressReportsService'
import { getProgressReportsFeatureFlag } from '../../services/FeatureFlagService'
import config from '../../config'
import axios from 'axios'
import {
  ProgressReportAnalysisTypes,
  ProgressReportStatuses,
} from '../../models/ProgressReports'
import logger from '../../logger'
import { asUlid } from '../../utils/type-utils'

interface GenerateProgressReport {
  sessionId: Ulid
}

type ProgressReportPayload = {
  userId: Ulid
  sessionId?: Ulid
  subject: string
  report: Partial<ProgressReport>
  analysisType: ProgressReportAnalysisTypes
}

async function sendProgressReport(userId: Ulid, data: ProgressReportPayload) {
  const protocol = config.NODE_ENV === 'dev' ? 'http' : 'https'
  const port = config.NODE_ENV === 'dev' ? `:${config.apiPort}` : ''
  const url = `${protocol}://${config.clusterServerAddress}${port}/api/webhooks/progress-reports/processed`
  try {
    await axios.post(url, data, {
      headers: {
        'x-api-key': config.subwayApiCredentials,
      },
    })
  } catch (error) {
    const errorMessage = `Failed to send progress report via HTTP to user ${userId} error ${error}`
    logger.error(errorMessage)
    throw new Error(errorMessage)
  }
}

async function generateAndEmitProgressReport(
  userId: Ulid,
  reportOptions: ProgressReportSessionFilter
) {
  let report: Partial<ProgressReport>
  let reportGenerationError
  try {
    report = await generateProgressReportForUser(userId, reportOptions)
  } catch (error) {
    reportGenerationError = error
    logger.error(`Error generating progress report: ${error}`)
    report = {
      status: 'error' as ProgressReportStatuses,
      summary: undefined,
      concepts: undefined,
    }
  }

  const data = {
    userId: userId,
    ...reportOptions,
    report,
  }
  await sendProgressReport(userId, data)
  if (reportGenerationError) throw reportGenerationError
}

export default async (job: Job<GenerateProgressReport>): Promise<void> => {
  const sessionId = asUlid(job.data.sessionId)
  const session = await getSessionById(sessionId)
  const isSubjectPromptActive = await hasActiveSubjectPrompt(session.subject)
  const isProgressReportsActive = await getProgressReportsFeatureFlag(
    session.studentId
  )
  if (
    !isSubjectPromptActive ||
    !isProgressReportsActive ||
    session.timeTutored < config.minSessionLength
  )
    return
  const tasks = [
    generateAndEmitProgressReport(session.studentId, {
      sessionId: session.id,
      subject: session.subject,
      analysisType: 'single',
    }),
    generateAndEmitProgressReport(session.studentId, {
      subject: session.subject,
      end: session.endedAt,
      analysisType: 'group',
    }),
  ]

  // Execute both generation tasks in parallel
  const results = await Promise.allSettled(tasks)
  const errors = results
    .filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    )
    .map(
      (result, i) =>
        `Error in ${i === 0 ? 'single' : 'group'} session report: ${
          result.reason
        }`
    )

  if (errors.length) {
    throw new Error(errors.join('\n'))
  }
}
