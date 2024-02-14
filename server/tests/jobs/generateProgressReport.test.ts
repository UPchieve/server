import { mocked } from 'jest-mock'
import generateProgressReport from '../../worker/jobs/generateProgressReport'
import * as ProgressReportsService from '../../services/ProgressReportsService'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import { Jobs } from '../../worker/jobs'
import * as SessionRepo from '../../models/Session'
import { buildProgressReport, buildSession } from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import { Job } from 'bull'
import { getSocket } from '../../worker/sockets'
import axios from 'axios'
import config from '../../config'

jest.mock('axios')
jest.mock('../../services/ProgressReportsService')
jest.mock('../../services/FeatureFlagService')
jest.mock('../../models/Session')

const mockedProgressReportsService = mocked(ProgressReportsService)
const mockedFeatureFlagService = mocked(FeatureFlagService)
const mockedSessionRepo = mocked(SessionRepo)

describe(Jobs.GenerateProgressReport, () => {
  let socketMock: any

  beforeEach(async () => {
    jest.resetAllMocks()
    socketMock = getSocket()
    mockedFeatureFlagService.getProgressReportsFeatureFlag.mockResolvedValue(
      true
    )
  })

  test('Should generate and send progress report for a single session and an overview progress report via socket', async () => {
    socketMock.connected = true
    const userId = getDbUlid()
    const session = await buildSession({
      studentId: userId,
      subject: 'reading',
      timeTutored: 1000 * 60,
    })
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

  test('Should let progress report errors bubble up for both single and group progress report analysis', async () => {
    socketMock.connected = true
    const session = await buildSession({
      studentId: getDbUlid(),
      subject: 'reading',
      timeTutored: 1000 * 60,
    })
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

  test('Should generate and send progress report for a single session and an overview progress report via http', async () => {
    socketMock.connected = false
    const userId = getDbUlid()
    const session = await buildSession({
      studentId: userId,
      subject: 'reading',
      timeTutored: 1000 * 60,
    })
    const job = {
      data: {
        sessionId: session.id,
      },
    }
    const reportOne = buildProgressReport()
    const reportTwo = buildProgressReport()
    const url = `http://localhost:3000/api/webhooks/progress-reports/processed`
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
    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      url,
      {
        userId,
        sessionId: session.id,
        subject: session.subject,
        report: reportOne,
      },
      {
        headers: { 'x-api-key': config.subwayApiCredentials },
      }
    )
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      url,
      {
        userId,
        subject: session.subject,
        report: reportTwo,
      },
      {
        headers: { 'x-api-key': config.subwayApiCredentials },
      }
    )
  })

  test('Should early exit if not a reading session', async () => {
    const session = await buildSession({
      studentId: getDbUlid(),
      subject: 'algebraOne',
    })
    const job = {
      data: {
        sessionId: session.id,
      },
    }
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)

    await generateProgressReport(job as Job)
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledTimes(0)
  })

  test('Should early exit if feature flag is false', async () => {
    const session = await buildSession({
      studentId: getDbUlid(),
      subject: 'reading',
      timeTutored: 1000 * 60,
    })
    const job = {
      data: {
        sessionId: session.id,
      },
    }

    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedFeatureFlagService.getProgressReportsFeatureFlag.mockResolvedValue(
      false
    )

    await generateProgressReport(job as Job)
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledTimes(0)
  })

  test('Should early exit if time tutored is not greater than session length', async () => {
    const session = await buildSession({
      studentId: getDbUlid(),
      subject: 'reading',
    })
    const job = {
      data: {
        sessionId: session.id,
      },
    }

    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)

    await generateProgressReport(job as Job)
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledTimes(0)
  })
})
