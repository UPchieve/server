import { mocked } from 'jest-mock'
import * as DirectMessageService from '../../services/DirectMessageService'
import * as DirectMessageRepo from '../../models/DirectMessage'
import { ConversationNotFoundError } from '../../services/Errors'
import { NotAllowedError } from '../../models/Errors'
import { RoleContext } from '../../services/UserRolesService'
import { getDbUlid } from '../../models/pgUtils'
import { buildUserContactInfo } from '../mocks/generate'

jest.mock('../../models/DirectMessage')

const mockedDirectMessageRepo = mocked(DirectMessageRepo)

function buildConversation(studentId: string, volunteerId: string) {
  return {
    id: getDbUlid(),
    studentId,
    volunteerId,
    createdAt: new Date(),
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
})
