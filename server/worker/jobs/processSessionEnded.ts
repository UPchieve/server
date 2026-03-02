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
import logger from '../../logger'

type ProcessSessionEndedJobData = {
  sessionId: Uuid
}

const METRIC_TASKS = [
  queueGenerateSessionSummaryForSession,
  processEmailVolunteer,
  processFirstSessionCongratsEmail,
  queueFallIncentiveSessionQualificationJob,
  queueGenerateProgressReportForUser,
]

const AFTER_METRIC_TASK = [processSessionReported, processSessionTranscript]

export default async (job: Job<ProcessSessionEndedJobData>): Promise<void> => {
  const sessionId = asString(job.data.sessionId)

  try {
    await processSessionMetrics(sessionId)
    await processCalculateMetrics(sessionId)
    await processSessionEditors(sessionId)

    // Dependent on metrics being calculated first
    for (const task of METRIC_TASKS) {
      logger.info(`Starting metric task ${task.name}`)
      await task(sessionId)
      logger.info(`Finished metric task ${task.name}`)
    }

    for (const afterMetricTask of AFTER_METRIC_TASK) {
      logger.info(`Starting after metric task ${afterMetricTask.name}`)
      await afterMetricTask(sessionId)
      logger.info(`Finished after metric task ${afterMetricTask.name}`)
    }
  } catch (error) {
    logger.error(error)
    throw new Error(
      `Failed to complete ${Jobs.ProcessSessionEnded} for session ${sessionId}: ${error}`
    )
  }
}
