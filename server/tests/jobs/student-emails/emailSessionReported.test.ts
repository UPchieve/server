test.todo('postgres migration')
/*import mongoose from 'mongoose'
import { mocked } from 'jest-mock';

import { Jobs } from '../../../worker/jobs'
import { resetDb, insertSessionWithVolunteer } from '../../db-utils'
import EmailSessionReported from '../../../worker/jobs/student-emails/emailSessionReported'
import * as MailService from '../../../services/MailService'
import { SESSION_REPORT_REASON } from '../../../constants'
import { safeAsync } from '../../../utils/safe-async'

jest.mock('../../../services/MailService')
const mockedMailService = mocked(MailService, true)
jest.setTimeout(1000 * 15)

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await resetDb()
  await mongoose.connection.close()
})

describe('Session reported emails', () => {
  const errorMessage = 'error'
  const reportReason = SESSION_REPORT_REASON.STUDENT_RUDE
  const reportMessage = 'test message'
  let job: any

  beforeEach(async () => {
    jest.resetAllMocks()
  })

  beforeAll(async () => {
    const { session, student, volunteer } = await insertSessionWithVolunteer({
      isReported: true,
      reportReason,
      reportMessage,
    })
    const payload = {
      studentId: student._id.toString(),
      reportedBy: volunteer.email,
      reportReason,
      reportMessage,
      isBanReason: true,
      sessionId: session._id.toString(),
    }
    job = {
      name: Jobs.EmailSessionReported,
      data: payload,
    }
  })

  test('Success returns nothing', async () => {
    const { error } = await safeAsync(EmailSessionReported(job))

    expect(error).toBeUndefined()
  })

  test('Throws on banned user alert email failure', async () => {
    mockedMailService.sendBannedUserAlert.mockImplementation(async () => {
      throw new Error(errorMessage)
    })

    const { error } = await safeAsync(EmailSessionReported(job))

    expect(error).toBeDefined()
    expect((error as Error).message).toEqual(
      `Failed to send ban alert email: ${errorMessage}\n`
    )
  })

  test('Throws on create contact failure', async () => {
    mockedMailService.createContact.mockImplementation(async () => {
      throw new Error(errorMessage)
    })

    const { error } = await safeAsync(EmailSessionReported(job))

    expect(error).toBeDefined()
    expect((error as Error).message).toEqual(
      `Failed to add student ${job.data.studentId} to ban email group: ${errorMessage}\n`
    )
  })

  test('Throws on reported session alert email failure', async () => {
    mockedMailService.sendReportedSessionAlert.mockImplementation(async () => {
      throw new Error(errorMessage)
    })

    const { error } = await safeAsync(EmailSessionReported(job))

    expect(error).toBeDefined()
    expect((error as Error).message).toEqual(
      `Failed to send report alert email: ${errorMessage}\n`
    )
  })

  test('Throws on email to reported student failure', async () => {
    mockedMailService.sendStudentReported.mockImplementation(async () => {
      throw new Error(errorMessage)
    })

    const { error } = await safeAsync(EmailSessionReported(job))

    expect(error).toBeDefined()
    expect((error as Error).message).toEqual(
      `Failed to send student ${job.data.studentId} email for report: ${errorMessage}\n`
    )
  })
})
*/
