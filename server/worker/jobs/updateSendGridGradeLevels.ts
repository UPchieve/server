import { Jobs } from '.'
import 'moment-timezone'
import { log } from '../logger'
import { getStudentIdsForGradeLevelSgUpdate } from '../../models/Student'
import {
  createContact,
  checkContactJobStatus,
} from '../../services/MailService'
import { backOff } from 'exponential-backoff'
import { AxiosError } from 'axios'

async function pollContactJobStatus(
  jobId: string,
  startBatchSize: number,
  endBatchSize: number
): Promise<void> {
  await backOff(
    async () => {
      const status = await checkContactJobStatus(jobId)
      const batchSize = `batch size ${startBatchSize} to ${endBatchSize}`

      if (status.status === 'completed')
        log(
          `${Jobs.UpdateSendGridGradeLevels} - SendGrid job ${jobId} completed successfully for ${batchSize}`
        )
      else if (
        status.status === 'failed' ||
        (status.errors && status.errors.length > 0)
      )
        throw new Error(
          `${
            Jobs.UpdateSendGridGradeLevels
          } - SendGrid job ${jobId} failed with errors for ${batchSize}: ${JSON.stringify(
            status.errors
          )}`
        )
      else
        throw new Error(
          `${Jobs.UpdateSendGridGradeLevels} - SendGrid job ${jobId} is still processing for ${batchSize}.`
        )
    },
    {
      delayFirstAttempt: true,
      jitter: 'full',
      startingDelay: 1000 * 60,
      maxDelay: 1000 * 60,
      numOfAttempts: 20,
      retry: (error: Error, attemptNumber: number) => {
        log(
          `${Jobs.UpdateSendGridGradeLevels} - Checking SendGrid job status ${jobId} on attempt ${attemptNumber}`
        )
        return true
      },
    }
  )
}

export default async (): Promise<void> => {
  const errors: string[] = []
  const BATCH_SIZE = 30000
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
            log(
              `${Jobs.UpdateSendGridGradeLevels} - Rate limit exceeded on attempt ${attemptNumber}. Retrying...`
            )
            // Retry if rate-limit error
            return true
          }
          // Do not retry if error is not related to rate-limit
          return false
        },
      })

      // Ensure the batch contact update with SendGrid actually succeeds
      await pollContactJobStatus(jobId, i, i + BATCH_SIZE)
      totalUpdated += batch.length
    } catch (error) {
      errors.push(
        `Failed to process batch starting with ${batch[0]}: ${error}\n`
      )
    }
  }

  log(
    `Successfully ${Jobs.UpdateSendGridGradeLevels} for ${totalUpdated} students`
  )
  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateSendGridGradeLevels} for students:\n${errors}`
    )
  }
}
