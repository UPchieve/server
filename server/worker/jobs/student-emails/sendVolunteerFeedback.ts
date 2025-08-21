import { Job } from 'bull'
import { logError } from '../../logger'
import { sendVolunteerFeedbackToStudent } from '../../../services/MailService'
import { getUserContactInfo } from '../../../services/UserService'
import { Uuid } from '../../../models/pgUtils'
import { asUlid } from '../../../utils/type-utils'
import { getSessionById } from '../../../models/Session/index'
import config from '../../../config'

export type SendVolunteerFeedbackData = {
  sessionId: Uuid
  volunteerFeedback: string
}

export default async (job: Job<SendVolunteerFeedbackData>): Promise<void> => {
  const { data, name } = job

  try {
    const session = await getSessionById(data.sessionId)
    const student = await getUserContactInfo(session.studentId)
    const volunteer = await getUserContactInfo(asUlid(session.volunteerId))

    if (!volunteer || !student) {
      throw Error('No volunteer or student for session')
    }

    const upchieveDashboardLink = `https://${config.client.host}`

    const emailArgs = {
      recipientEmail: student.proxyEmail ?? student.email,
      volunteerFirstName: volunteer.firstName,
      studentFirstName: student.firstName,
      subject: session.subjectDisplayName,
      volunteerFeedback: data.volunteerFeedback,
      upchieveDashboardLink,
    }
    await sendVolunteerFeedbackToStudent(emailArgs)
  } catch (error) {
    const jobError = error as unknown as Error
    logError(jobError)
    throw new Error(
      `JOB: ${name} - Failed to email student for session id ${data.sessionId}`
    )
  }
}
