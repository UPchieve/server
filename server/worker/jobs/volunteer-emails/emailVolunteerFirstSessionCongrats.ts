import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getVolunteerForEmailFirstSession } from '../../../models/Session'
import { asString } from '../../../utils/type-utils'
import config from '../../../config'
import {
  createEmailNotification,
  hasUserBeenSentEmail,
} from '../../../services/NotificationService'

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
    const { id: volunteerId, firstName, email } = volunteer
    const emailTemplateId =
      config.sendgrid.volunteerFirstSessionCongratsTemplate
    try {
      const hasReceivedEmail = await hasUserBeenSentEmail({
        userId: volunteer.id,
        emailTemplateId,
      })
      if (hasReceivedEmail)
        return log(
          `Volunteer ${volunteer.id} has already received ${currentJob}`
        )

      await MailService.sendVolunteerFirstSessionCongrats(email, firstName)
      await createEmailNotification({
        userId: volunteer.id,
        emailTemplateId,
      })
      log(`Sent ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
