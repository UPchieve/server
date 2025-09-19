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

type MessageType = {
  sessionId: Ulid
  message: string
  type?: SessionMessageType
  saidAt?: Date // @TODO Improve typing to handle different types of messages
}
export async function saveDirectMessage(sender: any, data: MessageType) {
  const messageId = await saveMessage(sender, data)

  await QueueService.add(
    Jobs.SendSessionRecapMessageNotification,
    { messageId },
    { removeOnComplete: true, removeOnFail: true }
  )
  captureAnalyticsEvent(sender.id, EVENTS.USER_SUBMITTED_SESSION_RECAP_DM, {
    sessionId: data.sessionId,
    message: data.message,
    userType: sender.roleContext.activeRole,
  })
}

// TODO: we don't know the shape of the user coming from a socket. user is provided from the client at the moment
export async function saveMessage(
  user: any,
  data: MessageType
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
      userId: user._id,
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
