import { Job } from 'bull'
import { mocked } from 'jest-mock'
import { USER_BAN_REASONS } from '../../../constants'
import { buildSession, buildUser } from '../../mocks/generate'
import * as SessionModel from '../../../models/Session'
import * as UserModel from '../../../models/User'
import * as MailService from '../../../services/MailService'
import { Jobs } from '../../../worker/jobs'
import emailReportedSession, {
  EmailSessionReportedJobData,
} from '../../../worker/jobs/user-emails/emailSessionReported'

jest.mock('../../../models/Session')
jest.mock('../../../models/User')
jest.mock('../../../services/MailService')

const mockedSessionModel = mocked(SessionModel)
const mockedUserModel = mocked(UserModel)
const mockedMailService = mocked(MailService)

const student = buildUser()
const volunteer = buildUser()
const session = buildSession({
  studentId: student.id,
  volunteerId: volunteer.id,
})
const reportReason = 'Report reason'
const reportMessage = 'Report message'

function makeJob(
  data: EmailSessionReportedJobData
): Job<EmailSessionReportedJobData> {
  return { data } as Job<EmailSessionReportedJobData>
}

describe('emailReportedSession', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('throws if reported user is not found', async () => {
    const reportedUser = student
    const reportedBy = volunteer
    const job = makeJob({
      userId: reportedUser.id,
      sessionId: session.id,
      reportedBy: reportedBy.id,
      reportReason,
      reportMessage,
      isBanReason: true,
    })

    mockedSessionModel.getSessionById.mockResolvedValueOnce(session)
    mockedUserModel.getReportedUser.mockResolvedValueOnce(undefined)

    await expect(emailReportedSession(job)).rejects.toThrow(
      `user ${student.id} not found`
    )

    expect(MailService.sendReportedSessionAlert).not.toHaveBeenCalled()
    expect(MailService.sendStudentReported).not.toHaveBeenCalled()
    expect(MailService.sendBannedUserAlert).not.toHaveBeenCalled()
    expect(MailService.createContact).not.toHaveBeenCalled()
  })

  test(`when a student's report is ban worthy, sends staff ban alert and email the student`, async () => {
    const reportedUser = student
    const reportedBy = volunteer
    const job = makeJob({
      userId: reportedUser.id,
      sessionId: session.id,
      reportedBy: reportedBy.id,
      reportReason,
      reportMessage,
      isBanReason: true,
    })

    mockedSessionModel.getSessionById.mockResolvedValueOnce(session)
    mockedUserModel.getReportedUser.mockResolvedValueOnce(reportedUser)
    mockedMailService.sendBannedUserAlert.mockResolvedValueOnce()
    mockedMailService.createContact.mockResolvedValueOnce(undefined)
    mockedMailService.sendReportedSessionAlert.mockResolvedValueOnce()
    mockedMailService.sendStudentReported.mockResolvedValueOnce()

    await emailReportedSession(job)

    expect(MailService.sendBannedUserAlert).toHaveBeenCalledWith(
      reportedUser.id,
      USER_BAN_REASONS.SESSION_REPORTED,
      session.id
    )
    expect(MailService.createContact).toHaveBeenCalledWith(student.id)
    expect(MailService.sendReportedSessionAlert).toHaveBeenCalledWith(
      session.id,
      reportedBy.id,
      reportReason,
      reportMessage
    )
    expect(MailService.sendStudentReported).toHaveBeenCalledWith(
      reportedUser.email,
      reportedUser.firstName,
      reportReason
    )
  })

  test(`when a student's report is not ban worthy, sends staff reported email and email the student`, async () => {
    const reportedUser = student
    const reportedBy = volunteer
    const job = makeJob({
      userId: reportedUser.id,
      sessionId: session.id,
      reportedBy: reportedBy.id,
      reportReason,
      reportMessage,
      isBanReason: false,
    })

    mockedSessionModel.getSessionById.mockResolvedValueOnce(session)
    mockedUserModel.getReportedUser.mockResolvedValueOnce(reportedUser)
    mockedMailService.sendReportedSessionAlert.mockResolvedValueOnce()
    mockedMailService.sendStudentReported.mockResolvedValueOnce()

    await emailReportedSession(job)

    expect(MailService.sendBannedUserAlert).not.toHaveBeenCalled()
    expect(MailService.createContact).not.toHaveBeenCalled()
    expect(MailService.sendReportedSessionAlert).toHaveBeenCalledWith(
      session.id,
      reportedBy.id,
      reportReason,
      reportMessage
    )
    expect(MailService.sendStudentReported).toHaveBeenCalledWith(
      reportedUser.email,
      reportedUser.firstName,
      reportReason
    )
  })

  test(`when a voluteer's report is ban worthy, send staff reported alert and do not send an email to any users`, async () => {
    const reportedUser = volunteer
    const reportedBy = student
    const job = makeJob({
      userId: reportedUser.id,
      sessionId: session.id,
      reportedBy: reportedBy.id,
      reportReason,
      reportMessage,
      isBanReason: true,
    })

    mockedSessionModel.getSessionById.mockResolvedValueOnce(session)
    mockedUserModel.getReportedUser.mockResolvedValueOnce(reportedUser)
    mockedMailService.sendReportedSessionAlert.mockResolvedValueOnce()

    await emailReportedSession(job)

    expect(MailService.sendBannedUserAlert).not.toHaveBeenCalled()
    expect(MailService.createContact).not.toHaveBeenCalled()
    expect(MailService.sendStudentReported).not.toHaveBeenCalled()
    expect(MailService.sendReportedSessionAlert).toHaveBeenCalledWith(
      session.id,
      reportedBy.id,
      reportReason,
      reportMessage
    )
  })

  test('should show error messages when sending staff banned alert fails, but other steps continue to run', async () => {
    const reportedUser = student
    const reportedBy = volunteer
    const error = 'ban error'
    const job = makeJob({
      userId: reportedUser.id,
      sessionId: session.id,
      reportedBy: reportedBy.id,
      reportReason,
      reportMessage,
      isBanReason: true,
    })

    mockedSessionModel.getSessionById.mockResolvedValueOnce(session)
    mockedUserModel.getReportedUser.mockResolvedValueOnce(reportedUser)
    mockedMailService.sendBannedUserAlert.mockRejectedValueOnce(
      new Error(error)
    )
    mockedMailService.createContact.mockResolvedValueOnce(undefined)
    mockedMailService.sendReportedSessionAlert.mockResolvedValueOnce()
    mockedMailService.sendStudentReported.mockResolvedValueOnce()

    await expect(emailReportedSession(job)).rejects.toThrow(
      `Failed to send ban alert email: ${error}`
    )

    expect(MailService.createContact).toHaveBeenCalledWith(reportedUser.id)
    expect(MailService.sendReportedSessionAlert).toHaveBeenCalled()
    expect(MailService.sendStudentReported).toHaveBeenCalled()
  })

  test('should show error messages when sendgrid contact creation fails', async () => {
    const reportedUser = student
    const reportedBy = volunteer
    const error = 'Contact create error'
    const job = makeJob({
      userId: reportedUser.id,
      sessionId: session.id,
      reportedBy: reportedBy.id,
      reportReason,
      reportMessage,
      isBanReason: true,
    })

    mockedSessionModel.getSessionById.mockResolvedValueOnce(session)
    mockedUserModel.getReportedUser.mockResolvedValueOnce(reportedUser)
    mockedMailService.sendBannedUserAlert.mockResolvedValueOnce()
    mockedMailService.createContact.mockRejectedValueOnce(new Error(error))
    mockedMailService.sendReportedSessionAlert.mockResolvedValueOnce()
    mockedMailService.sendStudentReported.mockResolvedValueOnce()

    await expect(emailReportedSession(job)).rejects.toThrow(
      `Failed to add user ${reportedUser.id} to ban email group: ${error}`
    )

    expect(MailService.sendBannedUserAlert).toHaveBeenCalled()
    expect(MailService.sendReportedSessionAlert).toHaveBeenCalled()
    expect(MailService.sendStudentReported).toHaveBeenCalled()
  })

  test('should show error messages when failing to send reported session to staff', async () => {
    const reportedUser = student
    const reportedBy = volunteer
    const error = 'report error'
    const job = makeJob({
      userId: reportedUser.id,
      sessionId: session.id,
      reportedBy: reportedBy.id,
      reportReason,
      reportMessage,
      isBanReason: true,
    })

    mockedSessionModel.getSessionById.mockResolvedValueOnce(session)
    mockedUserModel.getReportedUser.mockResolvedValueOnce(reportedUser)
    mockedMailService.sendReportedSessionAlert.mockRejectedValueOnce(
      new Error(error)
    )
    mockedMailService.sendStudentReported.mockResolvedValueOnce()

    await expect(emailReportedSession(job)).rejects.toThrow(
      `Failed to send report alert email: ${error}`
    )

    expect(MailService.sendStudentReported).toHaveBeenCalledWith(
      reportedUser.email,
      reportedUser.firstName,
      reportReason
    )
  })

  test('should show error messages when failing to send student banned email alert', async () => {
    const reportedUser = student
    const reportedBy = volunteer
    const error = 'email error'
    const job = makeJob({
      userId: reportedUser.id,
      sessionId: session.id,
      reportedBy: reportedBy.id,
      reportReason,
      reportMessage,
      isBanReason: true,
    })

    mockedSessionModel.getSessionById.mockResolvedValueOnce(session)
    mockedUserModel.getReportedUser.mockResolvedValueOnce(reportedUser)
    mockedMailService.sendReportedSessionAlert.mockResolvedValueOnce()
    mockedMailService.sendStudentReported.mockRejectedValueOnce(
      new Error(error)
    )

    await expect(emailReportedSession(job)).rejects.toThrow(
      `Failed to send student ${reportedUser.id} email for report: ${error}`
    )

    expect(MailService.sendReportedSessionAlert).toHaveBeenCalled()
  })

  test('should aggregate the error messages', async () => {
    const reportedUser = student
    const reportedBy = volunteer
    const job = makeJob({
      userId: reportedUser.id,
      sessionId: session.id,
      reportedBy: reportedBy.id,
      reportReason,
      reportMessage,
      isBanReason: true,
    })
    const bannedStaffAlertError = 'failed to send'
    const createContactError = 'contact error'
    const reportedStaffAlertError = bannedStaffAlertError
    const studentReportedAlertError = bannedStaffAlertError

    mockedSessionModel.getSessionById.mockResolvedValueOnce(session)
    mockedUserModel.getReportedUser.mockResolvedValueOnce(reportedUser)
    mockedMailService.sendBannedUserAlert.mockRejectedValueOnce(
      new Error(bannedStaffAlertError)
    )
    mockedMailService.createContact.mockRejectedValueOnce(
      new Error(createContactError)
    )
    mockedMailService.sendReportedSessionAlert.mockRejectedValueOnce(
      new Error(reportedStaffAlertError)
    )
    mockedMailService.sendStudentReported.mockRejectedValueOnce(
      new Error(studentReportedAlertError)
    )

    const errorMessage = `${Jobs.EmailSessionReported}: ${[
      `Failed to send ban alert email: ${bannedStaffAlertError}`,
      `Failed to add user ${reportedUser.id} to ban email group: ${createContactError}`,
      `Failed to send report alert email: ${reportedStaffAlertError}`,
      `Failed to send student ${reportedUser.id} email for report: ${studentReportedAlertError}`,
      '',
    ].join('\n')}`

    await expect(emailReportedSession(job)).rejects.toThrow(errorMessage)
  })
})
