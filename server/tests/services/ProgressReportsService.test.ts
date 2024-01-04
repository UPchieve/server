import { mocked } from 'jest-mock'
import * as ProgressReportsService from '../../services/ProgressReportsService'
import { Ulid, getDbUlid, getUuid } from '../../models/pgUtils'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as ProgressReportsRepo from '../../models/ProgressReports'
import * as SessionRepo from '../../models/Session'
import {
  buildProgressReport,
  buildUserSession,
  buildMessageForFrontend,
  buildProgressReportSummaryRow,
  buildProgressReportConceptRow,
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
    const sessionIds = [session.id, getDbUlid(), getDbUlid()]

    mockedProgressReportsRepo.insertProgressReport.mockResolvedValueOnce(
      reportId
    )
    mockedProgressReportsRepo.insertProgressReportSummary.mockResolvedValueOnce(
      reportSummaryId
    )
    mockedProgressReportsRepo.insertProgressReportConcept.mockResolvedValueOnce(
      reportConceptId
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
  // implementation of ProgressReportsService.getProgressReportSummaryAndConcepts
  // to get values back
  test('Should generate and save a progress report', async () => {
    const reportId = getUuid()
    const summaryRow = buildProgressReportSummaryRow()
    const conceptRow = buildProgressReportConceptRow()
    mockedProgressReportsRepo.getProgressReportSummariesForMany.mockResolvedValue(
      [summaryRow]
    )
    mockedProgressReportsRepo.getProgressReportConceptsByReportId.mockResolvedValue(
      [conceptRow]
    )
    const {
      summary,
      concepts,
    } = await ProgressReportsService.getProgressReportSummaryAndConcepts(
      reportId
    )
    const progressReport = buildProgressReport({
      id: reportId,
      summary,
      concepts,
    })
    // This is smelly. There should be a proper mock for this
    // This uses the types defined in OpenAI
    jest.spyOn(openai.chat.completions, 'create').mockResolvedValue({
      id: getDbUlid(),
      choices: [
        {
          message: {
            content: JSON.stringify(progressReport),
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
    expect(report).toMatchObject(progressReport)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      userId,
      EVENTS.PROGRESS_REPORT_ANALYSIS_COMPLETED,
      expect.anything()
    )
    // Use this as a proxy to tell if saveProgressReport was called
    expect(mockedProgressReportsRepo.insertProgressReport).toHaveBeenCalledWith(
      userId,
      'pending'
    )
  })
})
