import { Jobs } from '../worker/jobs'
import { Ulid } from '../models/pgUtils'
import { UserContactInfo } from '../models/User'
import { EVENTS } from '../constants'
import QueueService from './QueueService'
import { captureEvent as captureAnalyticsEvent } from './AnalyticsService'
import { SessionMessageType } from '../router/api/sockets'
import * as sessionUtils from '../utils/session-utils'
import * as TranscriptMessagesRepo from '../models/SessionAudioTranscriptMessages/queries'
import * as SessionRepo from '../models/Session'
import { asString } from '../utils/type-utils'

// async function createDirectMessage({
//   message,
//   sessionId,
//   sender,
//   saidAt,
// }: {
//   message: string
//   sessionId: Ulid
//   sender: UserContactInfo
// }) {
//   const messageId = await saveMessage(user, createdAt, saveMessageData)

//   await QueueService.add(
//     Jobs.SendSessionRecapMessageNotification,
//     { messageId },
//     { removeOnComplete: true, removeOnFail: true }
//   )
//   captureAnalyticsEvent(sender.id, EVENTS.USER_SUBMITTED_SESSION_RECAP_DM, {
//     sessionId: sessionId,
//     message,
//     userType: sender.roleContext.activeRole,
//   })
// }

// TODO: we don't know the shape of the user coming from a socket. user is provided from the client at the moment
export async function saveMessage(
  user: any,
  data: {
    sessionId: Ulid
    message: string
    type?: SessionMessageType
    saidAt?: Date // @TODO Improve typing to handle different types of messages
  }
): Promise<string> {
  const { sessionId, message } = sessionUtils.asSaveMessageData(data)
  const session = await SessionRepo.getSessionById(sessionId)
  if (
    !sessionUtils.isSessionParticipant(
      session.studentId,
      session.volunteerId,
      asString(user._id)
    )
  )
    throw new Error('Only session participants are allowed to send messages')

  if (data.type === 'audio-transcription') {
    return await TranscriptMessagesRepo.insertSessionAudioTranscriptMessage({
      userId: user.id,
      sessionId,
      message,
      saidAt: data.saidAt!,
    })
  } else {
    return await SessionRepo.addMessageToSessionById(
      sessionId,
      user._id,
      message
    )
  }
}
