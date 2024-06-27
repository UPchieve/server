import { Job } from 'bull'
import { EVENTS } from '../../constants'
import {
  getMessageInfoByMessageId,
  MessageInfoByMessageId,
} from '../../models/Session'
import { captureEvent } from '../../services/AnalyticsService'
import { asString } from '../../utils/type-utils'
import * as MailService from '../../services/MailService'
import { buildAppLink } from '../../utils/link-builders'

export type SessionRecapMessageNotificationJob = {
  messageId: string
}

const sendSessionHistoryMessage = async (message: MessageInfoByMessageId) => {
  const {
    senderId,
    studentUserId,
    volunteerEmail,
    volunteerFirstName,
    studentEmail,
    studentFirstName,
    sessionId,
    contents,
  } = message
  const sessionRecapLink = buildAppLink(`sessions/${sessionId}/recap`)
  const isSenderStudent = senderId === studentUserId

  const email = isSenderStudent ? volunteerEmail : studentEmail
  const senderFirstName = isSenderStudent
    ? studentFirstName
    : volunteerFirstName
  const receiverFirstName = isSenderStudent
    ? volunteerFirstName
    : studentFirstName

  await MailService.sendSessionRecapMessage(
    email,
    receiverFirstName,
    senderFirstName,
    sessionRecapLink,
    contents
  )
  return sessionRecapLink
}

export default async (
  job: Job<SessionRecapMessageNotificationJob>
): Promise<void> => {
  const messageId = asString(job.data.messageId)
  const message = await getMessageInfoByMessageId(messageId)

  if (!message || !message.sentAfterSession) return

  const senderId = message.senderId
  const receiverId =
    senderId === message.studentUserId
      ? message.volunteerUserId
      : message.studentUserId

  try {
    const sessionRecapLink = await sendSessionHistoryMessage(message)

    captureEvent(senderId, EVENTS.SESSION_RECAP_MESSAGE_NOTIFICATION_SENT, {
      event: EVENTS.SESSION_RECAP_MESSAGE_NOTIFICATION_SENT,
      sessionId: message.sessionId,
      senderId,
      receiverId,
      sessionRecapLink,
    })
  } catch (error) {
    throw new Error(
      `Failed to send session recap message ${messageId} to receiver: ${receiverId} from ${senderId}. Error: ${error}`
    )
  }
}
