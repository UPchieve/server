import { mocked } from 'jest-mock'
import * as DirectMessageService from '../../services/DirectMessageService'
import * as DirectMessageRepo from '../../models/DirectMessage'
import { ConversationNotFoundError } from '../../services/Errors'
import { InputError, NotAllowedError } from '../../models/Errors'
import { RoleContext } from '../../services/UserRolesService'
import { getDbUlid } from '../../models/pgUtils'
import { buildUserContactInfo } from '../mocks/generate'

jest.mock('../../models/DirectMessage')

const mockedDirectMessageRepo = mocked(DirectMessageRepo)

function buildConversation(studentId: string, volunteerId = getDbUlid()) {
  return {
    id: getDbUlid(),
    studentId,
    volunteerId,
    createdAt: new Date(),
  }
}

function buildMessage(
  overrides: Partial<DirectMessageRepo.DirectMessage> = {}
): DirectMessageRepo.DirectMessage {
  return {
    id: getDbUlid(),
    conversationId: getDbUlid(),
    senderId: getDbUlid(),
    contents: 'Hi!',
    createdAt: new Date(),
    ...overrides,
  }
}

describe('DirectMessageService', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getOrCreateConversation', () => {
    test('uses the user as the student when they are acting as a student', async () => {
      const student = buildUserContactInfo()
      const volunteerId = getDbUlid()
      const conversation = buildConversation(student.id, volunteerId)
      mockedDirectMessageRepo.getOrCreateConversation.mockResolvedValue(
        conversation
      )

      const result = await DirectMessageService.getOrCreateConversation(
        student,
        volunteerId
      )

      expect(
        mockedDirectMessageRepo.getOrCreateConversation
      ).toHaveBeenCalledWith(student.id, volunteerId)
      expect(result).toEqual(conversation)
    })

    test('uses the user as the volunteer when they are acting as a coach', async () => {
      const volunteer = buildUserContactInfo({
        roles: ['volunteer'],
        roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
      })
      const studentId = getDbUlid()
      mockedDirectMessageRepo.getOrCreateConversation.mockResolvedValue(
        buildConversation(studentId, volunteer.id)
      )

      await DirectMessageService.getOrCreateConversation(volunteer, studentId)

      expect(
        mockedDirectMessageRepo.getOrCreateConversation
      ).toHaveBeenCalledWith(studentId, volunteer.id)
    })

    test('throws if the pair has not had a session together', async () => {
      const student = buildUserContactInfo()
      mockedDirectMessageRepo.getOrCreateConversation.mockResolvedValue(
        undefined
      )

      await expect(
        DirectMessageService.getOrCreateConversation(student, getDbUlid())
      ).rejects.toThrow(ConversationNotFoundError)
    })

    test('does not allow users who are not acting as a student or coach', async () => {
      const teacher = buildUserContactInfo({
        roles: ['teacher'],
        roleContext: new RoleContext(['teacher'], 'teacher', 'teacher'),
      })

      await expect(
        DirectMessageService.getOrCreateConversation(teacher, getDbUlid())
      ).rejects.toThrow(NotAllowedError)
      expect(
        mockedDirectMessageRepo.getOrCreateConversation
      ).not.toHaveBeenCalled()
    })
  })

  describe('getMessages', () => {
    test("returns the conversation's messages for a participant", async () => {
      const user = buildUserContactInfo()
      const conversation = buildConversation(user.id)
      const messages = [buildMessage({ conversationId: conversation.id })]
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      mockedDirectMessageRepo.getDirectMessagesForConversation.mockResolvedValue(
        messages
      )

      const result = await DirectMessageService.getMessages(
        conversation.id,
        user
      )

      expect(
        mockedDirectMessageRepo.getConversationForParticipant
      ).toHaveBeenCalledWith(conversation.id, user.id)
      expect(
        mockedDirectMessageRepo.getDirectMessagesForConversation
      ).toHaveBeenCalledWith(conversation.id)
      expect(result).toEqual(messages)
    })

    test('throws if the user is not in the conversation', async () => {
      const user = buildUserContactInfo()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        undefined
      )

      await expect(
        DirectMessageService.getMessages(getDbUlid(), user)
      ).rejects.toThrow(ConversationNotFoundError)
      expect(
        mockedDirectMessageRepo.getDirectMessagesForConversation
      ).not.toHaveBeenCalled()
    })
  })

  describe('sendMessage', () => {
    test('saves the trimmed message from the user', async () => {
      const user = buildUserContactInfo()
      const conversation = buildConversation(user.id)
      const message = buildMessage()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        conversation
      )
      mockedDirectMessageRepo.createDirectMessage.mockResolvedValue(message)

      const result = await DirectMessageService.sendMessage(
        conversation.id,
        user,
        '  Hi!  '
      )

      expect(mockedDirectMessageRepo.createDirectMessage).toHaveBeenCalledWith({
        conversationId: conversation.id,
        senderId: user.id,
        contents: 'Hi!',
      })
      expect(result).toEqual({ conversation, message })
    })

    test('rejects a blank message', async () => {
      const user = buildUserContactInfo()

      await expect(
        DirectMessageService.sendMessage(getDbUlid(), user, '   ')
      ).rejects.toThrow(InputError)
      expect(mockedDirectMessageRepo.createDirectMessage).not.toHaveBeenCalled()
    })

    test('throws if the user is not in the conversation', async () => {
      const user = buildUserContactInfo()
      mockedDirectMessageRepo.getConversationForParticipant.mockResolvedValue(
        undefined
      )

      await expect(
        DirectMessageService.sendMessage(getDbUlid(), user, 'Hi!')
      ).rejects.toThrow(ConversationNotFoundError)
      expect(mockedDirectMessageRepo.createDirectMessage).not.toHaveBeenCalled()
    })
  })

  describe('markConversationSeen', () => {
    test("updates the user's last-seen time for the conversation", async () => {
      const user = buildUserContactInfo()
      const conversationId = getDbUlid()
      mockedDirectMessageRepo.updateConversationLastSeen.mockResolvedValue(true)

      await DirectMessageService.markConversationSeen(conversationId, user)

      expect(
        mockedDirectMessageRepo.updateConversationLastSeen
      ).toHaveBeenCalledWith(conversationId, user.id)
    })

    test('throws if the user is not in the conversation', async () => {
      const user = buildUserContactInfo()
      mockedDirectMessageRepo.updateConversationLastSeen.mockResolvedValue(
        false
      )

      await expect(
        DirectMessageService.markConversationSeen(getDbUlid(), user)
      ).rejects.toThrow(ConversationNotFoundError)
    })
  })

  describe('getUnreadMessageSenderIds', () => {
    test('returns the ids of users who sent the user unread messages', async () => {
      const user = buildUserContactInfo()
      const senderIds = [getDbUlid(), getDbUlid()]
      mockedDirectMessageRepo.getUnreadDirectMessageSenderIds.mockResolvedValue(
        senderIds
      )

      const result = await DirectMessageService.getUnreadMessageSenderIds(user)

      expect(
        mockedDirectMessageRepo.getUnreadDirectMessageSenderIds
      ).toHaveBeenCalledWith(user.id)
      expect(result).toEqual(senderIds)
    })
  })
})
