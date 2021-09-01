import VolunteerModel, { Volunteer } from '../../models/Volunteer'
import MailService from '../../services/MailService'
import { log } from '../logger'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { Jobs } from '.'

export default async (): Promise<void> => {
  const volunteers = (await VolunteerModel.find({
    ...EMAIL_RECIPIENT,
    isOnboarded: true,
    isApproved: true,
    sentReadyToCoachEmail: false
  })
    .lean()
    .exec()) as Volunteer[]

  const errors = []
  const failedVolunteers = []
  let successVolunteers = 0
  for (const volunteer of volunteers) {
    try {
      await MailService.sendReadyToCoachEmail(volunteer)
      successVolunteers += 1
    } catch (error) {
      errors.push(`volunteer ${volunteer._id}: ${error}`)
      failedVolunteers.push(volunteer._id)
    }
  }

  await VolunteerModel.updateMany(
    {
      ...EMAIL_RECIPIENT,
      isOnboarded: true,
      isApproved: true,
      sentReadyToCoachEmail: false,
      _id: { $nin: failedVolunteers }
    },
    { sentReadyToCoachEmail: true }
  )
  log(`Sent ${Jobs.EmailReadyToCoach} to ${successVolunteers} volunteers`)

  if (errors.length) {
    throw new Error(`Failed to send ${Jobs.EmailReadyToCoach} to ${errors}`)
  }
}
