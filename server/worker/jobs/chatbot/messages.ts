import { Ulid } from '../../../models/pgUtils'
import moment from 'moment'
import { SessionForChatbot, MessageForFrontend } from '../../../models/Session'
import { getSocket } from '../../sockets'
import { SUBJECT_TYPES } from '../../../constants'
import QueueService from '../../../services/QueueService'
import { Jobs } from '../index'
import { isSubjectUsingDocumentEditor } from '../../../utils/session-utils'
import { volunteersAvailableForSession } from '../../../services/SessionService'
import config from '../../../config'

const ONE_MINUTE = 1 * 60 * 1000
export const WAIT_FOR_MATCH = 10 * ONE_MINUTE
export const WAIT_FOR_REPLY = 3 * ONE_MINUTE
const socket = getSocket()

async function textMoreVolunteers(sessionId: Ulid): Promise<void> {
  // ignore the initial delay on the notification schedule and notify tutors ASAP
  const notificationSchedule = config.notificationSchedule.slice(1)
  await QueueService.add(
    Jobs.NotifyTutors,
    { sessionId, notificationSchedule },
    {
      removeOnComplete: true,
      removeOnFail: true,
    }
  )
}

export async function updateActivityStatus(sessionId: Ulid): Promise<void> {
  socket.emit('activity-prompt-sent', { sessionId })
}

export async function autoEndSession(sessionId: Ulid): Promise<void> {
  socket.emit('auto-end-session', { sessionId })
}

export interface ChatbotMessage {
  key: string
  content(session: SessionForChatbot): string
  requirements(session: SessionForChatbot, chatbot: Ulid): Promise<boolean>
  action?(session: SessionForChatbot, chatbot?: Ulid): Promise<void>
}

function chatbotSentMessage(
  session: SessionForChatbot,
  chatbot: Ulid
): boolean {
  return session.messages.some(msg => chatbot === msg.user)
}

function lastChatbotMessage(
  session: SessionForChatbot,
  chatbot: Ulid
): MessageForFrontend {
  return session.messages
    .filter(msg => msg.user === chatbot)
    .sort((x, y) => (x.createdAt > y.createdAt ? 1 : 0))
    .slice(-1)[0]
}

export const m1 = {
  key: 'M1',
  content: (session: SessionForChatbot) =>
    `Hey ${session.studentFirstName}! I’m the UPchieve Bot.`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot),
}
export const m2 = {
  key: 'M2',
  content: () =>
    'Right now, we’re searching for a live coach to pair you with. This process should take 5-10 minutes, so please be patient!',
  requirements: async (session: SessionForChatbot, chatbot: Ulid) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot),
}

export const m3a = {
  key: 'M3A',
  content: () => `To save time, please respond to the questions below in the chat and copy and paste what you’re working on into the document editor.\n
  ❓ What do you need help with today?\n
  💡 What do you think you should do first?`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot) &&
    session.topic !== SUBJECT_TYPES.COLLEGE &&
    isSubjectUsingDocumentEditor(session.toolType),
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session.id },
      { delay: WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true }
    )
  },
}

export const m3b = {
  key: 'M3B',
  content: () => `To save time, please respond to the questions below in the chat and upload any photos or write out problems on the whiteboard.\n
  ❓ What do you need help with today?\n
  💡 What do you think the first step is?`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot) &&
    !isSubjectUsingDocumentEditor(session.toolType),
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session.id },
      { delay: WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true }
    )
  },
}

export const m3c = {
  key: 'M3C',
  content: () => `To save time, please respond to the questions below in the chat and if it makes sense, copy and paste what you’re working on into the document editor.\n
  ❓ What do you hope to accomplish today?\n
  💡 Where do you think we should start?`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) =>
    !session.volunteerJoinedAt &&
    !session.endedAt &&
    !chatbotSentMessage(session, chatbot) &&
    session.topic === SUBJECT_TYPES.COLLEGE,
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session.id },
      { delay: WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true }
    )
  },
}

export const m4 = {
  key: 'M4',
  content: () =>
    `We’re having trouble finding a coach. 😞 Please reply in the chat if we should keep looking  👀 or end the session if you’d rather come back later.`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      (await volunteersAvailableForSession(session.id, session.subject)) &&
      moment().subtract(WAIT_FOR_MATCH - ONE_MINUTE, 'milliseconds') >=
        moment(lastChatbotMsg.createdAt) &&
      (lastChatbotMsg.contents === m3a.content() ||
        lastChatbotMsg.contents === m3b.content() ||
        lastChatbotMsg.contents === m3c.content())
    )
  },
  action: async (session: SessionForChatbot) => {
    await updateActivityStatus(session.id)
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session.id },
      { delay: WAIT_FOR_REPLY, removeOnComplete: true, removeOnFail: true }
    )
  },
}

export const m5 = {
  key: 'M5',
  content: () =>
    `Great! We’re reaching out to more volunteers.  Please give us another 5-10 minutes to see what we can do!`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      lastChatbotMsg.contents === m4.content() &&
      session.messages.some(
        msg =>
          msg.createdAt > lastChatbotMsg.createdAt &&
          session.student === msg.user
      )
    )
  },
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session.id },
      { delay: WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true }
    )
    await textMoreVolunteers(session.id)
  },
}

export const m6 = {
  key: 'M6',
  content: () =>
    `So, it’s been 10 minutes and we still can’t find a coach. 😳 Reply in the chat if you want us to give it one last try, and we’ll keep searching! 🕵🏿‍♀️`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      (await volunteersAvailableForSession(session.id, session.subject)) &&
      moment().subtract(WAIT_FOR_MATCH - ONE_MINUTE, 'milliseconds') >=
        moment(lastChatbotMsg.createdAt) &&
      lastChatbotMsg.contents === m5.content()
    )
  },
  action: async (session: SessionForChatbot) => {
    await updateActivityStatus(session.id)
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session.id },
      { delay: WAIT_FOR_REPLY, removeOnComplete: true, removeOnFail: true }
    )
  },
}

export const m7 = {
  key: 'M7',
  content: () =>
    `Search initiated! 5-10 more minutes please to see what we can do 🙏`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) => {
    const lastChatbotMsg = lastChatbotMessage(session, chatbot)
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      lastChatbotMsg.contents === m6.content() &&
      session.messages.some(
        msg =>
          msg.createdAt > lastChatbotMsg.createdAt &&
          session.student === msg.user
      )
    )
  },
  action: async (session: SessionForChatbot) => {
    await QueueService.add(
      Jobs.Chatbot,
      { sessionId: session.id },
      { delay: WAIT_FOR_MATCH, removeOnComplete: true, removeOnFail: true }
    )
    await textMoreVolunteers(session.id)
  },
}

export const m8 = {
  key: 'M8',
  content: () =>
    `We can’t seem to find a coach for you right now. 😭 Please come back and try again soon—we promise this almost never happens! (tip: if you answered the questions about what you need help with, copy your answer before you go so you can paste it in your next session).`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) => {
    const chatbotMessages = session.messages
      .filter(msg => msg.user === chatbot)
      .sort((x, y) => (x.createdAt > y.createdAt ? 1 : 0))
    const lastChatbotMsg = chatbotMessages.slice(-1)[0]
    return (
      !session.volunteerJoinedAt &&
      !session.endedAt &&
      !!lastChatbotMsg &&
      moment().subtract(WAIT_FOR_MATCH - ONE_MINUTE, 'milliseconds') >=
        moment(lastChatbotMsg.createdAt) &&
      (lastChatbotMsg.contents === m7.content() ||
        ([m3a.content(), m3b.content(), m3c.content()].some(
          content => content === lastChatbotMsg.contents
        ) &&
          !(await volunteersAvailableForSession(session.id, session.subject))))
    )
  },
  action: async (session: SessionForChatbot) => {
    await autoEndSession(session.id)
  },
}

export const m9 = {
  key: 'M9',
  content: () =>
    `Hmm, it doesn’t seem like you’re here anymore. We’ve ended the session for now, but if you come back and still need help, please feel free to request a new session on the dashboard (tip: if you answered the questions about what you need help with, copy your answer before you go so you can paste it in your next session.)`,
  requirements: async (session: SessionForChatbot, chatbot: Ulid) => {
    // sort in reverse order so array.find returns the last instance
    const messages = session.messages.sort((x, y) =>
      x.createdAt < y.createdAt ? 1 : -1
    )
    const lastPromptMsg = messages.find(
      msg => msg.contents === m4.content() || msg.contents === m6.content()
    )
    return (
      !!lastPromptMsg &&
      moment().subtract(WAIT_FOR_REPLY - ONE_MINUTE, 'milliseconds') >=
        moment(lastPromptMsg.createdAt) &&
      !session.messages.some(
        msg =>
          msg.createdAt > lastPromptMsg.createdAt &&
          session.student === msg.user
      )
    )
  },
  action: async (session: SessionForChatbot) => {
    await autoEndSession(session.id)
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
