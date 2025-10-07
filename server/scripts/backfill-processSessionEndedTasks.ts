import { Job } from 'bull'
import logger from '../logger'
import QueueService from '../services/QueueService'
import { Jobs } from '../worker/jobs'
import { minutesInMs } from '../utils/time-utils'

type BackFillProcessSessionEndedData = {
  sessionIds: string[]
}

export default async function (jobData: Job<BackFillProcessSessionEndedData>) {
  for (const sessionId of jobData.data.sessionIds) {
    QueueService.add(
      Jobs.ProcessSessionEnded,
      {
        sessionId,
      },
      { removeOnComplete: false, removeOnFail: false, delay: minutesInMs(3) }
    )
    logger.info(`Queued ${sessionId} for session end tasks`)
  }
}
