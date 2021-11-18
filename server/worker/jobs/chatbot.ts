import { Types } from 'mongoose'
import moment from 'moment'
import { getUserIdByEmail } from '../../models/User/queries'
import { getSessionMessagesById } from '../../models/Session/queries'
import socket from '../sockets'
import { CHATBOT_EMAIL } from '../../constants'
import { log } from '../logger'

async function sendMessage(
  sessionId: Types.ObjectId,
  content: string
): Promise<void> {
  const chatbotId = await getUserIdByEmail(CHATBOT_EMAIL)
  if (!chatbotId) throw new Error('Chatbot user not found!')
  socket.emit('message', {
    user: chatbotId,
    sessionId,
    message: content,
  })
}

async function updateActivityStatus(sessionId: Types.ObjectId): Promise<void> {
  socket.emit('activity-prompt-sent', { sessionId })
}

async function checkChatActivitySince(
  sessionId: Types.ObjectId,
  since: Date
): Promise<boolean> {
  const sessionWithMessages = await getSessionMessagesById(sessionId)
  if (!sessionWithMessages) throw new Error(`Session ${sessionId} not found`)
  const { messages } = sessionWithMessages
  if (messages.some(msg => msg.createdAt > since)) return true
  return false
}

async function chatbot(): Promise<void> {
  await updateActivityStatus(Types.ObjectId())
}

export default chatbot

chatbot()
