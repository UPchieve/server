import { Job } from 'bull'
import { getSessionById } from '../../models/Session'
import { Ulid } from '../../models/pgUtils'
import {
  generateProgressReportForUser,
  hasActiveSubjectPrompt,
  ProgressReport,
  ProgressReportSessionFilter,
} from '../../services/ProgressReportsService'
import {
  getStemProgressReportEnabled,
  getProgressReportsFeatureFlag,
} from '../../services/FeatureFlagService'
import config from '../../config'
import axios from 'axios'
import { ProgressReportAnalysisTypes } from '../../models/ProgressReports'
import logger from '../../logger'
import { asUlid } from '../../utils/type-utils'
import { secondsInMs } from '../../utils/time-utils'
import { isSubjectUsingDocumentEditor } from '../../utils/session-utils'

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
      timeout: secondsInMs(3),
    })
  } catch (error) {
    logger.warn(
      { err: error, userId },
      'Failed to send progress report via HTTP to user.'
    )
    throw error
  }
}

async function generateAndEmitProgressReport(
  userId: Ulid,
  reportOptions: ProgressReportSessionFilter
) {
  const report = await generateProgressReportForUser(userId, reportOptions)

  if (report) {
    await sendProgressReport(userId, {
      userId: userId,
      ...reportOptions,
      report,
    })
  }
}

export default async (job: Job<GenerateProgressReport>): Promise<void> => {
  const sessionId = asUlid(job.data.sessionId)
  const session = await getSessionById(sessionId)
  const isSubjectPromptActive = await hasActiveSubjectPrompt(session.subject)
  // We want to slowly rollout progress report processing on subjects that use a whiteboard
  if (
    isSubjectPromptActive &&
    !isSubjectUsingDocumentEditor(session.toolType)
  ) {
    const isStemProgressReportEnabled = await getStemProgressReportEnabled(
      session.studentId
    )
    if (!isStemProgressReportEnabled) {
      logger.info(
        {
          isStemProgressReportEnabled,
          sessionId,
          subject: session.subject,
          userId: session.studentId,
        },
        'STEM Progress Report processing not enabled for user'
      )
      return
    }
  }

  const isProgressReportsActive = await getProgressReportsFeatureFlag(
    session.studentId
  )
  if (
    !isSubjectPromptActive ||
    !isProgressReportsActive ||
    session.timeTutored < config.minSessionLength
  ) {
    logger.info(
      {
        sessionId,
        subject: session.subject,
        isSubjectPromptActive,
        isProgressReportsActive,
      },
      "Couldn't generate progress report for session or subject"
    )
    return
  }

  await generateProgressReportForUser(session.studentId, {
    sessionId: session.id,
    subject: session.subject,
    analysisType: 'single',
  })

  await generateAndEmitProgressReport(session.studentId, {
    subject: session.subject,
    end: session.endedAt,
    analysisType: 'group',
  })
}
