import { Job } from 'bull'
import { getSessionById } from '../../models/Session'
import { Ulid } from '../../models/pgUtils'
import {
  generateProgressReportForUser,
  hasActiveSubjectPrompt,
} from '../../services/ProgressReportsService'
import { getStemProgressReportEnabled } from '../../services/FeatureFlagService'
import config from '../../config'
import { ProgressReportAnalysisTypes } from '../../models/ProgressReports'
import logger from '../../logger'
import { asUlid } from '../../utils/type-utils'
import { isSubjectUsingDocumentEditor } from '../../utils/session-utils'

interface GenerateProgressReport {
  sessionId: Ulid
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
      logger.info('STEM Progress Report processing not enabled for user', {
        isStemProgressReportEnabled,
        sessionId,
        subject: session.subject,
        userId: session.studentId,
      })
      return
    }
  }

  if (!isSubjectPromptActive || session.timeTutored < config.minSessionLength) {
    logger.info("Couldn't generate progress report for session or subject", {
      sessionId,
      subject: session.subject,
      isSubjectPromptActive,
    })
    return
  }

  await generateProgressReportForUser(session.studentId, {
    sessionId: session.id,
    subject: session.subject,
    analysisType: 'single',
  })

  await generateProgressReportForUser(session.studentId, {
    subject: session.subject,
    end: session.endedAt,
    analysisType: 'group',
  })
}
