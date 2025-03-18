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
import emailStudentSessionActions from '../../../worker/jobs/student-emails/emailStudentSessionActions'

jest.mock('../../../models/Session')
jest.mock('../../../models/Student/queries')
jest.mock('../../../models/Volunteer/queries')
jest.mock('../../../services/NotificationService')
jest.mock('../../../services/MailService')
jest.mock('../../../worker/logger')

const mockedGetSessionById = mocked(getSessionById)
const mockedGetStudentContactInfoById = mocked(getStudentContactInfoById)
const mockedGetVolunteerContactInfoById = mocked(getVolunteerContactInfoById)
const mockedHasUserBeenSentEmail = mocked(hasUserBeenSentEmail)
const mockedCreateEmailNotification = mocked(createEmailNotification)
const mockedSendStudentAbsentWarning = mocked(
  MailService.sendStudentAbsentWarning
)
const mockedSendStudentAbsentVolunteerApology = mocked(
  MailService.sendStudentAbsentVolunteerApology
)
const mockedSendStudentUnmatchedApology = mocked(
  MailService.sendStudentUnmatchedApology
)
const mockedSendOnlyLookingForAnswersWarning = mocked(
  MailService.sendOnlyLookingForAnswersWarning
)

describe('emailStudentSessionActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should early exit if no student found', async () => {
    const session = buildSession({ studentId: getUuid() })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailStudentAbsentWarning,
    } as Job<{ sessionId: Uuid }>
    await emailStudentSessionActions(job)

    expect(mockedGetSessionById).toHaveBeenCalledWith(session.id)
    expect(mockedGetStudentContactInfoById).toHaveBeenCalledWith(
      session.studentId
    )
    expect(log).toHaveBeenCalledWith(
      `No student found with id ${session.studentId}`
    )
    expect(mockedSendStudentAbsentWarning).not.toHaveBeenCalled()
  })

  test('Should exit if email template is not found', async () => {
    const student = buildStudent()
    const session = buildSession({ studentId: student.id })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)

    const job = {
      data: { sessionId: session.id },
      name: 'TestJob',
    } as Job<{ sessionId: Uuid }>
    await emailStudentSessionActions(job)

    expect(log).toHaveBeenCalledWith(
      `No email template id found for ${job.name}`
    )
    expect(mockedSendStudentAbsentWarning).not.toHaveBeenCalled()
    expect(mockedSendStudentAbsentVolunteerApology).not.toHaveBeenCalled()
    expect(mockedSendStudentUnmatchedApology).not.toHaveBeenCalled()
    expect(mockedSendOnlyLookingForAnswersWarning).not.toHaveBeenCalled()
  })

  test('Should exit if student has already received email', async () => {
    const student = buildStudent()
    const session = buildSession({ studentId: student.id })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(true)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailStudentAbsentWarning,
    } as Job<{ sessionId: Uuid }>
    await emailStudentSessionActions(job)

    expect(mockedHasUserBeenSentEmail).toHaveBeenCalledWith({
      userId: student.id,
      emailTemplateId: config.sendgrid.studentAbsentWarningTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Student ${student.id} has already received ${Jobs.EmailStudentAbsentWarning} for session ${session.id}`
    )
    expect(mockedSendStudentAbsentWarning).not.toHaveBeenCalled()
  })

  test('Should send email EmailStudentAbsentWarning', async () => {
    const student = buildStudent()
    const session = buildSession({ studentId: student.id })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSendStudentAbsentWarning.mockResolvedValueOnce(undefined)
    mockedCreateEmailNotification.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailStudentAbsentWarning,
    } as Job<{ sessionId: Uuid }>
    await emailStudentSessionActions(job)

    expect(mockedSendStudentAbsentWarning).toHaveBeenCalledWith(
      student.email,
      student.firstName
    )
    expect(mockedCreateEmailNotification).toHaveBeenCalledWith({
      userId: student.id,
      sessionId: session.id,
      emailTemplateId: config.sendgrid.studentAbsentWarningTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Emailed ${Jobs.EmailStudentAbsentWarning} to student ${session.studentId}`
    )
  })

  test('Should send email EmailStudentAbsentVolunteerApology', async () => {
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const session = buildSession({
      studentId: student.id,
      volunteerId: volunteer.id,
    })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedGetVolunteerContactInfoById.mockResolvedValueOnce(volunteer)
    mockedSendStudentAbsentVolunteerApology.mockResolvedValueOnce(undefined)
    mockedCreateEmailNotification.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailStudentAbsentVolunteerApology,
    } as Job<{ sessionId: Uuid }>
    await emailStudentSessionActions(job)

    expect(mockedSendStudentAbsentVolunteerApology).toHaveBeenCalledWith(
      student.firstName,
      student.email,
      volunteer.firstName,
      session.subjectDisplayName,
      moment(session.createdAt).format('MMMM Do')
    )
    expect(mockedCreateEmailNotification).toHaveBeenCalledWith({
      userId: student.id,
      sessionId: session.id,
      emailTemplateId: config.sendgrid.studentAbsentVolunteerApologyTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Emailed ${Jobs.EmailStudentAbsentVolunteerApology} to student ${session.studentId}`
    )
  })

  test('Should send email EmailStudentUnmatchedApology', async () => {
    const student = buildStudent()
    const session = buildSession({ studentId: student.id })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSendStudentUnmatchedApology.mockResolvedValueOnce(undefined)
    mockedCreateEmailNotification.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailStudentUnmatchedApology,
    } as Job<{ sessionId: Uuid }>
    await emailStudentSessionActions(job)

    expect(mockedSendStudentUnmatchedApology).toHaveBeenCalledWith(
      student.firstName,
      student.email,
      session.subjectDisplayName,
      moment(session.createdAt).format('MMMM Do')
    )
    expect(mockedCreateEmailNotification).toHaveBeenCalledWith({
      userId: student.id,
      sessionId: session.id,
      emailTemplateId: config.sendgrid.studentUnmatchedApologyTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Emailed ${Jobs.EmailStudentUnmatchedApology} to student ${session.studentId}`
    )
  })

  test('Should send email EmailStudentOnlyLookingForAnswers', async () => {
    const student = buildStudent()
    const session = buildSession({ studentId: student.id })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    mockedSendOnlyLookingForAnswersWarning.mockResolvedValueOnce(undefined)
    mockedCreateEmailNotification.mockResolvedValueOnce(undefined)

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailStudentOnlyLookingForAnswers,
    } as Job<{ sessionId: Uuid }>
    await emailStudentSessionActions(job)

    expect(mockedSendOnlyLookingForAnswersWarning).toHaveBeenCalledWith(
      student.firstName,
      student.email
    )
    expect(mockedCreateEmailNotification).toHaveBeenCalledWith({
      userId: student.id,
      sessionId: session.id,
      emailTemplateId: config.sendgrid.studentOnlyLookingForAnswersTemplate,
    })
    expect(log).toHaveBeenCalledWith(
      `Emailed ${Jobs.EmailStudentOnlyLookingForAnswers} to student ${session.studentId}`
    )
  })

  test('Should throw error if email sending fails', async () => {
    const student = buildStudent()
    const session = buildSession({ studentId: student.id })
    mockedGetSessionById.mockResolvedValueOnce(session)
    mockedGetStudentContactInfoById.mockResolvedValueOnce(student)
    mockedHasUserBeenSentEmail.mockResolvedValueOnce(false)
    const errorMessage = 'Email sending failed'
    mockedSendStudentAbsentWarning.mockRejectedValueOnce(
      new Error(errorMessage)
    )

    const job = {
      data: { sessionId: session.id },
      name: Jobs.EmailStudentAbsentWarning,
    } as Job<{ sessionId: Uuid }>
    await expect(emailStudentSessionActions(job)).rejects.toThrow(
      `Failed to email ${Jobs.EmailStudentAbsentWarning} to student ${session.studentId}: Error: ${errorMessage}`
    )
  })
})
