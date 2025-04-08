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

type ProcessSessionEndedJobData = {
  sessionId: Uuid
}

export default async (job: Job<ProcessSessionEndedJobData>): Promise<void> => {
  const sessionId = asString(job.data.sessionId)

  try {
    await processSessionMetrics(sessionId)
    await processSessionReported(sessionId)
    await processSessionEditors(sessionId)
    await processSessionTranscript(sessionId)
    await processCalculateMetrics(sessionId)
    await processEmailVolunteer(sessionId)
    await processFirstSessionCongratsEmail(sessionId)
    await queueGenerateProgressReportForUser(sessionId)
    await queueFallIncentiveSessionQualificationJob(sessionId)
  } catch (error) {
    throw new Error(
      `Failed to complete ${Jobs.ProcessSessionEnded} for session ${sessionId}: ${error}`
    )
  }
}
