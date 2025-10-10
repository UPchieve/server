import { Job } from 'bull'
import logger from '../logger'
import QueueService from '../services/QueueService'
import { Jobs } from '../worker/jobs'
import { minutesInMs } from '../utils/time-utils'

type BackFillSessionEndedData = {
  sessionIds: string[]
}

export default async function (jobData: Job<BackFillSessionEndedData>) {
  for (let idx = 0; idx < jobData.data.sessionIds.length; idx++) {
    const sessionId = jobData.data.sessionIds[idx]
    await QueueService.add(
      Jobs.ProcessSessionEnded,
      {
        sessionId,
      },
      {
        removeOnComplete: false,
        removeOnFail: false,
        delay: minutesInMs((idx % 5) + 3),
        priority: 3,
      }
    )
    logger.info(`Queued ${sessionId} for session end tasks`)
  }
}
