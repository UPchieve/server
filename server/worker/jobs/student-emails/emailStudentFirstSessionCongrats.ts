import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getStudentForEmailFirstSession } from '../../../models/Session'
import { asString } from '../../../utils/type-utils'

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
    try {
      await MailService.sendStudentFirstSessionCongrats(email, firstName)
      log(`Sent ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
