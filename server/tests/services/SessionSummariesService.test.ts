import { mocked } from 'jest-mock'
import * as SessionSummariesService from '../../services/SessionSummariesService'
import * as AwsBedrockService from '../../services/AwsBedrockService'
import * as AiObservabilityService from '../../services/AiObservabilityService'
import * as PromptService from '../../services/PromptService'
import * as ProgressReportsService from '../../services/ProgressReportsService'
import * as StudentService from '../../services/StudentService'
import * as SessionRepo from '../../models/Session/queries'
import * as SessionSummariesRepo from '../../models/SessionSummaries/queries'
import * as Subjects from '../../models/Subjects'
import { isStudentSessionSummaryEnabled } from '../../services/FeatureFlagService'

jest.mock('../../logger')
jest.mock('../../services/AwsBedrockService')
jest.mock('../../services/AiObservabilityService')
jest.mock('../../services/PromptService')
jest.mock('../../services/ProgressReportsService')
jest.mock('../../services/StudentService')
jest.mock('../../models/Session/queries')
jest.mock('../../models/SessionSummaries/queries')
jest.mock('../../models/Subjects')
jest.mock('../../services/QueueService')
jest.mock('../../config')

const mockedBedrock = mocked(AwsBedrockService)
const mockedObservability = mocked(AiObservabilityService)
const mockedPromptService = mocked(PromptService)
const mockedProgressReports = mocked(ProgressReportsService)
const mockedStudentService = mocked(StudentService)
const mockedSessionRepo = mocked(SessionRepo)
const mockedSubjects = mocked(Subjects)
const mockedFeatureFlag = mocked(isStudentSessionSummaryEnabled)

const SESSION_ID = 'session-id'
const USER_PROMPT = 'formatted transcript'

beforeEach(() => {
  jest.clearAllMocks()

  mockedSessionRepo.getSessionById.mockResolvedValue({
    id: SESSION_ID,
    volunteerId: 'volunteer-id',
    studentId: 'student-id',
    subject: 'algebraOne',
    toolType: 'whiteboard',
  } as any)
  mockedSessionRepo.getMessagesForFrontend.mockResolvedValue([] as any)
  mockedSubjects.getSubjectAndTopic.mockResolvedValue({
    subjectName: 'algebraOne',
    topicName: 'math',
  } as any)
  mockedProgressReports.formatSessionsForBotPrompt.mockResolvedValue(
    USER_PROMPT
  )
  // No classes, so only the student summary is generated.
  mockedStudentService.getActiveClassesForStudent.mockResolvedValue([] as any)
  mockedFeatureFlag.mockResolvedValue(true)

  mockedPromptService.getPromptWithFallback.mockImplementation(
    async (name: any) =>
      ({ isFallback: false, prompt: `prompt:${name}`, version: '1' }) as any
  )

  mockedObservability.runWithTrace.mockImplementation(async (cb) => ({
    result: await cb({} as any),
    traceId: 'trace-id',
  }))
  mockedObservability.runWithModelObservation.mockImplementation((cb) => cb())
  mockedBedrock.invokeModel.mockResolvedValue('a summary' as any)
})

describe('generateSessionSummaryForSession', () => {
  test('saves the returned summary against the session', async () => {
    await SessionSummariesService.generateSessionSummaryForSession(SESSION_ID)

    expect(SessionSummariesRepo.addSessionSummary).toHaveBeenCalledWith(
      SESSION_ID,
      'a summary',
      'student',
      'trace-id'
    )
  })
})
