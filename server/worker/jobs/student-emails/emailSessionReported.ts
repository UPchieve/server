import { Job } from 'bull'
import * as UserService from '../../../services/UserService'
import { USER_BAN_REASON } from '../../../constants'
import MailService from '../../../services/MailService'
import { safeAsync } from '../../../utils/safe-async'

export interface EmailSessionReportedJobData {
  studentId: string // mongoose.Types.ObjectID is serialized to string on queue
  reportedBy: string
  reportReason: string
  reportMessage: string
  isBanReason: boolean
  sessionId: string // mongoose.Types.ObjectID is serialized to string on queue
}

async function emailReportedSession(
  job: Job<EmailSessionReportedJobData>
): Promise<void> {
  const {
    data: {
      studentId,
      reportedBy,
      reportReason,
      reportMessage,
      isBanReason,
      sessionId
    }
  } = job

  const student = await UserService.getUser({ _id: studentId })

  const errors: string[] = []

  if (isBanReason) {
    const banAlert = await safeAsync(
      MailService.sendBannedUserAlert({
        userId: student._id,
        banReason: USER_BAN_REASON.SESSION_REPORTED,
        sessionId
      })
    )
    if (banAlert.error)
      errors.push(`Failed to send ban alert email: ${banAlert.error.message}`)
    const studentContact = await safeAsync(MailService.createContact(student))
    if (studentContact.error)
      errors.push(
        `Failed to add student ${studentId} to ban email group: ${studentContact.error.message}`
      )
  }

  const reportAlert = await safeAsync(
    MailService.sendReportedSessionAlert({
      sessionId,
      reportedByEmail: reportedBy,
      reportReason,
      reportMessage
    })
  )
  if (reportAlert.error)
    errors.push(
      `Failed to send report alert email: ${reportAlert.error.message}`
    )

  const studentEmail = await safeAsync(
    MailService.sendStudentReported({
      email: student.email,
      firstName: student.firstname,
      reportReason
    })
  )
  if (studentEmail.error)
    errors.push(
      `Failed to send student ${studentId} email for report: ${studentEmail.error.message}`
    )

  let errMsg = ''
  for (const err of errors) {
    if (err) errMsg += `${err}\n`
  }
  if (errMsg) throw new Error(errMsg)
}

export default emailReportedSession
