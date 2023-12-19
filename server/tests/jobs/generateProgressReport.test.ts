import { mocked } from 'jest-mock'
import generateProgressReport from '../../worker/jobs/generateProgressReport'
import * as ProgressReportsService from '../../services/ProgressReportsService'
import { Jobs } from '../../worker/jobs'
import * as SessionRepo from '../../models/Session'
import { buildProgressReport, buildSession } from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import { Job } from 'bull'
import { getSocket } from '../../worker/sockets'

jest.mock('../../services/ProgressReportsService')
jest.mock('../../models/Session')

const mockedProgressReportsService = mocked(ProgressReportsService)
const mockedSessionRepo = mocked(SessionRepo)

describe(Jobs.GenerateProgressReport, () => {
  let socketMock: any

  beforeEach(async () => {
    jest.resetAllMocks()
    socketMock = getSocket()
  })

  test('Should generate a progress report for a single session and an overview progress report', async () => {
    const userId = getDbUlid()
    const session = await buildSession({ studentId: userId, subject: '' })
    const job = {
      data: {
        sessionId: session.id,
      },
    }
    const reportOne = buildProgressReport()
    const reportTwo = buildProgressReport()
    // Mock the return value twice for double execution of a single and group analysis
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      reportOne
    )
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      reportTwo
    )
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)

    await generateProgressReport(job as Job)
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledTimes(2)
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledWith(session.studentId, {
      subject: session.subject,
      sessionId: session.id,
    })
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledWith(session.studentId, { subject: session.subject })
    expect(socketMock.emit).toHaveBeenCalledTimes(2)
    expect(socketMock.emit).toHaveBeenNthCalledWith(
      1,
      'progress-report:processed',
      {
        userId,
        sessionId: session.id,
        subject: session.subject,
        report: reportOne,
      }
    )
    expect(socketMock.emit).toHaveBeenNthCalledWith(
      2,
      'progress-report:processed',
      {
        userId,
        subject: session.subject,
        report: reportTwo,
      }
    )
  })

  test('Should let errors bubble up for both single and group progress report analysis', async () => {
    const session = await buildSession({ studentId: getDbUlid() })
    const job = {
      data: {
        sessionId: session.id,
      },
    }
    const errorMessageOne = 'Error one'
    const errorOne = `Error in single session report: ${errorMessageOne}`
    const errorMessageTwo = 'Error two'
    const errorTwo = `Error in group session report: ${errorMessageTwo}`
    const expectedErrors = [errorOne, errorTwo]
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedProgressReportsService.generateProgressReportForUser.mockRejectedValueOnce(
      errorMessageOne
    )
    mockedProgressReportsService.generateProgressReportForUser.mockRejectedValueOnce(
      errorMessageTwo
    )

    await expect(generateProgressReport(job as Job)).rejects.toThrow(
      expectedErrors.join('\n')
    )
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledTimes(2)
  })
})
