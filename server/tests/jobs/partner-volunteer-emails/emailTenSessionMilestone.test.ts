import { Job } from 'bull'
import { mocked } from 'jest-mock'
import { buildSession, buildVolunteer } from '../../mocks/generate'
import config from '../../../config'
import { getUuid, Uuid } from '../../../models/pgUtils'
import { getSessionsVolunteerRating } from '../../../models/Session'
import { getVolunteerContactInfoById } from '../../../models/Volunteer'
import * as MailService from '../../../services/MailService'
import {
  createEmailNotification,
  hasUserBeenSentEmail,
} from '../../../services/NotificationService'
import logger from '../../../logger'
import emailVolunteerTenSessionMilestone from '../../../worker/jobs/volunteer-emails/emailTenSessionMilestone'
import { asString } from '../../../utils/type-utils'

jest.mock('../../../models/Session')
jest.mock('../../../models/Volunteer')
jest.mock('../../../services/NotificationService')
jest.mock('../../../services/MailService')
jest.mock('../../../logger')

const mockedGetVolunteerContactInfoById = mocked(getVolunteerContactInfoById)
const mockedGetSessionsVolunteerRating = mocked(getSessionsVolunteerRating)
const mockedHasUserBeenSentEmail = mocked(hasUserBeenSentEmail)
const mockedCreateEmailNotification = mocked(createEmailNotification)
const mockedSendVolunteerTenSessionMilestone = mocked(
  MailService.sendVolunteerTenSessionMilestone
)

describe(`EmailVolunteerTenSessionMilestone`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should early exit if volunteer not found', async () => {
    const volunteerId = getUuid()
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(undefined)

    const job = {
      data: { volunteerId },
      name: 'EmailVolunteerTenSessionMilestone',
    } as Job<{ volunteerId: Uuid }>
    await emailVolunteerTenSessionMilestone(job)

    expect(mockedGetVolunteerContactInfoById).toHaveBeenCalledWith(
      asString(volunteerId),
      {
        deactivated: false,
        testUser: false,
        banned: false,
      }
    )
    expect(logger.info).toHaveBeenCalledWith(
      `No volunteer found with id ${volunteerId}`
    )
    expect(mockedSendVolunteerTenSessionMilestone).not.toHaveBeenCalled()
    expect(mockedCreateEmailNotification).not.toHaveBeenCalled()
  })

  test('Should exit if volunteer has already received email', async () => {
    const volunteer = buildVolunteer()
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(true)

    const job = {
      data: { volunteerId: volunteer.id },
      name: 'EmailVolunteerTenSessionMilestone',
    } as Job<{ volunteerId: Uuid }>
    await emailVolunteerTenSessionMilestone(job)

    expect(mockedHasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: volunteer.id,
      emailTemplateId: config.sendgrid.volunteerTenSessionMilestoneTemplate,
    })
    expect(logger.info).toHaveBeenCalledWith(
      `Volunteer ${volunteer.id} has already received EmailVolunteerTenSessionMilestone`
    )
    expect(mockedSendVolunteerTenSessionMilestone).not.toHaveBeenCalled()
    expect(mockedCreateEmailNotification).not.toHaveBeenCalled()
  })

  test('Should do nothing if session count is not 10', async () => {
    const volunteer = buildVolunteer()
    const volunteerId = volunteer.id
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedGetSessionsVolunteerRating.mockResolvedValueOnce(
      Array(9).fill(buildSession({ studentId: getUuid() }))
    )

    const job = {
      data: { volunteerId },
      name: 'EmailVolunteerTenSessionMilestone',
    } as Job<{ volunteerId: Uuid }>
    await emailVolunteerTenSessionMilestone(job)

    expect(mockedGetSessionsVolunteerRating).toHaveBeenCalledWith(
      asString(volunteerId)
    )
    expect(mockedSendVolunteerTenSessionMilestone).not.toHaveBeenCalled()
    expect(mockedCreateEmailNotification).not.toHaveBeenCalled()
  })

  test('Should send email if session count is exactly 10', async () => {
    const volunteer = buildVolunteer()
    const volunteerId = volunteer.id
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedGetSessionsVolunteerRating.mockResolvedValueOnce(
      Array(10).fill(buildSession({ studentId: getUuid() }))
    )
    mockedSendVolunteerTenSessionMilestone.mockResolvedValueOnce(undefined)
    mockedCreateEmailNotification.mockResolvedValueOnce(undefined)

    const job = {
      data: { volunteerId },
      name: 'EmailVolunteerTenSessionMilestone',
    } as Job<{ volunteerId: Uuid }>
    await emailVolunteerTenSessionMilestone(job)

    expect(mockedGetSessionsVolunteerRating).toHaveBeenCalledWith(
      asString(volunteerId)
    )
    expect(mockedSendVolunteerTenSessionMilestone).toHaveBeenCalledWith(
      volunteer.email,
      volunteer.firstName
    )
    expect(mockedCreateEmailNotification).toHaveBeenCalledWith({
      userId: volunteer.id,
      emailTemplateId: config.sendgrid.volunteerTenSessionMilestoneTemplate,
    })
    expect(logger.info).toHaveBeenCalledWith(
      `Sent EmailVolunteerTenSessionMilestone to volunteer ${asString(volunteerId)}`
    )
  })

  test('Should throw error if email sending fails', async () => {
    const volunteer = buildVolunteer()
    const volunteerId = volunteer.id
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedGetSessionsVolunteerRating.mockResolvedValueOnce(
      Array(10).fill(buildSession({ studentId: getUuid() }))
    )
    const errorMessage = 'Email sending failed'
    mockedSendVolunteerTenSessionMilestone.mockRejectedValueOnce(
      new Error(errorMessage)
    )

    const job = {
      data: { volunteerId },
      name: 'EmailVolunteerTenSessionMilestone',
    } as Job<{ volunteerId: Uuid }>
    await expect(emailVolunteerTenSessionMilestone(job)).rejects.toThrow(
      `Failed to send EmailVolunteerTenSessionMilestone to volunteer ${asString(volunteerId)}: Error: ${errorMessage}`
    )
  })
})
