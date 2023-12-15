import { mocked } from 'jest-mock'
import {
  generateProgressReportForUser,
  getSessionsToAnalyzeForProgressReport,
  saveProgressReport,
} from '../../services/ProgressReportsService'
import { Ulid, getDbUlid } from '../../models/pgUtils'
import * as BotsService from '../../services/BotsService'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as ProgressReportsRepo from '../../models/ProgressReports'
import * as SessionRepo from '../../models/Session'
import {
  buildProgressReport,
  buildUserSession,
  buildMessageForFrontend,
} from '../mocks/generate'
import { logError } from '../../logger'
import { EVENTS } from '../../constants'

jest.mock('../../services/BotsService')
jest.mock('../../services/AnalyticsService')
jest.mock('../../models/ProgressReports')
jest.mock('../../models/Session')
jest.mock('../../logger')

const mockedBotsService = mocked(BotsService)
const mockedProgressReportsRepo = mocked(ProgressReportsRepo)
const mockedSessionRepo = mocked(SessionRepo)

const userId: Ulid = getDbUlid()
const sessionId: Ulid = getDbUlid()
const mockedProgressReport = buildProgressReport()

beforeEach(() => {
  jest.clearAllMocks()
})

describe('saveProgressReport', () => {
  test(`Should save the progress report for 'single' session analysis`, async () => {
    const reportId = getDbUlid()
    const reportSummaryId = getDbUlid()
    const reportTopicId = getDbUlid()

    mockedProgressReportsRepo.insertProgressReport.mockResolvedValueOnce(
      reportId
    )
    mockedProgressReportsRepo.insertProgressReportSummary.mockResolvedValueOnce(
      reportSummaryId
    )
    mockedProgressReportsRepo.insertProgressReportTopic.mockResolvedValueOnce(
      reportTopicId
    )

    await saveProgressReport(userId, [sessionId], mockedProgressReport)
    expect(mockedProgressReportsRepo.insertProgressReport).toHaveBeenCalledWith(
      userId,
      'pending'
    )

    expect(
      mockedProgressReportsRepo.insertProgressReportSession
    ).toHaveBeenCalledWith(reportId, sessionId, 'single', expect.anything())
    expect(
      mockedProgressReportsRepo.insertProgressReportSummary
    ).toHaveBeenCalledWith(
      reportId,
      mockedProgressReport.summary,
      expect.anything()
    )
    for (const detail of mockedProgressReport.summary.details) {
      expect(
        mockedProgressReportsRepo.insertProgressReportSummaryDetail
      ).toHaveBeenCalledWith(reportSummaryId, detail, expect.anything())
    }
    for (const topic of mockedProgressReport.topics) {
      expect(
        mockedProgressReportsRepo.insertProgressReportTopic
      ).toHaveBeenCalledWith(reportId, topic, expect.anything())
      for (const detail of topic.details) {
        expect(
          mockedProgressReportsRepo.insertProgressReportTopicDetail
        ).toHaveBeenCalledWith(reportTopicId, detail, expect.anything())
      }
    }
    expect(
      mockedProgressReportsRepo.updateProgressReportStatus
    ).toHaveBeenCalledWith(reportId, 'complete')
  })

  // TODO: Refactor this and the `single` group test since both are similar
  test(`Should save the progress report for 'group' session analysis`, async () => {
    const reportId = getDbUlid()
    const reportSummaryId = getDbUlid()
    const reportTopicId = getDbUlid()
    const sessionIds = [sessionId, getDbUlid(), getDbUlid()]

    mockedProgressReportsRepo.insertProgressReport.mockResolvedValueOnce(
      reportId
    )
    mockedProgressReportsRepo.insertProgressReportSummary.mockResolvedValueOnce(
      reportSummaryId
    )
    mockedProgressReportsRepo.insertProgressReportTopic.mockResolvedValueOnce(
      reportTopicId
    )

    await saveProgressReport(userId, sessionIds, mockedProgressReport)
    expect(mockedProgressReportsRepo.insertProgressReport).toHaveBeenCalledWith(
      userId,
      'pending'
    )

    expect(
      mockedProgressReportsRepo.insertProgressReportSession
    ).toHaveBeenCalledWith(reportId, sessionId, 'group', expect.anything())
    expect(
      mockedProgressReportsRepo.insertProgressReportSummary
    ).toHaveBeenCalledWith(
      reportId,
      mockedProgressReport.summary,
      expect.anything()
    )
    for (const detail of mockedProgressReport.summary.details) {
      expect(
        mockedProgressReportsRepo.insertProgressReportSummaryDetail
      ).toHaveBeenCalledWith(reportSummaryId, detail, expect.anything())
    }
    for (const topic of mockedProgressReport.topics) {
      expect(
        mockedProgressReportsRepo.insertProgressReportTopic
      ).toHaveBeenCalledWith(reportId, topic, expect.anything())
      for (const detail of topic.details) {
        expect(
          mockedProgressReportsRepo.insertProgressReportTopicDetail
        ).toHaveBeenCalledWith(reportTopicId, detail, expect.anything())
      }
    }
    expect(
      mockedProgressReportsRepo.updateProgressReportStatus
    ).toHaveBeenCalledWith(reportId, 'complete')
  })

  test('Update progress report status to error if progress report processing started', async () => {
    const reportId = getDbUlid()
    const error = new Error('Test error')
    mockedProgressReportsRepo.insertProgressReport.mockResolvedValueOnce(
      reportId
    )
    mockedProgressReportsRepo.insertProgressReportSession.mockRejectedValueOnce(
      error
    )

    await expect(
      saveProgressReport(userId, [sessionId], mockedProgressReport)
    ).rejects.toThrow()
    expect(
      mockedProgressReportsRepo.updateProgressReportStatus
    ).toHaveBeenCalledWith(reportId, 'error')
    expect(logError).toHaveBeenCalledWith(error)
  })
})

describe('getSessionsToAnalyzeForProgressReport', () => {
  function setupMocks(
    sessions: SessionRepo.UserSessions[],
    messages: SessionRepo.MessageForFrontend[],
    error?: Error
  ) {
    mockedSessionRepo.getUserSessionsByUserId.mockResolvedValue(sessions)
    if (error) {
      mockedSessionRepo.getMessagesForFrontend.mockRejectedValueOnce(error)
    } else {
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValue(messages)
    }
  }

  const createSessionsWithMessages = (sessions: SessionRepo.UserSessions[]) => {
    return sessions.map(session => ({
      ...session,
      ...buildMessageForFrontend({ user: userId }),
    }))
  }

  test('Should get user sessions with messages', async () => {
    const sessions = [
      buildUserSession({
        id: sessionId,
        studentId: userId,
        volunteerId: getDbUlid(),
      }),
    ]
    const sessionsWithMessages = createSessionsWithMessages(sessions)
    setupMocks(sessions, sessionsWithMessages)

    const result = await getSessionsToAnalyzeForProgressReport(
      userId,
      sessionId
    )
    expect(result).toHaveLength(1)
    expect(mockedSessionRepo.getUserSessionsByUserId).toHaveBeenCalledWith(
      userId,
      {
        subject: 'reading',
        sessionId: expect.anything(),
      }
    )
    expect(mockedSessionRepo.getMessagesForFrontend).toHaveBeenCalled()
  })

  test('Should properly skip over sessions that have not been matched with volunteers', async () => {
    const sessions = [
      buildUserSession({
        id: sessionId,
        studentId: userId,
        volunteerId: getDbUlid(),
      }),
      // Not matched session
      buildUserSession({ id: sessionId, studentId: userId }),
      buildUserSession({
        id: sessionId,
        studentId: userId,
        volunteerId: getDbUlid(),
      }),
    ]
    const sessionsWithMessages = createSessionsWithMessages(sessions)
    setupMocks(sessions, sessionsWithMessages)

    const result = await getSessionsToAnalyzeForProgressReport(
      userId,
      sessionId
    )
    expect(result).toHaveLength(2)
    expect(mockedSessionRepo.getUserSessionsByUserId).toHaveBeenCalledWith(
      userId,
      {
        subject: 'reading',
        sessionId: expect.anything(),
      }
    )
    expect(mockedSessionRepo.getMessagesForFrontend).toHaveBeenCalled()
  })

  test('Should log error if error thrown when retrieving session messages', async () => {
    const sessions = [
      buildUserSession({
        id: sessionId,
        studentId: userId,
        volunteerId: getDbUlid(),
      }),
    ]
    const error = new Error('Test')
    setupMocks(sessions, [], error)

    await getSessionsToAnalyzeForProgressReport(userId, sessionId)
    expect(logError).toHaveBeenCalledWith(error)
  })
})

describe('generateProgressReportForUser', () => {
  test('Should generate and save a progress report', async () => {
    mockedBotsService.generateProgressReport.mockResolvedValue(
      mockedProgressReport
    )
    mockedProgressReportsRepo.insertProgressReport.mockResolvedValue(
      getDbUlid()
    )

    const report = await generateProgressReportForUser(userId, sessionId)
    expect(report).toEqual(mockedProgressReport)
    expect(mockedBotsService.generateProgressReport).toHaveBeenCalled()
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      userId,
      EVENTS.SCORECASTER_ANALYSIS_COMPLETED,
      expect.anything()
    )
    // Use this as a proxy to tell if saveProgressReport was called
    expect(mockedProgressReportsRepo.insertProgressReport).toHaveBeenCalledWith(
      userId,
      'pending'
    )
  })
})
