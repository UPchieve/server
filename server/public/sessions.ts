import {
  CurrentSessionPublic,
  SessionMessagePublic,
  SessionUserInfoPublic,
} from '../contracts/sessions'
import { CurrentSession, MessageForFrontend } from '../types/session'
import { Uuid } from '../types/shared'

function toSessionUserInfoPublic(data: {
  id: Uuid
  firstName: string
}): SessionUserInfoPublic {
  return {
    _id: data.id,
    id: data.id,
    firstname: data.firstName,
    firstName: data.firstName,
  }
}

function toSessionMessagePublic(
  message: MessageForFrontend
): SessionMessagePublic {
  return {
    user: message.user,
    contents: message.contents,
    createdAt: message.createdAt.toISOString(),
  }
}

export function toCurrentSessionPublic(
  session: CurrentSession
): CurrentSessionPublic {
  return {
    _id: session.id,
    id: session.id,
    studentId: session.studentId,
    volunteerId: session.volunteerId,
    student: toSessionUserInfoPublic(session.student),
    volunteer: session.volunteer
      ? toSessionUserInfoPublic(session.volunteer)
      : undefined,
    volunteerJoinedAt: session.volunteerJoinedAt?.toISOString(),
    messages: session.messages.map(toSessionMessagePublic),
    toolType: session.toolType,
    docEditorVersion: session.docEditorVersion,
    studentBannedFromLiveMedia: session.studentBannedFromLiveMedia,
    volunteerBannedFromLiveMedia: session.volunteerBannedFromLiveMedia,
    volunteerLanguages: session.volunteerLanguages,
    type: session.type,
    subTopic: session.subTopic,
    createdAt: session.createdAt.toISOString(),
    endedAt: session.endedAt?.toISOString(),
    endedBy: session.endedBy,
  }
}
