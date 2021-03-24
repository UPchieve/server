import VolunteerModel, { Volunteer } from '../../models/Volunteer'
import MailService from '../../services/MailService'
import logger, {
  logEmailJobSent,
  logEmailJobError,
  LogEmailJob
} from '../../logger'
import { Jobs } from '.'

export default async (): Promise<void> => {
  const volunteers = (await VolunteerModel.find({
    isOnboarded: true,
    isApproved: true,
    sentReadyToCoachEmail: false
  })
    .lean()
    .exec()) as Volunteer[]

  for (const volunteer of volunteers) {
    const logData: LogEmailJob = {
      job: Jobs.EmailReadyToCoach,
      userId: volunteer._id
    }
    try {
      await MailService.sendReadyToCoachEmail(volunteer)
      logEmailJobSent(logData)
    } catch (error) {
      logData.error = error
      logEmailJobError(logData)
    }
  }

  await VolunteerModel.updateMany(
    {
      isOnboarded: true,
      isApproved: true,
      sentReadyToCoachEmail: false
    },
    { sentReadyToCoachEmail: true }
  )

  logger.info(
    `Sent ${Jobs.EmailReadyToCoach} to ${volunteers.length} volunteers`
  )
}
