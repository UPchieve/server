import { Job } from 'bull'
import { getSessionById } from '../../models/Session'
import { Ulid } from '../../models/pgUtils'
import {
  generateProgressReportForUser,
  hasActiveSubjectPrompt,
  ProgressReportSessionFilter,
} from '../../services/ProgressReportsService'
import { getProgressReportsFeatureFlag } from '../../services/FeatureFlagService'
import config from '../../config'
import { asUlid } from '../../utils/type-utils'

interface GenerateProgressReport {
  sessionId: Ulid
}

async function generateAndEmitProgressReport(
  userId: Ulid,
  reportOptions: ProgressReportSessionFilter
) {
  return await generateProgressReportForUser(userId, reportOptions)
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

  // Execute both generation tasks in parallel
  const results = await Promise.allSettled([
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
  ])
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
