import { Job } from 'bull'
import 'moment-timezone'
import logger from '../../logger'
import { getStudentIdsForGradeLevelSgUpdate } from '../../models/Student'
import {
  createContact,
  checkContactJobStatus,
} from '../../services/MailService'
import { backOff } from 'exponential-backoff'
import { AxiosError } from 'axios'

async function pollContactJobStatus(
  jobName: string,
  jobId: string,
  startBatchSize: number,
  endBatchSize: number
): Promise<void> {
  await backOff(
    async () => {
      const status = await checkContactJobStatus(jobId)
      const batchSize = `batch size ${startBatchSize} to ${endBatchSize}`

      if (status.status === 'completed')
        logger.info(
          `${jobName} - SendGrid job ${jobId} completed successfully for ${batchSize}`
        )
      else if (
        status.status === 'failed' ||
        (status.errors && status.errors.length > 0)
      )
        throw new Error(
          `${jobName} - SendGrid job ${jobId} failed with errors for ${batchSize}: ${JSON.stringify(
            status.errors
          )}`
        )
      else
        throw new Error(
          `${jobName} - SendGrid job ${jobId} is still processing for ${batchSize}.`
        )
    },
    {
      delayFirstAttempt: true,
      jitter: 'full',
      startingDelay: 1000 * 60,
      maxDelay: 1000 * 60,
      numOfAttempts: 20,
      retry: (error: Error, attemptNumber: number) => {
        logger.info(
          `${jobName} - Checking SendGrid job status ${jobId} on attempt ${attemptNumber}`
        )
        return true
      },
    }
  )
}

export default async (job: Job<undefined>): Promise<void> => {
  const errors: string[] = []
  const BATCH_SIZE = 5000
  const studentIds = await getStudentIdsForGradeLevelSgUpdate()
  let totalUpdated = 0

  for (let i = 0; i < studentIds.length; i += BATCH_SIZE) {
    const batch = studentIds.slice(i, i + BATCH_SIZE)

    try {
      const jobId = await backOff(() => createContact(batch), {
        jitter: 'full',
        maxDelay: 1000 * 60,
        numOfAttempts: 5,
        retry: (error: AxiosError, attemptNumber: number) => {
          if (error.response && error.response.status === 429) {
            logger.warn(
              `${job.name} - Rate limit exceeded on attempt ${attemptNumber}. Retrying...`
            )
            // Retry if rate-limit error
            return true
          }
          // Do not retry if error is not related to rate-limit
          return false
        },
      })

      // Ensure the batch contact update with SendGrid actually succeeds
      await pollContactJobStatus(job.name, jobId, i, i + BATCH_SIZE)
      totalUpdated += batch.length
    } catch (error) {
      errors.push(
        `${job.name} - Failed to process batch ${i} + ${i + BATCH_SIZE}: ${error}\n`
      )
    }
  }

  logger.info(`Successfully ${job.name} for ${totalUpdated} students`)
  if (errors.length) {
    throw new Error(`Failed to ${job.name} for students:\n${errors}`)
  }
}
