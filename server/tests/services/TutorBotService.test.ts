import { mocked } from 'jest-mock'
import * as TutorBotService from '../../services/TutorBotService'
import * as AwsBedrockService from '../../services/AwsBedrockService'
import * as PromptService from '../../services/PromptService'
import * as TutorBotRepo from '../../models/TutorBot'
import * as QuillDocService from '../../services/QuillDocService'
import * as SessionService from '../../services/SessionService'
import SocketService from '../../services/SocketService'

jest.mock('../../logger')
jest.mock('../../services/AwsBedrockService')
jest.mock('../../services/PromptService')
jest.mock('../../models/TutorBot')
jest.mock('../../services/QuillDocService')
jest.mock('../../services/SessionService')
jest.mock('../../services/SocketService')
jest.mock('../../clients/langfuse', () => ({
  client: {
    trace: jest.fn(() => ({
      generation: jest.fn(() => ({ end: jest.fn(), update: jest.fn() })),
      update: jest.fn(),
    })),
  },
}))
jest.mock('../../utils/image-utils')
jest.mock('../../config')
jest.mock('../../db', () => ({
  getClient: jest.fn(),
  runInTransaction: jest.fn(async (cb: any) => cb({})),
}))

const mockedBedrock = mocked(AwsBedrockService)
const mockedPromptService = mocked(PromptService)
const mockedTutorBotRepo = mocked(TutorBotRepo)
const mockedQuillDocService = mocked(QuillDocService)
const mockedSessionService = mocked(SessionService)

const CONVERSATION_ID = 'conversation-id'
const USER_ID = 'user-id'

beforeEach(() => {
  jest.clearAllMocks()
  ;(SocketService.getInstance as jest.Mock) = jest.fn(() => ({
    emitTutorBotMessage: jest.fn(),
  }))

  mockedTutorBotRepo.insertTutorBotConversationMessage.mockImplementation(
    (async ({ message }: { message: string }) => ({
      id: 'message-id',
      message,
    })) as any
  )
  mockedTutorBotRepo.getTutorBotConversationById.mockResolvedValue({
    id: CONVERSATION_ID,
    sessionId: undefined,
  } as any)
  mockedTutorBotRepo.getTutorBotTranscriptByConversationId.mockResolvedValue({
    messages: [
      { senderUserType: 'student', message: 'what is 2 + 2?' },
      { senderUserType: 'bot', message: 'what do you think?' },
    ],
  } as any)
  mockedSessionService.getSessionById.mockResolvedValue(undefined as any)
  mockedQuillDocService.getCurrentSessionDocEditor.mockResolvedValue(
    undefined as any
  )
  mockedQuillDocService.getDocEditorImages.mockResolvedValue([] as any)

  mockedPromptService.getPromptWithFallback.mockResolvedValue({
    isFallback: false,
    prompt: 'tutor prompt for {{subject}}',
    version: '1',
  } as any)

  mockedBedrock.invokeModel.mockResolvedValue({
    strategy: 'Provide a hint',
    intention: "Hint at the student's mistake",
    response: 'What do you get when you add two and two?',
  } as any)
})

const addStudentMessage = () =>
  TutorBotService.addMessageToConversation({
    userId: USER_ID,
    conversationId: CONVERSATION_ID,
    message: 'what is 2 + 2?',
    senderUserType: 'student',
    subjectName: 'algebraOne',
  } as any)

describe('addMessageToConversation', () => {
  test('answers the student with the response the model gave', async () => {
    const { botResponse } = await addStudentMessage()

    expect(botResponse.message).toBe(
      'What do you get when you add two and two?'
    )
  })

  test("saves the student's own message, not just the answer", async () => {
    const { userMessage } = await addStudentMessage()

    expect(userMessage.message).toBe('what is 2 + 2?')
  })

  test('answers with the canned apology when the model call fails', async () => {
    mockedBedrock.invokeModel.mockRejectedValueOnce(new Error('bedrock down'))

    const { botResponse } = await addStudentMessage()

    expect(botResponse.message).toContain("messages aren't clear")
  })
})
