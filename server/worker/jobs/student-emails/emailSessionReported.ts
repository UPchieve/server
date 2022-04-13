import { Job } from 'bull'
import { USER_BAN_REASONS } from '../../../constants'
import { getReportedStudent } from '../../../models/Student'
import * as MailService from '../../../services/MailService'
import { safeAsync } from '../../../utils/safe-async'
import { asString } from '../../../utils/type-utils'

export interface EmailSessionReportedJobData {
  studentId: string
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
  const studentId = asString(job.data.studentId)
  const sessionId = asString(job.data.sessionId)

  // a student should receive this email regardless of banned status
  // need full student to create sendGrid contact below
  // Replace with getReportedStudent from Student Repo
  const student = await getReportedStudent(studentId)

  const errors: string[] = []

  if (!student) errors.push(`Student ${studentId} not found`)
  else {
    if (isBanReason) {
      const banAlert = await safeAsync(
        MailService.sendBannedUserAlert(
          student.id,
          USER_BAN_REASONS.SESSION_REPORTED,
          sessionId
        )
      )
      if (banAlert.error)
        errors.push(`Failed to send ban alert email: ${banAlert.error.message}`)
      const studentContact = await safeAsync(
        MailService.createContact(student.id)
      )
      if (studentContact.error)
        errors.push(
          `Failed to add student ${studentId} to ban email group: ${studentContact.error.message}`
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

    const studentEmail = await safeAsync(
      MailService.sendStudentReported(
        student.email,
        student.firstName,
        reportReason
      )
    )
    if (studentEmail.error)
      errors.push(
        `Failed to send student ${studentId} email for report: ${studentEmail.error.message}`
      )
  }
  let errMsg = ''
  for (const err of errors) {
    if (err) errMsg += `${err}\n`
  }
  if (errMsg) throw new Error(errMsg)
}

export default emailReportedSession
