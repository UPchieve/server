import { Job } from 'bull'
import { mocked } from 'jest-mock'
import { buildVolunteer } from '../../mocks/generate'
import config from '../../../config'
import { getUuid, Uuid } from '../../../models/pgUtils'
import { getVolunteerForEmailFirstSession } from '../../../models/Session'
import * as MailService from '../../../services/MailService'
import { createEmailNotification } from '../../../services/NotificationService'
import { hasUserBeenSentEmail } from '../../../services/NotificationService'
import { log } from '../../../worker/logger'
import emailVolunteerFirstSessionCongrats from '../../../worker/jobs/volunteer-emails/emailVolunteerFirstSessionCongrats'
import { asString } from '../../../utils/type-utils'
import { Jobs } from '../../../worker/jobs'

jest.mock('../../../models/Session')
jest.mock('../../../services/NotificationService')
jest.mock('../../../services/MailService')
jest.mock('../../../worker/logger')

const mockedGetVolunteerForEmailFirstSession = mocked(
  getVolunteerForEmailFirstSession
)
const mockedHasUserBeenSentEmail = mocked(hasUserBeenSentEmail)
const mockedCreateEmailNotification = mocked(createEmailNotification)
const mockedSendVolunteerFirstSessionCongrats = mocked(
  MailService.sendVolunteerFirstSessionCongrats
)

describe(`${Jobs.EmailVolunteerFirstSessionCongrats}`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should exit early if no volunteer is found', async () => {
    const sessionId = getUuid()
    mockedGetVolunteerForEmailFirstSession.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId },
      name: Jobs.EmailVolunteerFirstSessionCongrats,
    } as Job<{ sessionId: string }>
    await emailVolunteerFirstSessionCongrats(job)

    expect(mockedGetVolunteerForEmailFirstSession).toHaveBeenCalledWith(
      asString(sessionId)
    )
    expect(mockedSendVolunteerFirstSessionCongrats).not.toHaveBeenCalled()
    expect(mockedCreateEmailNotification).not.toHaveBeenCalled()
  })

  test('Should exit if volunteer has already received email', async () => {
    const volunteer = buildVolunteer()
    const sessionId = getUuid()
    mockedGetVolunteerForEmailFirstSession.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(true)

    const job = {
      data: { sessionId },
      name: Jobs.EmailVolunteerFirstSessionCongrats,
    } as Job<{ sessionId: string }>
    await emailVolunteerFirstSessionCongrats(job)

    expect(mockedHasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: volunteer.id,
      emailTemplateId: config.sendgrid.volunteerFirstSessionCongratsTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Volunteer ${volunteer.id} has already received ${Jobs.EmailVolunteerFirstSessionCongrats}`
    )
    expect(mockedSendVolunteerFirstSessionCongrats).not.toHaveBeenCalled()
    expect(mockedCreateEmailNotification).not.toHaveBeenCalled()
  })

  test(`Should send ${Jobs.EmailVolunteerFirstSessionCongrats}`, async () => {
    const volunteer = buildVolunteer()
    const sessionId = getUuid()
    mockedGetVolunteerForEmailFirstSession.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSendVolunteerFirstSessionCongrats.mockResolvedValueOnce(undefined)
    mockedCreateEmailNotification.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId },
      name: Jobs.EmailVolunteerFirstSessionCongrats,
    } as Job<{ sessionId: string }>
    await emailVolunteerFirstSessionCongrats(job)

    expect(mockedSendVolunteerFirstSessionCongrats).toHaveBeenCalledWith(
      volunteer.email,
      volunteer.firstName
    )
    expect(mockedCreateEmailNotification).toHaveBeenCalledWith({
      userId: volunteer.id,
      emailTemplateId: config.sendgrid.volunteerFirstSessionCongratsTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Sent ${Jobs.EmailVolunteerFirstSessionCongrats} to volunteer ${volunteer.id}`
    )
  })

  test('Should throw error if email sending fails', async () => {
    const volunteer = buildVolunteer()
    const sessionId = getUuid()
    mockedGetVolunteerForEmailFirstSession.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    const errorMessage = 'Send failed'
    mockedSendVolunteerFirstSessionCongrats.mockRejectedValueOnce(
      new Error(errorMessage)
    )

    const job = {
      data: { sessionId },
      name: Jobs.EmailVolunteerFirstSessionCongrats,
    } as Job<{ sessionId: string }>
    await expect(emailVolunteerFirstSessionCongrats(job)).rejects.toThrow(
      `Failed to send ${Jobs.EmailVolunteerFirstSessionCongrats} to volunteer ${volunteer.id}: Error: ${errorMessage}`
    )
  })
})
