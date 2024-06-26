import { Ulid } from '../../../models/pgUtils'
import { Job } from 'bull'
import {
  getSessionForChatbot,
  SessionForChatbot,
} from '../../../models/Session/queries'
import { getSocket } from '../../sockets'
import { log } from '../../logger'
import { safeAsync } from '../../../utils/safe-async'
import { MESSAGES, ChatbotMessage } from './messages'
import { asString } from '../../../utils/type-utils'
import { setTimeout } from 'timers/promises'
import { lookupChatbotFromCache } from '../../../utils/chatbot-lookup'

export const MESSAGE_TYPING_DELAY = 3 * 1000

async function sendMessage(
  sessionId: Ulid,
  content: string,
  chatbot: Ulid,
  delay: number
): Promise<void> {
  const socket = getSocket()
  socket.emit('typing', { sessionId })
  await setTimeout(delay)
  socket.emit('notTyping', { sessionId })
  socket.emit('message', {
    // socket message handler expects a FRONTEND user-like object
    user: { _id: chatbot, isVolunteer: true },
    sessionId,
    message: content,
  })
}

// Param 'messageDelay' included so test can provide a shorter delay to improve their runtime
export async function messageControlFlow(
  session: SessionForChatbot,
  chatbot: Ulid,
  chatbotMessages: ChatbotMessage[],
  messageDelay: number
): Promise<void> {
  const errors: string[] = []
  const messagesToSend: string[] = []
  const actions: Function[] = []
  for (const msg of chatbotMessages) {
    const result = await safeAsync(msg.requirements(session, chatbot))
    if (result.result) {
      messagesToSend.push(msg.content(session))
      if (msg.action) actions.push(async () => await msg.action!(session))
      log(`Planning to send message ${msg.key} to session ${session.id}`)
    } else if (result.error) errors.push(result.error.message)
  }

  // TODO: should sending these be more transactional? Messages should still be sent in order
  for (const msg of messagesToSend) {
    const result = await safeAsync(
      sendMessage(session.id, msg, chatbot, messageDelay)
    )
    if (result.error) errors.push(result.error.message)
  }
  // execute actions
  for (const action of actions) {
    const result = await safeAsync(action())
    if (result.error) errors.push(result.error.message)
  }

  if (errors.length) {
    throw new Error(
      `Error while sending chatbot messages: ${errors.join('\n')}`
    )
  }
}

interface ChatbotPayload {
  sessionId: Ulid
}

async function chatbot(job: Job<ChatbotPayload>): Promise<void> {
  const sessionId = asString(job.data.sessionId)
  const chatbotId = await lookupChatbotFromCache()
  if (!chatbot) throw new Error('Chatbot user not found!')
  // replaced by getSessionForChatbot
  const session = await getSessionForChatbot(sessionId)
  if (!session) throw new Error(`Session ${sessionId} not found`)
  await messageControlFlow(session, chatbotId!, MESSAGES, MESSAGE_TYPING_DELAY)
}

export default chatbot
