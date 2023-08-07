import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getVolunteerForEmailFirstSession } from '../../../models/Session'
import { asString } from '../../../utils/type-utils'

interface EmailVolunteerFirstSessionJobData {
  sessionId: string
}

export default async (
  job: Job<EmailVolunteerFirstSessionJobData>
): Promise<void> => {
  const { name: currentJob } = job
  const sessionId = asString(job.data.sessionId)
  const volunteer = await getVolunteerForEmailFirstSession(sessionId)

  if (volunteer) {
    const { id: volunteerId } = volunteer
    try {
      await MailService.sendVolunteerFirstSessionCongrats(volunteer)
      log(`Sent ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
