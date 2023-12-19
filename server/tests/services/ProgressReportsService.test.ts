import { mocked } from 'jest-mock'
import * as ProgressReportsService from '../../services/ProgressReportsService'
import { Ulid, getDbUlid, getUuid } from '../../models/pgUtils'
import * as BotsService from '../../services/BotsService'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as ProgressReportsRepo from '../../models/ProgressReports'
import * as SessionRepo from '../../models/Session'
import {
  buildProgressReport,
  buildUserSession,
  buildMessageForFrontend,
  buildProgressReportSummaryRow,
  buildProgressReportTopicRow,
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
const session = buildUserSession({
  studentId: userId,
  volunteerId: getDbUlid(),
})
const mockedProgressReport = buildProgressReport()

beforeEach(() => {
  jest.clearAllMocks()
})

function createSessionsWithMessages(sessions: SessionRepo.UserSessions[]) {
  return sessions.map(session => ({
    ...session,
    messages: [{ ...buildMessageForFrontend({ user: userId }) }],
  }))
}

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

    await ProgressReportsService.saveProgressReport(
      userId,
      [session.id],
      mockedProgressReport
    )
    expect(mockedProgressReportsRepo.insertProgressReport).toHaveBeenCalledWith(
      userId,
      'pending'
    )

    expect(
      mockedProgressReportsRepo.insertProgressReportSession
    ).toHaveBeenCalledWith(reportId, session.id, 'single', expect.anything())
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
    const sessionIds = [session.id, getDbUlid(), getDbUlid()]

    mockedProgressReportsRepo.insertProgressReport.mockResolvedValueOnce(
      reportId
    )
    mockedProgressReportsRepo.insertProgressReportSummary.mockResolvedValueOnce(
      reportSummaryId
    )
    mockedProgressReportsRepo.insertProgressReportTopic.mockResolvedValueOnce(
      reportTopicId
    )

    await ProgressReportsService.saveProgressReport(
      userId,
      sessionIds,
      mockedProgressReport
    )
    expect(mockedProgressReportsRepo.insertProgressReport).toHaveBeenCalledWith(
      userId,
      'pending'
    )

    expect(
      mockedProgressReportsRepo.insertProgressReportSession
    ).toHaveBeenCalledWith(reportId, session.id, 'group', expect.anything())
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
      ProgressReportsService.saveProgressReport(
        userId,
        [session.id],
        mockedProgressReport
      )
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

  test('Should get user sessions with messages', async () => {
    const sessions = [session]
    const sessionsWithMessages = createSessionsWithMessages(sessions)
    mockedSessionRepo.getUserSessionsByUserId.mockResolvedValue(sessions)
    mockedSessionRepo.getMessagesForFrontend.mockImplementation(
      (sessionId: Ulid) => {
        const session = sessionsWithMessages.find(s => s.id === sessionId)
        return Promise.resolve(session ? session.messages : [])
      }
    )

    const result = await ProgressReportsService.getSessionsToAnalyzeForProgressReport(
      userId,
      {
        sessionId: session.id,
        subject: session.subjectName,
      }
    )
    expect(result).toHaveLength(1)
    expect(mockedSessionRepo.getUserSessionsByUserId).toHaveBeenCalledWith(
      userId,
      {
        subject: session.subjectName,
        sessionId: session.id,
      }
    )
    expect(mockedSessionRepo.getMessagesForFrontend).toHaveBeenCalled()
  })

  test('Should properly skip over sessions that have not been matched with volunteers', async () => {
    const subject = 'algebraOne'
    const sessions = [
      buildUserSession({
        studentId: userId,
        volunteerId: getDbUlid(),
        subjectName: subject,
      }),
      // Not matched session
      buildUserSession({ studentId: userId, subjectName: subject }),
      buildUserSession({
        studentId: userId,
        volunteerId: getDbUlid(),
        subjectName: subject,
      }),
    ]
    const sessionsWithMessages = createSessionsWithMessages(sessions)
    mockedSessionRepo.getUserSessionsByUserId.mockResolvedValue(sessions)
    mockedSessionRepo.getMessagesForFrontend.mockImplementation(
      (sessionId: Ulid) => {
        const session = sessionsWithMessages.find(s => s.id === sessionId)
        return Promise.resolve(session ? session.messages : [])
      }
    )

    const result = await ProgressReportsService.getSessionsToAnalyzeForProgressReport(
      userId,
      {
        subject,
      }
    )
    expect(result).toHaveLength(2)
    expect(mockedSessionRepo.getUserSessionsByUserId).toHaveBeenCalledWith(
      userId,
      {
        subject,
      }
    )
    expect(mockedSessionRepo.getMessagesForFrontend).toHaveBeenCalled()
  })

  test('Should log error if error thrown when retrieving session messages', async () => {
    const sessions = [session]
    const error = new Error('Test')
    setupMocks(sessions, [], error)

    await ProgressReportsService.getSessionsToAnalyzeForProgressReport(userId, {
      sessionId: session.id,
      subject: session.subjectName,
    })
    expect(logError).toHaveBeenCalledWith(error)
  })
})

describe('generateProgressReportForUser', () => {
  // This test is following bad design for a unit test. We cannot mock
  // other functions inside the same service, so we're using the actual
  // implementation of ProgressReportsService.getProgressReportSummaryAndTopics
  // to get values back
  test('Should generate and save a progress report', async () => {
    const reportId = getUuid()
    const summaryRow = buildProgressReportSummaryRow()
    const topicRow = buildProgressReportTopicRow()
    mockedProgressReportsRepo.getProgressReportSummariesForMany.mockResolvedValue(
      [summaryRow]
    )
    mockedProgressReportsRepo.getProgressReportTopicsByReportId.mockResolvedValue(
      [topicRow]
    )
    const {
      summary,
      topics,
    } = await ProgressReportsService.getProgressReportSummaryAndTopics(reportId)
    const progressReport = buildProgressReport({
      id: reportId,
      summary,
      topics,
    })
    mockedBotsService.generateProgressReport.mockResolvedValue(progressReport)
    mockedProgressReportsRepo.insertProgressReport.mockResolvedValue(reportId)
    mockedProgressReportsRepo.getProgressReportByReportId.mockResolvedValueOnce(
      progressReport
    )

    const report = await ProgressReportsService.generateProgressReportForUser(
      userId,
      {
        sessionId: session.id,
        subject: session.subjectName,
      }
    )
    expect(report).toEqual(progressReport)
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
