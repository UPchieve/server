import { mocked } from 'jest-mock'
import generateProgressReport from '../../worker/jobs/generateProgressReport'
import * as ProgressReportsService from '../../services/ProgressReportsService'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import { Jobs } from '../../worker/jobs'
import * as SessionRepo from '../../models/Session'
import { buildProgressReport, buildSession } from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import { Job } from 'bull'
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
  beforeEach(async () => {
    jest.resetAllMocks()
    jest.clearAllMocks()
    mockedFeatureFlagService.getProgressReportsFeatureFlag.mockResolvedValue(
      true
    )
  })

  test('Should let progress report errors bubble up for both single and group progress report analysis', async () => {
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
    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      true
    )
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
    const userId = getDbUlid()
    const session = buildSession({
      studentId: userId,
      subject: 'reading',
      timeTutored: 1000 * 60,
      endedAt: new Date(),
    })
    const job = {
      data: {
        sessionId: session.id,
      },
    }
    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      true
    )
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
      analysisType: 'single',
    })
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledWith(session.studentId, {
      subject: session.subject,
      end: session.endedAt,
      analysisType: 'group',
    })
    expect(axios.post).toHaveBeenCalledTimes(2)
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      url,
      {
        userId,
        sessionId: session.id,
        subject: session.subject,
        report: reportOne,
        analysisType: 'single',
      },
      {
        headers: { 'x-api-key': config.subwayApiCredentials },
        timeout: 3000,
      }
    )
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      url,
      {
        userId,
        subject: session.subject,
        report: reportTwo,
        analysisType: 'group',
        end: expect.anything(),
      },
      {
        headers: { 'x-api-key': config.subwayApiCredentials },
        timeout: 3000,
      }
    )
  })

  test('Should early exit if no prompt for subject session', async () => {
    const session = await buildSession({ studentId: getDbUlid() })
    const job = {
      data: {
        sessionId: session.id,
      },
    }
    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      false
    )
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

    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      true
    )
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
