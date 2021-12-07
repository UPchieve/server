import { Types } from 'mongoose'
import moment from 'moment'
import { Message } from '../../../models/Message'
import { SessionForChatbot } from '../../../models/Session/queries'
import socket from '../../sockets'
import { SUBJECT_TYPES } from '../../../constants'
import { getIdFromModelReference } from '../../../utils/model-reference'
import QueueService from '../../../services/QueueService'
import { Jobs } from '../index'
import { isSubjectUsingDocumentEditor } from '../../../utils/session-utils'

const ONE_MINUTE = 1 * 60 * 1000
export const WAIT_FOR_MATCH = 10 * ONE_MINUTE
export const WAIT_FOR_REPLY = 3 * ONE_MINUTE

// TODO: actually implement this function (part of another ticket)
async function volunteerOnDeck(sessionId: Types.ObjectId): Promise<boolean> {
  return true
}

// TODO: actually implement this function (part of another ticket)
async function textMoreVolunteers(sessionId: Types.ObjectId): Promise<void> {}

export async function updateActivityStatus(
  sessionId: Types.ObjectId
): Promise<void> {
  socket.emit('activity-prompt-sent', { sessionId })
}

export async function autoEndSession(sessionId: Types.ObjectId): Promise<void> {
  socket.emit('auto-end-session', { sessionId })
}

export interface ChatbotMessage {
  key: string
  content: string
  requirements(
    session: SessionForChatbot,
    chatbot: Types.ObjectId
  ): Promise<boolean>
  action?(session: SessionForChatbot, chatbot?: Types.ObjectId): Promise<void>
}

function chatbotSentMessage(
  session: SessionForChatbot,
  chatbot: Types.ObjectId
): boolean {
  return session.messages.some(msg =>
    chatbot.equals(getIdFromModelReference(msg.user))
  )
}

function lastChatbotMessage(
  session: SessionForChatbot,
  chatbot: Types.ObjectId
): Message {
  return session.messages
    .filter(msg => getIdFromModelReference(msg.user).equals(chatbot))
    .sort((x, y) => (x.createdAt > y.createdAt ? 1 : 0))
    .slice(-1)[0]
}

export const m1 = {
  key: 'M1',
  content: 'first message',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot),
}
export const m2 = {
  key: 'M2',
  content: 'second message',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot),
}

export const m3a = {
  key: 'M3A',
  content: 'non-college document editor',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot) &&
    session.type !== SUBJECT_TYPES.COLLEGE &&
    isSubjectUsingDocumentEditor(session.subTopic),
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session._id },
      { delay: WAIT_FOR_MATCH }
    )
  },
}

export const m3b = {
  key: 'M3B',
  content: 'whiteboard',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot) &&
    !isSubjectUsingDocumentEditor(session.subTopic),
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session._id },
      { delay: WAIT_FOR_MATCH }
    )
  },
}

export const m3c = {
  key: 'M3C',
  content: 'college',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot) &&
    session.type === SUBJECT_TYPES.COLLEGE,
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session._id },
      { delay: WAIT_FOR_MATCH }
    )
  },
}

export const m4 = {
  key: 'M4',
  content: 'fourth message - prompt',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      (await volunteerOnDeck(session._id)) &&
      moment().subtract(WAIT_FOR_MATCH - ONE_MINUTE, 'milliseconds') >=
        moment(lastChatbotMsg.createdAt) &&
      (lastChatbotMsg.contents === m3a.content ||
        lastChatbotMsg.contents === m3b.content ||
        lastChatbotMsg.contents === m3c.content)
    )
  },
  action: async (session: SessionForChatbot) => {
    await updateActivityStatus(session._id)
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session._id },
      { delay: WAIT_FOR_REPLY }
    )
  },
}

export const m5 = {
  key: 'M5',
  content: 'fifth message - reply confirmed',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      lastChatbotMsg.contents === m4.content &&
      session.messages.some(
        msg =>
          msg.createdAt > lastChatbotMsg.createdAt &&
          getIdFromModelReference(session.student).equals(
            getIdFromModelReference(msg.user)
          )
      )
    )
  },
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session._id },
      { delay: WAIT_FOR_MATCH }
    )
    await textMoreVolunteers(session._id)
  },
}

export const m6 = {
  key: 'M6',
  content: 'sixth message - prompt',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      (await volunteerOnDeck(session._id)) &&
      moment().subtract(WAIT_FOR_MATCH - ONE_MINUTE, 'milliseconds') >=
        moment(lastChatbotMsg.createdAt) &&
      lastChatbotMsg.contents === m5.content
    )
  },
  action: async (session: SessionForChatbot) => {
    await updateActivityStatus(session._id)
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session._id },
      { delay: WAIT_FOR_REPLY }
    )
  },
}

export const m7 = {
  key: 'M7',
  content: 'seventh message - reply confirmed',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      lastChatbotMsg.contents === m6.content &&
      session.messages.some(
        msg =>
          msg.createdAt > lastChatbotMsg.createdAt &&
          getIdFromModelReference(session.student).equals(
            getIdFromModelReference(msg.user)
          )
      )
    )
  },
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session._id },
      { delay: WAIT_FOR_MATCH }
    )
    await textMoreVolunteers(session._id)
  },
}

export const m8 = {
  key: 'M8',
  content: 'eigth message - no volunteers found',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    const chatbotMessages = session.messages
      .filter(msg => getIdFromModelReference(msg.user).equals(chatbot))
      .sort((x, y) => (x.createdAt > y.createdAt ? 1 : 0))
    const lastChatbotMsg = chatbotMessages.slice(-1)[0]
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      moment().subtract(WAIT_FOR_MATCH - ONE_MINUTE, 'milliseconds') >=
        moment(lastChatbotMsg.createdAt) &&
      lastChatbotMsg.contents === m7.content
    )
  },
  action: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    await autoEndSession(session._id)
  },
}

export const m9 = {
  key: 'M9',
  content: 'nineth message - no reply',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    // sort in reverse order so array.find returns the last instance
    const messages = session.messages.sort((x, y) =>
      x.createdAt < y.createdAt ? -1 : 1
    )
    const lastPromptMsg = messages.find(
      msg => msg.contents === m4.content || msg.contents === m6.content
    )
    return (
      !!lastPromptMsg &&
      moment().subtract(WAIT_FOR_REPLY - ONE_MINUTE, 'milliseconds') >=
        moment(lastPromptMsg.createdAt) &&
      !session.messages.some(
        msg =>
          msg.createdAt > lastPromptMsg.createdAt &&
          getIdFromModelReference(session.student).equals(
            getIdFromModelReference(msg.user)
          )
      )
    )
  },
  action: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    await autoEndSession(session._id)
  },
}

export const MESSAGES: ChatbotMessage[] = [
  m1,
  m2,
  m3a,
  m3b,
  m3c,
  m4,
  m5,
  m6,
  m7,
  m8,
  m9,
]
