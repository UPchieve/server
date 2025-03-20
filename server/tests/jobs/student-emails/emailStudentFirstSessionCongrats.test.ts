import { Job } from 'bull'
import { mocked } from 'jest-mock'
import { buildStudent } from '../../mocks/generate'
import config from '../../../config'
import { getUuid, Uuid } from '../../../models/pgUtils'
import { getStudentForEmailFirstSession } from '../../../models/Session'
import * as MailService from '../../../services/MailService'
import { createEmailNotification } from '../../../models/Notification'
import { hasUserBeenSentEmail } from '../../../services/NotificationService'
import { log } from '../../../worker/logger'
import emailStudentFirstSessionCongrats from '../../../worker/jobs/student-emails/emailStudentFirstSessionCongrats'
import { Jobs } from '../../../worker/jobs'

jest.mock('../../../models/Session')
jest.mock('../../../models/Notification')
jest.mock('../../../services/NotificationService')
jest.mock('../../../services/MailService')
jest.mock('../../../worker/logger')

const mockedGetStudentForEmailFirstSession = mocked(
  getStudentForEmailFirstSession
)
const mockedHasUserBeenSentEmail = mocked(hasUserBeenSentEmail)
const mockedCreateEmailNotification = mocked(createEmailNotification)
const mockedSendStudentFirstSessionCongrats = mocked(
  MailService.sendStudentFirstSessionCongrats
)

describe(`${Jobs.EmailStudentFirstSessionCongrats}`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should exit early if no student is found', async () => {
    const sessionId = getUuid()
    mockedGetStudentForEmailFirstSession.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId },
      name: Jobs.EmailStudentFirstSessionCongrats,
    } as Job<{ sessionId: string }>
    await emailStudentFirstSessionCongrats(job)

    expect(mockedGetStudentForEmailFirstSession).toHaveBeenCalledWith(sessionId)
    expect(mockedSendStudentFirstSessionCongrats).not.toHaveBeenCalled()
    expect(mockedCreateEmailNotification).not.toHaveBeenCalled()
  })

  test('Should exit if student has already received email', async () => {
    const student = buildStudent()
    const sessionId = getUuid()
    mockedGetStudentForEmailFirstSession.mockResolvedValueOnce(student)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(true)

    const job = {
      data: { sessionId },
      name: Jobs.EmailStudentFirstSessionCongrats,
    } as Job<{ sessionId: string }>
    await emailStudentFirstSessionCongrats(job)

    expect(mockedHasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: student.id,
      emailTemplateId: config.sendgrid.studentFirstSessionCongratsTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Student ${student.id} has already received ${job.name}`
    )
    expect(mockedSendStudentFirstSessionCongrats).not.toHaveBeenCalled()
    expect(mockedCreateEmailNotification).not.toHaveBeenCalled()
  })

  test(`Should send ${Jobs.EmailStudentFirstSessionCongrats}`, async () => {
    const student = buildStudent()
    const sessionId = getUuid()
    mockedGetStudentForEmailFirstSession.mockResolvedValueOnce(student)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSendStudentFirstSessionCongrats.mockResolvedValueOnce(undefined)
    mockedCreateEmailNotification.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId },
      name: Jobs.EmailStudentFirstSessionCongrats,
    } as Job<{ sessionId: string }>
    await emailStudentFirstSessionCongrats(job)

    expect(mockedSendStudentFirstSessionCongrats).toHaveBeenCalledWith(
      student.email,
      student.firstName
    )
    expect(mockedCreateEmailNotification).toHaveBeenCalledWith({
      userId: student.id,
      emailTemplateId: config.sendgrid.studentFirstSessionCongratsTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Sent ${job.name} to student ${student.id}`
    )
  })

  test('Should throw error if email sending fails', async () => {
    const student = buildStudent()
    const sessionId = getUuid()
    mockedGetStudentForEmailFirstSession.mockResolvedValueOnce(student)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    const errorMessage = 'Send failed'
    mockedSendStudentFirstSessionCongrats.mockRejectedValueOnce(
      new Error(errorMessage)
    )

    const job = {
      data: { sessionId },
      name: Jobs.EmailStudentFirstSessionCongrats,
    } as Job<{ sessionId: string }>

    await expect(emailStudentFirstSessionCongrats(job)).rejects.toThrow(
      `Failed to send ${job.name} to student ${student.id}: Error: ${errorMessage}`
    )
  })
})
