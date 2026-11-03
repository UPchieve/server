import * as DirectMessageRepo from '../models/DirectMessage'
import { NotAllowedError } from '../models/Errors'
import type { UserContactInfo } from '../models/User'
import type { DirectMessageConversation } from '../types/direct-messages'
import type { Uuid } from '../types/shared'
import { ConversationNotFoundError } from './Errors'

export async function getOrCreateConversation(
  user: UserContactInfo,
  partnerId: Uuid
): Promise<DirectMessageConversation> {
  let studentId: Uuid
  let volunteerId: Uuid
  if (user.roleContext.isActiveRole('student')) {
    studentId = user.id
    volunteerId = partnerId
  } else if (user.roleContext.isActiveRole('volunteer')) {
    studentId = partnerId
    volunteerId = user.id
  } else {
    throw new NotAllowedError('Only students and coaches can send messages')
  }

  const conversation = await DirectMessageRepo.getOrCreateConversation(
    studentId,
    volunteerId
  )

  if (!conversation) throw new ConversationNotFoundError()
  return conversation
}
