import { Job } from 'bull'
import { mocked } from 'jest-mock'
import moment from 'moment'
import {
  buildSession,
  buildStudent,
  buildVolunteer,
} from '../../mocks/generate'
import config from '../../../config'
import { getUuid, Uuid } from '../../../models/pgUtils'
import { getSessionById } from '../../../models/Session'
import { getStudentContactInfoById } from '../../../models/Student'
import { getVolunteerContactInfoById } from '../../../models/Volunteer'
import * as MailService from '../../../services/MailService'
import {
  createEmailNotification,
  hasUserBeenSentEmail,
} from '../../../services/NotificationService'
import { log } from '../../../worker/logger'
import { Jobs } from '../../../worker/jobs'
import emailVolunteerSessionActions from '../../../worker/jobs/volunteer-emails/emailVolunteerSessionActions'

jest.mock('../../../models/Session')
jest.mock('../../../models/Volunteer/queries')
jest.mock('../../../models/Student/queries')
jest.mock('../../../services/NotificationService')
jest.mock('../../../services/MailService')
jest.mock('../../../worker/logger')

const mockedGetSessionById = mocked(getSessionById)
const mockedGetVolunteerContactInfoById = mocked(getVolunteerContactInfoById)
const mockedGetStudentContactInfoById = mocked(getStudentContactInfoById)
const mockedHasUserBeenSentEmail = mocked(hasUserBeenSentEmail)
const mockedCreateEmailNotification = mocked(createEmailNotification)
const mockedSendVolunteerAbsentWarning = mocked(
  MailService.sendVolunteerAbsentWarning
)
const mockedSendVolunteerAbsentStudentApology = mocked(
  MailService.sendVolunteerAbsentStudentApology
)

describe('emailVolunteerSessionActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should early exit if session has no volunteer', async () => {
    const session = buildSession({
      studentId: getUuid(),
    })
    mockedGetSessionById.mockResolvedValueOnce(session)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailVolunteerAbsentWarning,
    } as Job<{ sessionId: Uuid }>
    await emailVolunteerSessionActions(job)

    expect(mockedGetSessionById).toHaveBeenCalledWith(session.id)
    expect(log).toHaveBeenCalledWith(
      `No volunteer found on session ${session.id}`
    )
    expect(mockedGetVolunteerContactInfoById).not.toHaveBeenCalled()
    expect(mockedSendVolunteerAbsentWarning).not.toHaveBeenCalled()
  })

  test('Should log and exit if volunteer not found', async () => {
    const session = buildSession({
      studentId: getUuid(),
      volunteerId: getUuid(),
    })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailVolunteerAbsentWarning,
    } as Job<{ sessionId: Uuid }>
    await emailVolunteerSessionActions(job)

    expect(mockedGetVolunteerContactInfoById).toHaveBeenCalledWith(
      session.volunteerId,
      {
        deactivated: false,
        testUser: false,
        banned: false,
      }
    )
    expect(log).toHaveBeenCalledWith(
      `No volunteer found with id ${session.volunteerId}`
    )
    expect(mockedSendVolunteerAbsentWarning).not.toHaveBeenCalled()
  })

  test('Should exit if email template is not found', async () => {
    const volunteer = buildVolunteer()
    const session = buildSession({
      studentId: getUuid(),
      volunteerId: volunteer.id,
    })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)

    const job = {
      data: { sessionId: session.id },
      name: 'TestJob',
    } as Job<{ sessionId: Uuid }>
    await emailVolunteerSessionActions(job)

    expect(log).toHaveBeenCalledWith(
      `No email template id found for ${job.name}`
    )
    expect(mockedSendVolunteerAbsentWarning).not.toHaveBeenCalled()
    expect(mockedSendVolunteerAbsentStudentApology).not.toHaveBeenCalled()
  })

  test('Should exit if volunteer has already been sent email', async () => {
    const volunteer = buildVolunteer()
    const session = buildSession({
      studentId: getUuid(),
      volunteerId: volunteer.id,
    })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(true)

    const absentVolunteerJob = {
      data: { sessionId: session.id },
      name: Jobs.EmailVolunteerAbsentWarning,
    } as Job<{ sessionId: Uuid }>
    await emailVolunteerSessionActions(absentVolunteerJob)

    expect(log).toHaveBeenCalledWith(
      `Volunteer ${volunteer.id} has already received ${absentVolunteerJob.name} for session ${session.id}`
    )
    expect(mockedHasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: volunteer.id,
      emailTemplateId: config.sendgrid.volunteerAbsentWarningTemplate,
    })
    expect(mockedSendVolunteerAbsentWarning).not.toHaveBeenCalled()

    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(true)

    const absentStudentJob = {
      data: { sessionId: session.id },
      name: Jobs.EmailVolunteerAbsentStudentApology,
    } as Job<{ sessionId: Uuid }>
    await emailVolunteerSessionActions(absentStudentJob)

    expect(log).toHaveBeenCalledWith(
      `Volunteer ${volunteer.id} has already received ${absentStudentJob.name} for session ${session.id}`
    )
    expect(mockedHasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: volunteer.id,
      emailTemplateId: config.sendgrid.volunteerAbsentStudentApologyTemplate,
    })
    expect(mockedSendVolunteerAbsentWarning).not.toHaveBeenCalled()
  })

  test('should log and exit if student not found', async () => {
    const volunteer = buildVolunteer()
    const session = buildSession({
      studentId: getUuid(),
      volunteerId: volunteer.id,
    })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailVolunteerAbsentWarning,
    } as Job<{ sessionId: Uuid }>
    await emailVolunteerSessionActions(job)

    expect(log).toHaveBeenCalledWith(
      `No student found with id ${session.studentId}`
    )
    expect(mockedGetStudentContactInfoById).toHaveBeenCalledWith(
      session.studentId
    )
    expect(mockedSendVolunteerAbsentWarning).not.toHaveBeenCalled()
  })

  test('Should send email EmailVolunteerAbsentWarning', async () => {
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const session = buildSession({
      studentId: student.id,
      volunteerId: volunteer.id,
    })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)
    mockedSendVolunteerAbsentWarning.mockResolvedValueOnce(undefined)
    mockedCreateEmailNotification.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailVolunteerAbsentWarning,
    } as Job<{ sessionId: Uuid }>
    await emailVolunteerSessionActions(job)

    expect(mockedSendVolunteerAbsentWarning).toHaveBeenCalledWith(
      volunteer.firstName,
      volunteer.email,
      student.firstName,
      session.subjectDisplayName,
      moment(session.createdAt).format('MMMM Do')
    )
    expect(mockedCreateEmailNotification).toHaveBeenCalledWith({
      userId: volunteer.id,
      sessionId: session.id,
      emailTemplateId: config.sendgrid.volunteerAbsentWarningTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Emailed ${Jobs.EmailVolunteerAbsentWarning} to volunteer ${volunteer.id}`
    )
  })

  test('Should send email EmailVolunteerAbsentStudentApology', async () => {
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const session = buildSession({
      studentId: student.id,
      volunteerId: volunteer.id,
    })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)
    mockedSendVolunteerAbsentStudentApology.mockResolvedValueOnce(undefined)
    mockedCreateEmailNotification.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailVolunteerAbsentStudentApology,
    } as Job<{ sessionId: Uuid }>
    await emailVolunteerSessionActions(job)

    expect(mockedSendVolunteerAbsentStudentApology).toHaveBeenCalledWith(
      volunteer.firstName,
      volunteer.email,
      student.firstName,
      session.subjectDisplayName,
      moment(session.createdAt).format('MMMM Do')
    )
    expect(mockedCreateEmailNotification).toHaveBeenCalledWith({
      userId: volunteer.id,
      sessionId: session.id,
      emailTemplateId: config.sendgrid.volunteerAbsentStudentApologyTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Emailed ${Jobs.EmailVolunteerAbsentStudentApology} to volunteer ${volunteer.id}`
    )
  })

  test('Should throw error if email sending fails', async () => {
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const session = buildSession({
      studentId: student.id,
      volunteerId: volunteer.id,
    })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)
    const errorMessage = 'Email sending failed'
    mockedSendVolunteerAbsentWarning.mockRejectedValueOnce(
      new Error(errorMessage)
    )

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailVolunteerAbsentWarning,
    } as Job<{ sessionId: Uuid }>

    await expect(emailVolunteerSessionActions(job)).rejects.toThrow(
      `Failed to email ${Jobs.EmailVolunteerAbsentWarning} to volunteer ${volunteer.id}: Error: ${errorMessage}`
    )
  })
})
