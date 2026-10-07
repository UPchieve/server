import { Job } from 'bull'
import logger from '../../logger'
import { getVolunteersForWaitingReferences } from '../../models/Volunteer/queries'
import * as MailService from '../../services/MailService'

// Runs every day at 11am EST
export default async (job: Job<undefined>): Promise<void> => {
  const oneDay = 1000 * 60 * 60 * 24 * 1
  const fiveDaysAgo = Date.now() - oneDay * 5
  const sixDaysAgo = fiveDaysAgo - oneDay

  const volunteers = await getVolunteersForWaitingReferences(
    new Date(sixDaysAgo),
    new Date(fiveDaysAgo)
  )

  let totalEmailed = 0
  const errors: string[] = []
  for (const volunteer of volunteers) {
    try {
      await MailService.sendWaitingOnReferences(volunteer)
      totalEmailed++
    } catch (error) {
      errors.push(`volunteer ${volunteer.id}: ${error}`)
    }
  }

  logger.info(`Sent ${job.name} to ${totalEmailed}`)
  if (errors.length) {
    throw new Error(`Failed to send ${job.name} to: ${errors}`)
  }
}
