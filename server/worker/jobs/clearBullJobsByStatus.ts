import { Job, JobStatusClean } from 'bull'
import * as QueueService from '../../services/QueueService'
import logger from '../../logger'
import { hoursInMs } from '../../utils/time-utils'

export type BullJobStatus = {
  statuses: JobStatusClean[]
  timeOffsetInMs?: number
  limit?: number
}

export async function clearBullJobByStatus(job: Job<BullJobStatus>) {
  const gracePeriod =
    job.data.timeOffsetInMs != undefined
      ? job.data.timeOffsetInMs
      : hoursInMs(24)

  for (const jobStatus of job.data.statuses) {
    try {
      const removedJobs =
        job.data.limit != undefined
          ? await QueueService.queue.clean(
              gracePeriod,
              jobStatus,
              job.data.limit
            )
          : await QueueService.queue.clean(gracePeriod, jobStatus)
      logger.info(`Removed ${removedJobs.length} ${jobStatus} Bull jobs`)
    } catch (error) {
      logger.error(
        error,
        `An error occured while removing ${jobStatus} Bull jobs`
      )
    }
  }
}
