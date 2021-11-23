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
import { endSession } from '../../../services/SessionService'

// TODO: actually implement this function (partof another ticket)
async function volutneerOnDeck(sessionId: Types.ObjectId): Promise<boolean> {
  return true
}

// TODO: write this
async function textMoreVolunteers(sessionId: Types.ObjectId): Promise<void> {}

export async function updateActivityStatus(
  sessionId: Types.ObjectId
): Promise<void> {
  socket.emit('activity-prompt-sent', { sessionId })
}

interface ChatbotMessage {
  key: string
  content: string
  requirements(
    session: SessionForChatbot,
    chatbot: Types.ObjectId
  ): Promise<boolean>
  action?(session: SessionForChatbot): Promise<void>
}

function chatbotSentMessage(
  session: SessionForChatbot,
  chatbot: Types.ObjectId
): boolean {
  return !session.messages.some(msg =>
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

const m1 = {
  key: 'M1',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt && !chatbotSentMessage(session, chatbot),
}
const m2 = {
  key: 'M2',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt && !chatbotSentMessage(session, chatbot),
}

const m3a = {
  key: 'M3A',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt &&
    !chatbotSentMessage(session, chatbot) &&
    session.type !== SUBJECT_TYPES.COLLEGE &&
    isSubjectUsingDocumentEditor(session.subTopic),
  action: async (session: SessionForChatbot) => {
    await QueueService.add(Jobs.Chatbot, { delay: 10 * 60 * 1000 })
  },
}

const m3b = {
  key: 'M3B',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt &&
    !chatbotSentMessage(session, chatbot) &&
    !isSubjectUsingDocumentEditor(session.subTopic),
  action: async (session: SessionForChatbot) => {
    await QueueService.add(Jobs.Chatbot, { delay: 10 * 60 * 1000 })
  },
}

const m3c = {
  key: 'M3C',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) =>
    !session.volunteerJoinedAt &&
    !chatbotSentMessage(session, chatbot) &&
    session.type === SUBJECT_TYPES.COLLEGE,
  action: async (session: SessionForChatbot) => {
    await QueueService.add(Jobs.Chatbot, { delay: 10 * 60 * 1000 })
  },
}

const m4 = {
  key: 'M4',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !!lastChatbotMessage &&
      (await volutneerOnDeck(session._id)) &&
      moment().subtract(10, 'minutes') > moment(session.createdAt) &&
      (lastChatbotMsg.contents === m3a.content ||
        lastChatbotMsg.contents === m3b.content ||
        lastChatbotMsg.contents === m3c.content)
    )
  },
  action: async (session: SessionForChatbot) => {
    await updateActivityStatus(session._id)
    await QueueService.add(Jobs.Chatbot, { delay: 3 * 60 * 1000 })
  },
}

const m5 = {
  key: 'M5',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !lastChatbotMessage &&
      (lastChatbotMsg.contents === m4.content ||
        lastChatbotMsg.contents === m6.content) &&
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
    await QueueService.add(Jobs.Chatbot, { delay: 10 * 60 * 1000 })
    await textMoreVolunteers(session._id)
  },
}

const m6 = {
  key: 'M6',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !!lastChatbotMessage &&
      (await volutneerOnDeck(session._id)) &&
      moment().subtract(10, 'minutes') > moment(lastChatbotMsg.createdAt) &&
      lastChatbotMsg.contents === m5.content
    )
  },
  action: async (session: SessionForChatbot) => {
    await updateActivityStatus(session._id)
    await QueueService.add(Jobs.Chatbot, { delay: 3 * 60 * 1000 })
  },
}

const m8 = {
  key: 'M8',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    const chatbotMessages = session.messages
      .filter(msg => getIdFromModelReference(msg.user).equals(chatbot))
      .sort((x, y) => (x.createdAt > y.createdAt ? 1 : 0))
    const lastChatbotMsg = chatbotMessages.slice(-1)[0]
    return (
      !session.volunteerJoinedAt &&
      moment().subtract(10, 'minutes') > moment(lastChatbotMsg.createdAt) &&
      lastChatbotMsg.contents === m5.content &&
      chatbotMessages.length === 7
    )
  },
  action: async (session: SessionForChatbot) => {
    await endSession({
      sessionId: session._id,
      isAdmin: true,
      endedBy: null,
    })
  },
}

const m9 = {
  key: 'M9',
  content: '',
  requirements: async (session: SessionForChatbot, chatbot: Types.ObjectId) => {
    // sort in reverse order so array.find returns the last instance
    const messages = session.messages.sort((x, y) =>
      x.createdAt < y.createdAt ? 1 : 0
    )
    const lastPromptMsg = messages.find(
      msg => msg.contents === m4.content || msg.contents === m6.content
    )
    return (
      !!lastPromptMsg &&
      moment().subtract(3, 'minutes') > moment(lastPromptMsg.createdAt) &&
      !session.messages.some(
        msg =>
          msg.createdAt > lastPromptMsg.createdAt &&
          getIdFromModelReference(session.student).equals(
            getIdFromModelReference(msg.user)
          )
      )
    )
  },
  action: async (session: SessionForChatbot) => {
    await endSession({
      sessionId: session._id,
      isAdmin: true,
      endedBy: null,
    })
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
  m6, // TODO: does m6 exist?
  // TODO: is there an m7??
  m8,
  m9,
]
