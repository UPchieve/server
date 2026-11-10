import { mocked } from 'jest-mock'
import type { Job } from 'bull'
import emailDirectMessageReported from '../../../worker/jobs/user-emails/emailDirectMessageReported'
import * as DirectMessageReportRepo from '../../../models/DirectMessageReport'
import * as UserRepo from '../../../models/User'
import * as MailService from '../../../services/MailService'
import { SESSION_REPORT_REASON } from '../../../constants'
import { getUuid } from '../../../models/pgUtils'
import { buildUserContactInfo } from '../../mocks/generate'

jest.mock('../../../models/DirectMessageReport')
jest.mock('../../../models/User')
jest.mock('../../../services/MailService')

const mockedReportRepo = mocked(DirectMessageReportRepo)
const mockedUserRepo = mocked(UserRepo)
const mockedMailService = mocked(MailService)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('emailDirectMessageReported', () => {
  test.each([
    [SESSION_REPORT_REASON.STUDENT_RUDE, false],
    [SESSION_REPORT_REASON.STUDENT_SAFETY, false],
    [SESSION_REPORT_REASON.STUDENT_RUDE, true],
  ] as const)(
    'alerts staff and notifies participants for %s (staff email fails: %s)',
    async (reason, staffEmailFails) => {
      const student = {
        ...buildUserContactInfo(),
        createdAt: new Date(),
        isTestUser: false,
        isDeactivated: false,
        isVolunteer: false,
      }
      const volunteer = {
        ...buildUserContactInfo(),
        createdAt: new Date(),
        isTestUser: false,
        isDeactivated: false,
        isVolunteer: true,
      }
      const report = {
        id: getUuid(),
        conversationId: getUuid(),
        studentId: student.id,
        volunteerId: volunteer.id,
        reportingUserId: volunteer.id,
        reportedUserId: student.id,
        reportReason: reason,
        reportMessage: undefined,
      }
      mockedReportRepo.getReportById.mockResolvedValue(report)
      mockedUserRepo.getReportedUser
        .mockResolvedValueOnce(student)
        .mockResolvedValueOnce(volunteer)
      if (staffEmailFails) {
        mockedMailService.sendReportedDirectMessageAlert.mockRejectedValueOnce(
          new Error('Staff email failed')
        )
      }

      const result = emailDirectMessageReported({
        data: { reportId: report.id },
      } as Job<{
        reportId: string
      }>)
      if (staffEmailFails) {
        await expect(result).rejects.toThrow('Staff email failed')
      } else {
        await result
      }
      expect(
        mockedMailService.sendReportedDirectMessageAlert
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          reportId: report.id,
          conversationId: report.conversationId,
          reportedByEmail: volunteer.email,
        })
      )
      expect(mockedMailService.sendStudentReported).toHaveBeenCalledWith(
        student.email,
        student.firstName,
        reason
      )
      if (reason === SESSION_REPORT_REASON.STUDENT_SAFETY) {
        expect(mockedMailService.sendBannedUserAlert).not.toHaveBeenCalled()
        expect(mockedMailService.createContact).not.toHaveBeenCalled()
        expect(
          mockedMailService.sendVolunteerThanksForReport
        ).toHaveBeenCalledWith(volunteer.email, volunteer.firstName)
      } else {
        expect(mockedMailService.sendBannedUserAlert).toHaveBeenCalled()
        expect(mockedMailService.createContact).toHaveBeenCalledWith(student.id)
        expect(
          mockedMailService.sendVolunteerBanStudentApology
        ).toHaveBeenCalledWith(volunteer.email, volunteer.firstName)
      }
    }
  )

  test('alerts staff without ban or student emails when a student reports a coach', async () => {
    const student = {
      ...buildUserContactInfo(),
      createdAt: new Date(),
      isTestUser: false,
      isDeactivated: false,
      isVolunteer: false,
    }
    const volunteer = {
      ...buildUserContactInfo(),
      createdAt: new Date(),
      isTestUser: false,
      isDeactivated: false,
      isVolunteer: true,
    }
    const report = {
      id: getUuid(),
      conversationId: getUuid(),
      studentId: student.id,
      volunteerId: volunteer.id,
      reportingUserId: student.id,
      reportedUserId: volunteer.id,
      reportReason: SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_CONNECT_OFFLINE,
      reportMessage: undefined,
    }
    mockedReportRepo.getReportById.mockResolvedValue(report)
    mockedUserRepo.getReportedUser
      .mockResolvedValueOnce(volunteer)
      .mockResolvedValueOnce(student)

    await emailDirectMessageReported({ data: { reportId: report.id } } as Job<{
      reportId: string
    }>)
    expect(mockedMailService.sendReportedDirectMessageAlert).toHaveBeenCalled()
    expect(mockedMailService.sendStudentReported).not.toHaveBeenCalled()
    expect(mockedMailService.sendBannedUserAlert).not.toHaveBeenCalled()
    expect(mockedMailService.sendCoachReported).not.toHaveBeenCalled()
  })
})
