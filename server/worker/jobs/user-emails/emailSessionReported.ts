import { Job } from 'bull'
import { USER_BAN_REASONS } from '../../../constants'
import { getReportedUser } from '../../../models/User'
import * as MailService from '../../../services/MailService'
import { safeAsync } from '../../../utils/safe-async'
import { asString } from '../../../utils/type-utils'

export interface EmailSessionReportedJobData {
  userId: string
  reportedBy: string
  reportReason: string
  reportMessage: string
  isBanReason: boolean
  sessionId: string
}

async function emailReportedSession(
  job: Job<EmailSessionReportedJobData>
): Promise<void> {
  const {
    data: { reportedBy, reportReason, reportMessage, isBanReason },
  } = job
  const userId = asString(job.data.userId)
  const sessionId = asString(job.data.sessionId)

  // a user should receive this email regardless of banned status
  // need full user to create sendGrid contact below
  // user with getReportedUser from User Repo
  const user = await getReportedUser(userId)

  const errors: string[] = []

  if (!user) errors.push(`user ${userId} not found`)
  else {
    if (isBanReason) {
      const banAlert = await safeAsync(
        // TODO: double check the email
        MailService.sendBannedUserAlert(
          userId,
          USER_BAN_REASONS.SESSION_REPORTED,
          sessionId
        )
      )
      if (banAlert.error)
        errors.push(`Failed to send ban alert email: ${banAlert.error.message}`)
      const contactResponse = await safeAsync(
        MailService.createContact(user.id)
      )
      if (contactResponse.error)
        errors.push(
          `Failed to add user ${userId} to ban email group: ${contactResponse.error.message}`
        )
    }

    const reportAlert = await safeAsync(
      MailService.sendReportedSessionAlert(
        sessionId,
        reportedBy,
        reportReason,
        reportMessage
      )
    )
    if (reportAlert.error)
      errors.push(
        `Failed to send report alert email: ${reportAlert.error.message}`
      )

    if (user.isVolunteer) {
      const volunteerEmail = await safeAsync(
        MailService.sendCoachReported(user.email, user.firstName)
      )
      if (volunteerEmail.error)
        errors.push(
          `Failed to send volunteer ${user.id} email for report: ${volunteerEmail.error.message}`
        )
    } else {
      const studentEmail = await safeAsync(
        MailService.sendStudentReported(
          user.email,
          user.firstName,
          reportReason
        )
      )
      if (studentEmail.error)
        errors.push(
          `Failed to send student ${user.id} email for report: ${studentEmail.error.message}`
        )
    }
    let errMsg = ''
    for (const err of errors) {
      if (err) errMsg += `${err}\n`
    }
    if (errMsg) throw new Error(errMsg)
  }
}

export default emailReportedSession
