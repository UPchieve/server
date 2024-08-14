import { Jobs } from '.'
import 'moment-timezone'
import { log } from '../logger'
import { getStudentsForGradeLevelSgUpdate } from '../../models/Student'
import { createContact } from '../../services/MailService'
import { backOff } from 'exponential-backoff'
import { AxiosError } from 'axios'

const REQUEST_RATE_LIMIT_PER_MINUTE = 600
const REQUEST_DELAY = 60000 / REQUEST_RATE_LIMIT_PER_MINUTE
const BATCH_SIZE = 100

export default async (): Promise<void> => {
  const errors: string[] = []
  let totalUpdated = 0
  // We only want to update the SendGrid custom fields for students
  // who have moved up a grade level. We are excluding students who
  // have recently created an account, as their contact information
  // in SendGrid is already up to date.
  const students = await getStudentsForGradeLevelSgUpdate()

  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const batch = students.slice(i, i + BATCH_SIZE)
    for (const student of batch) {
      try {
        // Handle request retries if we reach rate limits
        await backOff(() => createContact(student.userId), {
          delayFirstAttempt: true,
          jitter: 'full',
          startingDelay: REQUEST_DELAY,
          maxDelay: 60000,
          numOfAttempts: 5,
          retry: (error: AxiosError, attemptNumber: number) => {
            if (error.response && error.response.status === 429) {
              log(
                `${Jobs.UpdateSendGridFields} - Rate limit exceeded on attempt ${attemptNumber}. Retrying...`
              )
              // Retry if rate-limit error
              return true
            }
            // Do not retry if error is not related to rate-limit
            return false
          },
        })

        totalUpdated++
      } catch (error) {
        errors.push(
          `${student.userId}: Attempted to update custom fields in SendGrid: ${student.userId} with error: ${error}\n`
        )
      }
    }
  }

  log(`Successfully ${Jobs.UpdateSendGridFields} for ${totalUpdated} students`)
  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateSendGridFields} for students:\n${errors}`
    )
  }
}
