import logger, {
  logEmailJobSent,
  logEmailJobError,
  LogEmailJob
} from '../../logger'
import VolunteerModel from '../../models/Volunteer'
import { REFERENCE_STATUS } from '../../constants'
import MailService from '../../services/MailService'
import { Jobs } from '.'

// Runs every day at 11am EST
export default async (): Promise<void> => {
  const oneDay = 1000 * 60 * 60 * 24 * 1
  const fiveDaysAgo = Date.now() - oneDay * 5
  const sixDaysAgo = fiveDaysAgo - oneDay
  const query = {
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

  for (const volunteer of volunteers) {
    const logData: LogEmailJob = {
      job: Jobs.EmailWaitingOnReferences,
      userId: volunteer._id
    }
    try {
      await MailService.sendWaitingOnReferences(volunteer)
      totalEmailed++
      logEmailJobSent(logData)
    } catch (error) {
      logData.error = error
      logEmailJobError(logData)
    }
  }

  return logger.info(
    `Sent ${Jobs.EmailWaitingOnReferences} to ${totalEmailed} volunteers`
  )
}
