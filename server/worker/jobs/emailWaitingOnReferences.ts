import { log } from '../logger'
import VolunteerModel from '../../models/Volunteer'
import { REFERENCE_STATUS } from '../../constants'
import MailService from '../../services/MailService'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { Jobs } from '.'

// Runs every day at 11am EST
export default async (): Promise<void> => {
  const oneDay = 1000 * 60 * 60 * 24 * 1
  const fiveDaysAgo = Date.now() - oneDay * 5
  const sixDaysAgo = fiveDaysAgo - oneDay
  const query = {
    ...EMAIL_RECIPIENT,
    'references.status': REFERENCE_STATUS.SENT,
    'references.sentAt': {
      $gt: new Date(sixDaysAgo),
      $lt: new Date(fiveDaysAgo)
    }
  }

  const volunteers = await VolunteerModel.find(query)
    .select('firstname email')
    .lean()
    .exec()

  let totalEmailed = 0
  const errors = []
  for (const volunteer of volunteers) {
    try {
      await MailService.sendWaitingOnReferences(volunteer)
      totalEmailed++
    } catch (error) {
      errors.push(`volunteer ${volunteer._id}: ${error}`)
    }
  }

  log(`Sent ${Jobs.EmailWaitingOnReferences} to ${totalEmailed}`)
  if (errors.length) {
    throw new Error(
      `Failed to send ${Jobs.EmailWaitingOnReferences} to: ${errors}`
    )
  }
}
