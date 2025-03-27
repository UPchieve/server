import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getStudentForEmailFirstSession } from '../../../models/Session'
import { asString } from '../../../utils/type-utils'
import config from '../../../config'
import { createEmailNotification } from '../../../models/Notification'
import { hasUserBeenSentEmail } from '../../../services/NotificationService'

interface EmailStudentFirstSessionJobData {
  sessionId: string
}

export default async (
  job: Job<EmailStudentFirstSessionJobData>
): Promise<void> => {
  const { name: currentJob } = job
  const sessionId = asString(job.data.sessionId)
  const student = await getStudentForEmailFirstSession(sessionId)

  if (student) {
    const { id: studentId, firstName, email } = student
    const emailTemplateId = config.sendgrid.studentFirstSessionCongratsTemplate
    try {
      const hasReceivedEmail = await hasUserBeenSentEmail({
        userId: student.id,
        emailTemplateId,
      })
      if (hasReceivedEmail)
        return log(`Student ${student.id} has already received ${currentJob}`)

      await MailService.sendStudentFirstSessionCongrats(email, firstName)
      await createEmailNotification({
        userId: student.id,
        emailTemplateId,
      })
      log(`Sent ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
