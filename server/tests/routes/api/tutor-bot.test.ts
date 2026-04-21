import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeTutorBot } from '../../../router/api/tutor-bot'
import * as TutorBotService from '../../../services/TutorBotService'
import {
  buildStudent,
  buildTutorBotAddMessageResponse,
  buildTutorBotAddMessageResponsePublic,
  buildTutorBotTranscript,
  buildTutorBotTranscriptPublic,
} from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'
import { TutorBotHumanSenderType } from '../../../types/tutor-bot'

jest.mock('../../../services/TutorBotService')

const mockedTutorBotService = mocked(TutorBotService)

let mockUser = buildStudent()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeTutorBot(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(path: string, payload?: object): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routeTutorBot', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildStudent()
  })

  describe('GET /api/tutor-bot/conversations/:conversationId', () => {
    test('returns transcript for conversation', async () => {
      const conversationId = getUuid()
      const transcript = buildTutorBotTranscript({ conversationId })
      const publicTranscript = buildTutorBotTranscriptPublic({
        conversationId,
      })
      mockedTutorBotService.getTranscriptForConversation.mockResolvedValueOnce(
        transcript
      )
      mockedTutorBotService.toTutorBotTranscriptPublic.mockReturnValueOnce(
        publicTranscript
      )

      const response = await sendGet(
        `/api/tutor-bot/conversations/${conversationId}`
      )
      expect(response.status).toBe(200)
      expect(
        mockedTutorBotService.getTranscriptForConversation
      ).toHaveBeenCalledWith(conversationId)
      expect(
        mockedTutorBotService.toTutorBotTranscriptPublic
      ).toHaveBeenCalledWith(transcript)
      expect(response.body).toEqual(publicTranscript)
    })
  })

  describe('POST /api/tutor-bot/conversations/:conversationId/message', () => {
    test('adds a message to a conversation', async () => {
      const conversationId = getUuid()
      const subjectName = 'Algebra 1'
      const userMessage = {
        ...buildTutorBotAddMessageResponse().userMessage,
        tutorBotConversationId: conversationId,
        userId: mockUser.id,
        senderUserType: 'student' as TutorBotHumanSenderType,
        message: 'Can you help me with writing tests?',
      }
      const botResponse = buildTutorBotAddMessageResponse({ userMessage })
      const publicResponse = buildTutorBotAddMessageResponsePublic(botResponse)
      mockedTutorBotService.addMessageToConversation.mockResolvedValueOnce(
        botResponse
      )
      mockedTutorBotService.toTutorBotAddMessageResponsePublic.mockReturnValueOnce(
        publicResponse
      )

      const response = await sendPost(
        `/api/tutor-bot/conversations/${conversationId}/message`,
        {
          message: userMessage.message,
          senderUserType: userMessage.senderUserType,
          subjectName,
        }
      )
      expect(response.status).toBe(200)
      expect(
        mockedTutorBotService.addMessageToConversation
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        conversationId,
        message: userMessage.message,
        senderUserType: userMessage.senderUserType,
        subjectName,
      })
      expect(
        mockedTutorBotService.toTutorBotAddMessageResponsePublic
      ).toHaveBeenCalledWith(botResponse)
      expect(response.body).toEqual(publicResponse)
    })

    test('returns 422 for invalid senderUserType', async () => {
      const conversationId = getUuid()

      const response = await sendPost(
        `/api/tutor-bot/conversations/${conversationId}/message`,
        {
          message: 'Hello',
          senderUserType: 'bot',
          subjectName: 'Algebra 1',
        }
      )
      expect(response.status).toBe(422)
      expect(
        mockedTutorBotService.addMessageToConversation
      ).not.toHaveBeenCalled()
      expect(
        mockedTutorBotService.toTutorBotAddMessageResponsePublic
      ).not.toHaveBeenCalled()
    })
  })
})
