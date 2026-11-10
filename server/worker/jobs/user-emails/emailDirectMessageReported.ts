import { Job } from 'bull'
import * as DirectMessageReportRepo from '../../../models/DirectMessageReport'
import * as UserRepo from '../../../models/User'
import * as MailService from '../../../services/MailService'
import { SESSION_REPORT_REASON, USER_BAN_REASONS } from '../../../constants'
import type { Uuid } from '../../../types/shared'

export default async function emailDirectMessageReported(
  job: Job<{ reportId: Uuid }>
): Promise<void> {
  const report = await DirectMessageReportRepo.getReportById(job.data.reportId)
  const [reportedUser, reporter] = await Promise.all([
    UserRepo.getReportedUser(report.reportedUserId),
    UserRepo.getReportedUser(report.reportingUserId),
  ])
  if (!reportedUser || !reporter) {
    throw new Error('DM report participant not found')
  }

  const emails = [
    MailService.sendReportedDirectMessageAlert({
      reportId: report.id,
      conversationId: report.conversationId,
      reportedUserId: reportedUser.id,
      reportedByEmail: reporter.email,
      reportReason: report.reportReason,
      reportMessage: report.reportMessage,
    }),
  ]
  if (report.reportedUserId === report.studentId) {
    if (report.reportReason === SESSION_REPORT_REASON.STUDENT_RUDE) {
      emails.push(
        MailService.sendBannedUserAlert(
          reportedUser.id,
          USER_BAN_REASONS.SESSION_REPORTED
        ),
        MailService.createContact(reportedUser.id)
      )
    }
    emails.push(
      MailService.sendStudentReported(
        reportedUser.email,
        reportedUser.firstName,
        report.reportReason
      )
    )
    if (report.reportReason === SESSION_REPORT_REASON.STUDENT_RUDE) {
      emails.push(
        MailService.sendVolunteerBanStudentApology(
          reporter.email,
          reporter.firstName
        )
      )
    } else if (report.reportReason === SESSION_REPORT_REASON.STUDENT_SAFETY) {
      emails.push(
        MailService.sendVolunteerThanksForReport(
          reporter.email,
          reporter.firstName
        )
      )
    }
  }
  const results = await Promise.allSettled(emails)
  const errors: string[] = []
  for (const result of results) {
    if (result.status === 'rejected') {
      errors.push(result.reason.message)
    }
  }
  if (errors.length) {
    throw new Error(`DM report ${report.id}: ${errors.join('; ')}`)
  }
}
