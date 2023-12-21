import { mocked } from 'jest-mock'
import {
  generateProgressReportForUser,
  getSessionsToAnalyzeForProgressReport,
  saveProgressReport,
} from '../../services/ProgressReportsService'
import { Ulid, getDbUlid } from '../../models/pgUtils'
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
import { openai } from '../../services/BotsService'

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({}),
        },
      },
    }
  })
})

jest.mock('../../services/AnalyticsService')
jest.mock('../../models/ProgressReports')
jest.mock('../../models/Session')
jest.mock('../../logger')

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
    const reportConceptId = getDbUlid()

    mockedProgressReportsRepo.insertProgressReport.mockResolvedValueOnce(
      reportId
    )
    mockedProgressReportsRepo.insertProgressReportSummary.mockResolvedValueOnce(
      reportSummaryId
    )
    mockedProgressReportsRepo.insertProgressReportConcept.mockResolvedValueOnce(
      reportConceptId
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
    for (const concept of mockedProgressReport.concepts) {
      expect(
        mockedProgressReportsRepo.insertProgressReportConcept
      ).toHaveBeenCalledWith(reportId, concept, expect.anything())
      for (const detail of concept.details) {
        expect(
          mockedProgressReportsRepo.insertProgressReportConceptDetail
        ).toHaveBeenCalledWith(reportConceptId, detail, expect.anything())
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
    const reportConceptId = getDbUlid()
    const sessionIds = [sessionId, getDbUlid(), getDbUlid()]

    mockedProgressReportsRepo.insertProgressReport.mockResolvedValueOnce(
      reportId
    )
    mockedProgressReportsRepo.insertProgressReportSummary.mockResolvedValueOnce(
      reportSummaryId
    )
    mockedProgressReportsRepo.insertProgressReportConcept.mockResolvedValueOnce(
      reportConceptId
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
    for (const concept of mockedProgressReport.concepts) {
      expect(
        mockedProgressReportsRepo.insertProgressReportConcept
      ).toHaveBeenCalledWith(reportId, concept, expect.anything())
      for (const detail of concept.details) {
        expect(
          mockedProgressReportsRepo.insertProgressReportConceptDetail
        ).toHaveBeenCalledWith(reportConceptId, detail, expect.anything())
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
    // This is hacky. There should be a proper mock for this
    // This uses the types defined in OpenAI
    jest.spyOn(openai.chat.completions, 'create').mockResolvedValue({
      id: getDbUlid(),
      choices: [
        {
          message: {
            content: JSON.stringify(mockedProgressReport),
            role: 'assistant',
          },
          finish_reason: 'stop',
          index: 1,
        },
      ],
      model: 'gpt-4',
      created: Date.now(),
      // It seems that this is needed on the type, but TS complains when it's here.
      // We're going to ignore TS for now
      // @ts-ignore
      object: 'chat.completion.chunk',
    })
    mockedProgressReportsRepo.insertProgressReport.mockResolvedValue(
      getDbUlid()
    )

    const report = await generateProgressReportForUser(userId, sessionId)
    /**
     *
     * When you JSON.stringify an object and then parse it back using JSON.parse,
     * all the Date objects within the original object are converted to strings.
     * We stringify the mockedProgressReport in the openAI mock, which converts
     * the `summary.createdAt` into a string instead of a Date. We're manually
     * changing it back to a Date to properly assert it against the mock
     *
     */
    report.summary.createdAt = new Date(report.summary.createdAt)
    expect(report).toMatchObject(mockedProgressReport)
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
