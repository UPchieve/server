import { Job } from 'bull'
import { Jobs } from '.'
import { Uuid } from '../../models/pgUtils'
import { queueGenerateProgressReportForUser } from '../../services/ProgressReportsService'
import { queueFallIncentiveSessionQualificationJob } from '../../services/IncentiveProgramService'
import { processSessionMetrics } from '../../services/SessionFlagsService'
import {
  processCalculateMetrics,
  processEmailVolunteer,
  processFirstSessionCongratsEmail,
  processSessionEditors,
  processSessionReported,
  processSessionTranscript,
} from '../../services/SessionService'
import { asString } from '../../utils/type-utils'
import { queueGenerateSessionSummaryForSession } from '../../services/SessionSummariesService'

type ProcessSessionEndedJobData = {
  sessionId: Uuid
}

export default async (job: Job<ProcessSessionEndedJobData>): Promise<void> => {
  const sessionId = asString(job.data.sessionId)

  try {
    await processSessionMetrics(sessionId)
    await processCalculateMetrics(sessionId)
    await processSessionEditors(sessionId)

    // Dependent on metrics being calculated first
    await Promise.all([
      queueGenerateSessionSummaryForSession(sessionId),
      processEmailVolunteer(sessionId),
      processFirstSessionCongratsEmail(sessionId),
      queueFallIncentiveSessionQualificationJob(sessionId),
      queueGenerateProgressReportForUser(sessionId),
    ])

    await Promise.all([
      processSessionReported(sessionId),
      processSessionTranscript(sessionId),
    ])
  } catch (error) {
    throw new Error(
      `Failed to complete ${Jobs.ProcessSessionEnded} for session ${sessionId}: ${error}`
    )
  }
}
