import { mocked } from 'jest-mock'
import * as ProgressReportsService from '../../services/ProgressReportsService'
import { Ulid, getDbUlid, getUuid } from '../../models/pgUtils'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as ProgressReportsRepo from '../../models/ProgressReports'
import * as SessionRepo from '../../models/Session'
import * as StudentRepo from '../../models/Student'
import * as SubjectsRepo from '../../models/Subjects'
import {
  buildProgressReport,
  buildUserSession,
  buildMessageForFrontend,
  buildProgressReportSummaryRow,
  buildProgressReportConceptRow,
  buildProgressReportOverviewSubjectStat,
  buildProgressReportOverviewUnreadStat,
  buildStudent,
  buildSubjectAndTopic,
} from '../mocks/generate'
import { logError } from '../../logger'
import { EVENTS, PROGRESS_REPORT_JSON_INSTRUCTIONS } from '../../constants'
import { invokeModel } from '../../services/OpenAIService'

jest.mock('../../services/OpenAIService', () => {
  return {
    invokeModel: jest.fn(),
  }
})
jest.mock('../../services/AnalyticsService')
jest.mock('../../models/ProgressReports')
jest.mock('../../models/Session')
jest.mock('../../models/Student')
jest.mock('../../models/Subjects')
jest.mock('../../logger')

const mockedProgressReportsRepo = mocked(ProgressReportsRepo)
const mockedSessionRepo = mocked(SessionRepo)
const mockedStudentRepo = mocked(StudentRepo)
const mockedSubjectRepo = mocked(SubjectsRepo)

const userId: Ulid = getDbUlid()
const session = buildUserSession({
  studentId: userId,
  volunteerId: getDbUlid(),
})
const mockedProgressReport = buildProgressReport()
const mockPrompt = `This is a test prompt for a {{gradeLevel}} student. Please respond with {{responseInstructions}}`

beforeEach(() => {
  jest.clearAllMocks()
})

function createSessionsWithMessages(sessions: SessionRepo.UserSessions[]) {
  return sessions.map((session) => ({
    ...session,
    messages: [{ ...buildMessageForFrontend({ user: userId }) }],
  }))
}

describe('saveProgressReport', () => {
  test(`Should throw error if no summary has been generated`, async () => {
    const mockedProgressReport = buildProgressReport({
      summary: {} as ProgressReportsService.ProgressReportSummary,
    })
    const sessionIds = [session.id]
    const error = new Error(
      `No progress report summary created for user ${userId} on session ${sessionIds.join(
        ','
      )}`
    )
    await expect(
      ProgressReportsService.saveProgressReport({
        userId,
        sessionIds,
        data: mockedProgressReport,
        analysisType: 'single',
        promptId: 1,
      })
    ).rejects.toThrow(error)
  })

  test(`Should throw error if no concepts have been generated`, async () => {
    const mockedProgressReport = buildProgressReport({
      concepts: [] as ProgressReportsService.ProgressReportConcept[],
    })
    const sessionIds = [session.id]
    const error = new Error(
      `No progress report concepts created for user ${userId} on session ${sessionIds.join(
        ','
      )}`
    )
    await expect(
      ProgressReportsService.saveProgressReport({
        userId,
        sessionIds,
        data: mockedProgressReport,
        analysisType: 'single',
        promptId: 1,
      })
    ).rejects.toThrow(error)
  })

  test(`Should save the progress report for 'single' and 'group' session analysis`, async () => {
    const reportId = getDbUlid()
    const reportSummaryId = getDbUlid()
    const reportConceptId = getDbUlid()
    const promptId = 1

    mockedProgressReportsRepo.insertProgressReport.mockResolvedValue(reportId)
    mockedProgressReportsRepo.insertProgressReportSummary.mockResolvedValue(
      reportSummaryId
    )
    mockedProgressReportsRepo.insertProgressReportConcept.mockResolvedValue(
      reportConceptId
    )

    await ProgressReportsService.saveProgressReport({
      userId,
      sessionIds: [session.id],
      data: mockedProgressReport,
      analysisType: 'single',
      promptId,
    })
    expect(mockedProgressReportsRepo.insertProgressReport).toHaveBeenCalledWith(
      userId,
      'pending',
      promptId
    )

    expect(
      mockedProgressReportsRepo.insertProgressReportSession
    ).toHaveBeenNthCalledWith(
      1,
      reportId,
      session.id,
      'single',
      expect.anything()
    )
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

    await ProgressReportsService.saveProgressReport({
      userId,
      sessionIds: [session.id],
      data: mockedProgressReport,
      analysisType: 'group',
      promptId: 1,
    })

    expect(
      mockedProgressReportsRepo.insertProgressReportSession
    ).toHaveBeenNthCalledWith(
      2,
      reportId,
      session.id,
      'group',
      expect.anything()
    )
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
      ProgressReportsService.saveProgressReport({
        userId,
        sessionIds: [session.id],
        data: mockedProgressReport,
        analysisType: 'single',
        promptId: 1,
      })
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
        const session = sessionsWithMessages.find((s) => s.id === sessionId)
        return Promise.resolve(session ? session.messages : [])
      }
    )

    const result =
      await ProgressReportsService.getSessionsToAnalyzeForProgressReport(
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
        const session = sessionsWithMessages.find((s) => s.id === sessionId)
        return Promise.resolve(session ? session.messages : [])
      }
    )

    const result =
      await ProgressReportsService.getSessionsToAnalyzeForProgressReport(
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
    const sessions = [session]
    const sessionsWithMessages = createSessionsWithMessages(sessions)
    const student = buildStudent()
    const mockActivePrompt = {
      id: 1,
      prompt: mockPrompt,
    }
    mockedStudentRepo.getStudentProfileByUserId.mockResolvedValueOnce({
      ...student,
      userId: student.id,
    })
    mockedSubjectRepo.getSubjectAndTopic.mockResolvedValueOnce(
      buildSubjectAndTopic()
    )
    mockedProgressReportsRepo.getActiveSubjectPromptBySubjectName.mockResolvedValueOnce(
      mockActivePrompt
    )
    mockedProgressReportsRepo.getProgressReportSummariesForMany.mockResolvedValue(
      [summaryRow]
    )
    mockedProgressReportsRepo.getProgressReportConceptsByReportId.mockResolvedValue(
      [conceptRow]
    )
    mockedSessionRepo.getUserSessionsByUserId.mockResolvedValue(sessions)
    mockedSessionRepo.getMessagesForFrontend.mockImplementation(
      (sessionId: Ulid) => {
        const session = sessionsWithMessages.find((s) => s.id === sessionId)
        return Promise.resolve(session ? session.messages : [])
      }
    )
    const { summary, concepts } =
      await ProgressReportsService.getProgressReportSummaryAndConcepts(reportId)
    const progressReport = buildProgressReport({
      id: reportId,
      summary,
      concepts,
    })

    ;(invokeModel as jest.Mock).mockResolvedValue({
      results: progressReport,
      modelId: '',
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
        analysisType: 'single',
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
      'pending',
      mockActivePrompt.id
    )
  })
})

describe('getProgressReportOverviewSubjectStats', () => {
  // Skipping flaky test.
  test.skip('Should return progress report overview subject stats', async () => {
    const unreadStat = buildProgressReportOverviewUnreadStat()
    const mockedReport = buildProgressReport()
    const data = buildProgressReportOverviewSubjectStat({ ...unreadStat })
    const mockedData = [data]
    const summaryRow = buildProgressReportSummaryRow({
      overallGrade: data.overallGrade,
    })
    mockedProgressReportsRepo.getProgressReportOverviewUnreadStatsByUserId.mockResolvedValueOnce(
      [unreadStat]
    )
    mockedProgressReportsRepo.getLatestProgressReportIdBySubject.mockResolvedValueOnce(
      mockedReport
    )
    mockedProgressReportsRepo.getProgressReportSummariesForMany.mockResolvedValueOnce(
      [summaryRow]
    )
    const result =
      await ProgressReportsService.getProgressReportOverviewSubjectStats(userId)

    expect(mockedData).toMatchObject(result)
    expect(
      mockedProgressReportsRepo.getProgressReportOverviewUnreadStatsByUserId
    ).toHaveBeenCalled()
    expect(
      mockedProgressReportsRepo.getProgressReportOverviewUnreadStatsByUserId
    ).toHaveBeenCalledWith(userId)
    expect(
      mockedProgressReportsRepo.getLatestProgressReportIdBySubject
    ).toHaveBeenCalled()
    expect(
      mockedProgressReportsRepo.getProgressReportSummariesForMany
    ).toHaveBeenCalled()
  })
})

describe('getLatestProgressReportOverviewSubject', () => {
  test('Should return the subject for the latest progress report overview', async () => {
    const subject = 'algebraOne'
    mockedProgressReportsRepo.getLatestProgressReportOverviewSubjectByUserId.mockResolvedValueOnce(
      subject
    )
    const result =
      await ProgressReportsService.getLatestProgressReportOverviewSubject(
        userId
      )

    expect(subject).toEqual(result)
    expect(
      mockedProgressReportsRepo.getLatestProgressReportOverviewSubjectByUserId
    ).toHaveBeenCalled()
    expect(
      mockedProgressReportsRepo.getLatestProgressReportOverviewSubjectByUserId
    ).toHaveBeenCalledWith(userId)
  })
})

describe('hasActiveSubjectPrompt', () => {
  test('Should return false if there is no prompt or an error is thrown', async () => {
    const mockError = 'Error'
    const mockActivePrompt = {
      id: 1,
      prompt: '',
    }
    mockedProgressReportsRepo.getActiveSubjectPromptBySubjectName.mockRejectedValueOnce(
      mockError
    )
    const resultOne =
      await ProgressReportsService.hasActiveSubjectPrompt('algebraOne')
    expect(resultOne).toBeFalsy()

    mockedProgressReportsRepo.getActiveSubjectPromptBySubjectName.mockResolvedValueOnce(
      mockActivePrompt
    )
    const resultTwo =
      await ProgressReportsService.hasActiveSubjectPrompt('reading')
    expect(resultTwo).toBeFalsy()
  })

  test('Should return true when a prompt is received', async () => {
    const mockActivePrompt = {
      id: 1,
      prompt: 'Prompt',
    }
    mockedProgressReportsRepo.getActiveSubjectPromptBySubjectName.mockResolvedValueOnce(
      mockActivePrompt
    )
    const result =
      await ProgressReportsService.hasActiveSubjectPrompt('reading')
    expect(result).toBeTruthy()
  })
})

describe('getActivePromptWithTemplateReplacement', () => {
  test('Should return a system prompt and replace placeholders', async () => {
    const student = buildStudent()
    const mockActivePrompt = {
      id: 1,
      prompt: mockPrompt,
    }
    const subject = buildSubjectAndTopic()
    const expectedPrompt = `This is a test prompt for a ${student.currentGrade} student. Please respond with ${PROGRESS_REPORT_JSON_INSTRUCTIONS}`
    mockedProgressReportsRepo.getActiveSubjectPromptBySubjectName.mockResolvedValueOnce(
      mockActivePrompt
    )
    mockedStudentRepo.getStudentProfileByUserId.mockResolvedValueOnce({
      ...student,
      userId: student.id,
    })
    const result =
      await ProgressReportsService.getActiveSubjectPromptWithTemplateReplacement(
        student.id,
        subject
      )
    expect(expectedPrompt).toBe(result.prompt)
  })
})
