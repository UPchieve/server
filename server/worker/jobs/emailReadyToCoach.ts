import { Job } from 'bull'
import {
  getVolunteersForReadyToCoach,
  updateVolunteersReadyToCoachByIds,
} from '../../models/Volunteer/queries'
import * as MailService from '../../services/MailService'
import logger from '../../logger'
import QueueService from '../../services/QueueService'

const twoDaysInMs = 2 * 24 * 60 * 60 * 1000
export default async (job: Job<undefined>): Promise<void> => {
  const volunteers = await getVolunteersForReadyToCoach()

  const errors: string[] = []
  const succeededVolunteers = []
  for (const volunteer of volunteers) {
    try {
      await MailService.sendReadyToCoachEmail(volunteer)
      succeededVolunteers.push(volunteer.id)
      await QueueService.add(
        'SendBecomeAnAmbassadorEmail',
        { delay: twoDaysInMs, removeOnComplete: true, removeOnFail: false },
        {
          userId: volunteer.id,
        }
      )
    } catch (error) {
      errors.push(`volunteer ${volunteer.id}: ${error}`)
    }
  }

  await updateVolunteersReadyToCoachByIds(succeededVolunteers)

  logger.info(`Sent ${job.name} to ${succeededVolunteers.length} volunteers`)

  if (errors.length) {
    throw new Error(`Failed to send ${job.name} to ${errors}`)
  }
}
