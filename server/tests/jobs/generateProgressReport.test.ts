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
import logger from '../../logger'
import * as sessionUtils from '../../utils/session-utils'

jest.mock('axios')
jest.mock('../../services/ProgressReportsService')
jest.mock('../../services/FeatureFlagService')
jest.mock('../../models/Session')
jest.mock('../../logger')
jest.mock('../../utils/session-utils')

const mockedProgressReportsService = mocked(ProgressReportsService)
const mockedFeatureFlagService = mocked(FeatureFlagService)
const mockedSessionRepo = mocked(SessionRepo)
const mockedSessionUtils = mocked(sessionUtils)

describe(Jobs.GenerateProgressReport, () => {
  beforeEach(async () => {
    jest.resetAllMocks()
    jest.clearAllMocks()
    mockedFeatureFlagService.getProgressReportsFeatureFlag.mockResolvedValue(
      true
    )
  })

  test('Should let progress report errors bubble up for progress report analysis', async () => {
    const session = await buildSession({
      studentId: getDbUlid(),
      subject: 'reading',
      timeTutored: 1000 * 60,
      toolType: 'documenteditor',
    })
    const job = {
      data: {
        sessionId: session.id,
      },
    }

    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedSessionUtils.isSubjectUsingDocumentEditor.mockReturnValueOnce(true)
    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      true
    )
    mockedProgressReportsService.generateProgressReportForUser.mockRejectedValueOnce(
      new Error()
    )

    await expect(generateProgressReport(job as Job)).rejects.toThrow(Error)
  })

  test('Should generate and send progress report for a single session and an overview progress report via http', async () => {
    const userId = getDbUlid()
    const session = buildSession({
      studentId: userId,
      subject: 'reading',
      timeTutored: 1000 * 60,
      endedAt: new Date(),
      toolType: 'documenteditor',
    })
    const job = {
      data: {
        sessionId: session.id,
      },
    }
    const singleProgressReport = buildProgressReport()
    const groupProgressReport = buildProgressReport()
    const url = `http://localhost:3000/api/webhooks/progress-reports/processed`

    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      true
    )
    mockedSessionUtils.isSubjectUsingDocumentEditor.mockReturnValueOnce(true)
    // Mock the return value twice for double execution of a single and group analysis
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      singleProgressReport
    )
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      groupProgressReport
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
    expect(axios.post).toHaveBeenCalledTimes(1)
    expect(axios.post).toHaveBeenCalledWith(
      url,
      {
        userId,
        subject: session.subject,
        report: groupProgressReport,
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

  test('Should early exit if STEM subject is active and flag for processing STEM is not active', async () => {
    const session = await buildSession({
      studentId: getDbUlid(),
      subject: 'algebraOne',
      timeTutored: 1000 * 60,
      toolType: 'whiteboard',
    })
    const job = {
      data: {
        sessionId: session.id,
      },
    }
    const isStemProgressReportEnabled = false

    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      true
    )
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedFeatureFlagService.getStemProgressReportEnabled.mockResolvedValue(
      isStemProgressReportEnabled
    )

    await generateProgressReport(job as Job)
    expect(logger.info).toHaveBeenCalledWith(
      {
        isStemProgressReportEnabled,
        sessionId: session.id,
        subject: session.subject,
        userId: session.studentId,
      },
      'STEM Progress Report processing not enabled for user'
    )
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledTimes(0)
  })

  test('Should early exit if feature flag is false', async () => {
    const session = await buildSession({
      studentId: getDbUlid(),
      subject: 'reading',
      timeTutored: 1000 * 60,
      toolType: 'documenteditor',
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
      toolType: 'documenteditor',
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

  test('Should generate reports if STEM subject is active and STEM processing is enabled', async () => {
    const userId = getDbUlid()
    const session = await buildSession({
      studentId: userId,
      subject: 'algebraOne',
      timeTutored: 1000 * 60,
      endedAt: new Date(),
      toolType: 'whiteboard',
    })
    const job = { data: { sessionId: session.id } }
    const singleProgressReport = null
    const groupProgressReport = buildProgressReport()

    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      true
    )
    mockedFeatureFlagService.getStemProgressReportEnabled.mockResolvedValueOnce(
      true
    )
    mockedSessionUtils.isSubjectUsingDocumentEditor.mockReturnValueOnce(false)
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      singleProgressReport
    )
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      groupProgressReport
    )

    await generateProgressReport(job as Job)
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledTimes(2)
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenNthCalledWith(1, session.studentId, {
      subject: session.subject,
      sessionId: session.id,
      analysisType: 'single',
    })
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenNthCalledWith(2, session.studentId, {
      subject: session.subject,
      end: session.endedAt,
      analysisType: 'group',
    })
  })

  test('Should not send progress report via http if group report is null', async () => {
    const userId = getDbUlid()
    const session = buildSession({
      studentId: userId,
      subject: 'reading',
      timeTutored: 1000 * 60,
      endedAt: new Date(),
      toolType: 'documenteditor',
    })
    const job = { data: { sessionId: session.id } }
    const singleProgressReport = null
    const groupProgressReport = null

    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      true
    )
    mockedSessionUtils.isSubjectUsingDocumentEditor.mockReturnValueOnce(true)
    // Single analysis still runs, regardless of return value
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      singleProgressReport
    )
    // Group analysis returns null
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      groupProgressReport
    )

    await generateProgressReport(job as Job)
    expect(
      mockedProgressReportsService.generateProgressReportForUser
    ).toHaveBeenCalledTimes(2)
    expect(axios.post).toHaveBeenCalledTimes(0)
  })

  test('Should throw if sending the group progress report via http fails', async () => {
    const userId = getDbUlid()
    const session = buildSession({
      studentId: userId,
      subject: 'reading',
      timeTutored: 1000 * 60,
      endedAt: new Date(),
      toolType: 'documenteditor',
    })
    const job = { data: { sessionId: session.id } }
    const singleProgressReport = null
    const groupProgressReport = buildProgressReport()
    const error = 'Network error'

    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedProgressReportsService.hasActiveSubjectPrompt.mockResolvedValueOnce(
      true
    )
    mockedSessionUtils.isSubjectUsingDocumentEditor.mockReturnValueOnce(true)
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      singleProgressReport
    )
    mockedProgressReportsService.generateProgressReportForUser.mockResolvedValueOnce(
      groupProgressReport
    )
    ;(axios.post as jest.Mock).mockRejectedValueOnce(new Error(error))

    await expect(generateProgressReport(job as Job)).rejects.toThrow(error)
  })
})
