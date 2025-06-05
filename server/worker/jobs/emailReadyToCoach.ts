import {
  getVolunteersForReadyToCoach,
  updateVolunteersReadyToCoachByIds,
} from '../../models/Volunteer/queries'
import * as MailService from '../../services/MailService'
import { log } from '../logger'
import { Jobs } from '.'
import QueueService from '../../services/QueueService'

const twoDaysInMs = 2 * 24 * 60 * 60 * 1000
export default async (): Promise<void> => {
  const volunteers = await getVolunteersForReadyToCoach()

  const errors: string[] = []
  const succeededVolunteers = []
  for (const volunteer of volunteers) {
    try {
      await MailService.sendReadyToCoachEmail(volunteer)
      succeededVolunteers.push(volunteer.id)
      await QueueService.add(
        Jobs.SendBecomeAnAmbassadorEmail,
        {
          userId: volunteer.id,
        },
        { removeOnComplete: true, removeOnFail: false, delay: twoDaysInMs }
      )
    } catch (error) {
      errors.push(`volunteer ${volunteer.id}: ${error}`)
    }
  }

  await updateVolunteersReadyToCoachByIds(succeededVolunteers)

  log(
    `Sent ${Jobs.EmailReadyToCoach} to ${succeededVolunteers.length} volunteers`
  )

  if (errors.length) {
    throw new Error(`Failed to send ${Jobs.EmailReadyToCoach} to ${errors}`)
  }
}
