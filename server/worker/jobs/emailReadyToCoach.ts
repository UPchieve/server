import {
  getVolunteersContactInfo,
  updateVolunteersReadyToCoachByIds,
} from '../../models/Volunteer/queries'
import * as MailService from '../../services/MailService'
import { log } from '../logger'
import { Jobs } from '.'

export default async (): Promise<void> => {
  const volunteers = await getVolunteersContactInfo({
    isOnboarded: true,
    isApproved: true,
    sentReadyToCoachEmail: false,
  })

  const errors: string[] = []
  const succeededVolunteers = []
  for (const volunteer of volunteers) {
    try {
      await MailService.sendReadyToCoachEmail(volunteer)
      succeededVolunteers.push(volunteer._id)
    } catch (error) {
      errors.push(`volunteer ${volunteer._id}: ${error}`)
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
