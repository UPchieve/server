import { Types } from 'mongoose'
import { Job } from 'bull'
import { getUserIdByEmail } from '../../../models/User/queries'
import { getSessionMessagesById } from '../../../models/Session/queries'
import socket from '../../sockets'
import { CHATBOT_EMAIL } from '../../../constants'
import { log } from '../../logger'
import { safeAsync } from '../../../utils/safe-async'
import { MESSAGES } from './messages'
import { asObjectId } from '../../../utils/type-utils'

async function sendMessage(
  sessionId: Types.ObjectId,
  content: string,
  chatbot: Types.ObjectId
): Promise<void> {
  socket.emit('message', {
    user: chatbot,
    sessionId,
    message: content,
  })
}

async function messageControlFlow(
  sessionId: Types.ObjectId,
  chatbot: Types.ObjectId
): Promise<void> {
  const session = await getSessionMessagesById(sessionId)
  if (!session) throw new Error(`Session ${sessionId} not found`)

  const errors: string[] = []
  const messagesToSend: string[] = []
  const actions: Promise<void>[] = []
  for (const msg of MESSAGES) {
    const result = await safeAsync(msg.requirements(session, chatbot))
    if (result.result) {
      messagesToSend.push(msg.content)
      if (msg.action) actions.push(msg.action(session))
      log(`Planning to send message ${msg.key} to session ${sessionId}`)
    } else if (result.error) errors.push(result.error.message)
  }

  // TODO: should sending these be more transactional? Messages should still be sent in order
  for (const msg of messagesToSend) {
    const result = await safeAsync(sendMessage(sessionId, msg, chatbot))
    if (result.error) errors.push(result.error.message)
  }
  // execute actions
  Promise.allSettled(actions).then(results =>
    results.forEach(result => {
      if (result.status === 'rejected' && result.reason)
        errors.push(result.reason)
    })
  )
  if (errors.length) {
    throw new Error(
      `Error while sending chatbot messages: ${errors.join('\n')}`
    )
  }
}

interface ChatbotPayload {
  sessionId: Types.ObjectId
}

async function chatbot(job: Job<ChatbotPayload>): Promise<void> {
  const sessionId = asObjectId(job.data.sessionId)
  const chatbotId = await getUserIdByEmail(CHATBOT_EMAIL)
  if (!chatbot) throw new Error('Chatbot user not found!')
  await messageControlFlow(sessionId, chatbotId!)
}

export default chatbot
