import { Types } from 'mongoose'
import moment from 'moment'
import { SUBJECTS, SUBJECT_TYPES } from '../../../constants'
import {
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
  WAIT_FOR_MATCH,
  WAIT_FOR_REPLY,
  MESSAGES,
} from '../../../worker/jobs/chatbot/messages'
import {
  getObjectId,
  buildSessionForChatbot,
  buildMessage,
} from '../../generate'

jest.mock('socket.io-client')

describe('Test chatbot message requirements checks', () => {
  const chatbot = getObjectId()

  test('No chatbot message sends to a matched session', async () => {
    const matchedSession = buildSessionForChatbot({
      volunteerJoinedAt: new Date(),
    })

    for (const message of MESSAGES) {
      await expect(
        message.requirements(matchedSession, chatbot)
      ).resolves.toBeFalsy()
    }
  })

  test('No chatbot message sends to an ended session', async () => {
    const endedAt = buildSessionForChatbot({ endedAt: new Date() })

    for (const message of MESSAGES) {
      await expect(message.requirements(endedAt, chatbot)).resolves.toBeFalsy()
    }
  })

  test('m1 only sends for unmatched, unended sessions with no chatbot messages', async () => {
    const newSession = buildSessionForChatbot()
    const chatbotSession = buildSessionForChatbot()
    chatbotSession.messages = [buildMessage({ user: chatbot })]

    await expect(m1.requirements(newSession, chatbot)).resolves.toBeTruthy()
    await expect(m1.requirements(chatbotSession, chatbot)).resolves.toBeFalsy()
  })

  test('m2 only sends for unmatched, unended sessions with no chatbot messages', async () => {
    const newSession = buildSessionForChatbot()
    const chatbotSession = buildSessionForChatbot()
    chatbotSession.messages = [buildMessage({ user: chatbot })]

    await expect(m2.requirements(newSession, chatbot)).resolves.toBeTruthy()
    await expect(m2.requirements(chatbotSession, chatbot)).resolves.toBeFalsy()
  })

  test('m3a only sends for unmatched, unended, non-college document editor sessions with no chatbot messages', async () => {
    const newSession = buildSessionForChatbot({
      subTopic: SUBJECTS.HUMANITIES_ESSAYS,
    })
    const collegeSession = buildSessionForChatbot({
      subTopic: SUBJECTS.ESSAYS,
      type: SUBJECT_TYPES.COLLEGE,
    })
    const whiteboardSession = buildSessionForChatbot({
      subTopic: SUBJECTS.ALGEBRA_ONE,
    })
    const chatbotSession = buildSessionForChatbot()
    chatbotSession.messages = [buildMessage({ user: chatbot })]

    await expect(m3a.requirements(newSession, chatbot)).resolves.toBeTruthy()
    await expect(m3a.requirements(collegeSession, chatbot)).resolves.toBeFalsy()
    await expect(
      m3a.requirements(whiteboardSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(m3a.requirements(chatbotSession, chatbot)).resolves.toBeFalsy()
  })

  test('m3b only sends for unmatched, unended, whiteboard sessions with no chatbot messages', async () => {
    const newSession = buildSessionForChatbot({
      subTopic: SUBJECTS.ALGEBRA_ONE,
    })
    const editorSession = buildSessionForChatbot({ subTopic: SUBJECTS.ESSAYS })
    const chatbotSession = buildSessionForChatbot()
    chatbotSession.messages = [buildMessage({ user: chatbot })]

    await expect(m3b.requirements(newSession, chatbot)).resolves.toBeTruthy()
    await expect(m3b.requirements(editorSession, chatbot)).resolves.toBeFalsy()
    await expect(m3b.requirements(chatbotSession, chatbot)).resolves.toBeFalsy()
  })

  test('m3c only sends for unmatched, unended, college sessions with no chatbot messages', async () => {
    const newSession = buildSessionForChatbot({ type: SUBJECT_TYPES.COLLEGE })
    const hsSession = buildSessionForChatbot({ type: SUBJECT_TYPES.MATH })
    const whiteboardSession = buildSessionForChatbot({
      subTopic: SUBJECTS.ALGEBRA_ONE,
    })
    const chatbotSession = buildSessionForChatbot()
    chatbotSession.messages = [buildMessage({ user: chatbot })]

    await expect(m3c.requirements(newSession, chatbot)).resolves.toBeTruthy()
    await expect(m3c.requirements(hsSession, chatbot)).resolves.toBeFalsy()
    await expect(
      m3c.requirements(whiteboardSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(m3c.requirements(chatbotSession, chatbot)).resolves.toBeFalsy()
  })

  // TODO: test volunteer on deck (with mock)
  test('m4 only sends for unmatched, unended sessions where m3a/b/c was the last chatbot message sent and it was sent at least 10 min ago', async () => {
    const newSession = buildSessionForChatbot()
    const chatbotGoodSession = buildSessionForChatbot()
    chatbotGoodSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m3a.content(),
        createdAt: moment()
          .subtract(WAIT_FOR_MATCH)
          .toDate(),
      }),
    ]
    const chatbotBadSession = buildSessionForChatbot()
    chatbotBadSession.messages = [
      buildMessage({ user: chatbot, contents: m2.content() }),
    ]
    const newChatbotSession = buildSessionForChatbot()
    newChatbotSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m3a.content(),
        createdAt: new Date(),
      }),
    ]

    await expect(m4.requirements(newSession, chatbot)).resolves.toBeFalsy()
    await expect(
      m4.requirements(chatbotBadSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m4.requirements(newChatbotSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m4.requirements(chatbotGoodSession, chatbot)
    ).resolves.toBeTruthy()
  })

  test('m5 only sends for unmatched, unended sessions where m4 was the last chatbot message sent and the student has sent a message since that last chatbot message', async () => {
    const newSession = buildSessionForChatbot()
    const chatbotGoodSession = buildSessionForChatbot()
    chatbotGoodSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m4.content(),
        createdAt: moment()
          .subtract(WAIT_FOR_REPLY)
          .toDate(),
      }),
      buildMessage({
        user: chatbotGoodSession.student as Types.ObjectId,
        createdAt: new Date(),
      }),
    ]
    const chatbotBadSession = buildSessionForChatbot()
    chatbotBadSession.messages = [
      buildMessage({ user: chatbot, contents: m2.content() }),
    ]
    const noStudentChatbotSession = buildSessionForChatbot()
    noStudentChatbotSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m4.content(),
        createdAt: moment()
          .subtract(WAIT_FOR_REPLY)
          .toDate(),
      }),
    ]

    await expect(m5.requirements(newSession, chatbot)).resolves.toBeFalsy()
    await expect(
      m5.requirements(chatbotBadSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m5.requirements(noStudentChatbotSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m5.requirements(chatbotGoodSession, chatbot)
    ).resolves.toBeTruthy()
  })

  // TODO: test volunteer on deck (with mock)
  test('m6 only sends for unmatched, unended sessions where m5 was the last chatbot message sent and it has been at least 10 min since that message', async () => {
    const newSession = buildSessionForChatbot()
    const chatbotGoodSession = buildSessionForChatbot()
    chatbotGoodSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m5.content(),
        createdAt: moment()
          .subtract(WAIT_FOR_MATCH)
          .toDate(),
      }),
    ]
    const chatbotBadSession = buildSessionForChatbot()
    chatbotBadSession.messages = [
      buildMessage({ user: chatbot, contents: m2.content() }),
    ]
    const newChatbotSession = buildSessionForChatbot()
    newChatbotSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m4.content(),
        createdAt: new Date(),
      }),
    ]

    await expect(m6.requirements(newSession, chatbot)).resolves.toBeFalsy()
    await expect(
      m6.requirements(chatbotBadSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m6.requirements(newChatbotSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m6.requirements(chatbotGoodSession, chatbot)
    ).resolves.toBeTruthy()
  })

  test('m7 only sends for unmatched, unended sessions where m6 was the last chatbot message sent and the student has sent a message since that last chatbot message', async () => {
    const newSession = buildSessionForChatbot()
    const chatbotGoodSession = buildSessionForChatbot()
    chatbotGoodSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m6.content(),
        createdAt: moment()
          .subtract(WAIT_FOR_REPLY)
          .toDate(),
      }),
      buildMessage({
        user: chatbotGoodSession.student as Types.ObjectId,
        createdAt: new Date(),
      }),
    ]
    const chatbotBadSession = buildSessionForChatbot()
    chatbotBadSession.messages = [
      buildMessage({ user: chatbot, contents: m2.content() }),
    ]
    const noStudentChatbotSession = buildSessionForChatbot()
    noStudentChatbotSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m6.content(),
        createdAt: moment()
          .subtract(WAIT_FOR_REPLY)
          .toDate(),
      }),
    ]

    await expect(m7.requirements(newSession, chatbot)).resolves.toBeFalsy()
    await expect(
      m7.requirements(chatbotBadSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m7.requirements(noStudentChatbotSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m7.requirements(chatbotGoodSession, chatbot)
    ).resolves.toBeTruthy()
  })

  test('m8 only sends for unmatched, unended sessions where m7 was the last chatbot message sent and it has been at least 10 min since that message', async () => {
    const newSession = buildSessionForChatbot()
    const chatbotGoodSession = buildSessionForChatbot()
    chatbotGoodSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m7.content(),
        createdAt: moment()
          .subtract(WAIT_FOR_MATCH)
          .toDate(),
      }),
    ]
    const chatbotBadSession = buildSessionForChatbot()
    chatbotBadSession.messages = [
      buildMessage({ user: chatbot, contents: m2.content() }),
    ]
    const newChatbotSession = buildSessionForChatbot()
    newChatbotSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m7.content(),
        createdAt: new Date(),
      }),
    ]

    await expect(m8.requirements(newSession, chatbot)).resolves.toBeFalsy()
    await expect(
      m8.requirements(chatbotBadSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m8.requirements(newChatbotSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m8.requirements(chatbotGoodSession, chatbot)
    ).resolves.toBeTruthy()
  })

  test('m9 only sends for unmatched, unended sessions where m4 or m6 was the last chatbot message sent and it has been at least 3 min since that message and the student has not sent a message since that last chatbot message', async () => {
    const newSession = buildSessionForChatbot()
    const chatbotGoodSession = buildSessionForChatbot()
    chatbotGoodSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m6.content(),
        createdAt: moment()
          .subtract(WAIT_FOR_REPLY)
          .toDate(),
      }),
    ]
    const chatbotBadSession = buildSessionForChatbot()
    chatbotBadSession.messages = [
      buildMessage({ user: chatbot, contents: m2.content() }),
    ]
    const studentChatbotSession = buildSessionForChatbot()
    studentChatbotSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m6.content(),
        createdAt: moment()
          .subtract(WAIT_FOR_REPLY)
          .toDate(),
      }),
      buildMessage({
        user: studentChatbotSession.student as Types.ObjectId,
        createdAt: new Date(),
      }),
    ]
    const newChatbotSession = buildSessionForChatbot()
    newChatbotSession.messages = [
      buildMessage({
        user: chatbot,
        contents: m6.content(),
        createdAt: new Date(),
      }),
    ]

    await expect(m9.requirements(newSession, chatbot)).resolves.toBeFalsy()
    await expect(
      m9.requirements(chatbotBadSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m9.requirements(studentChatbotSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m9.requirements(newChatbotSession, chatbot)
    ).resolves.toBeFalsy()
    await expect(
      m9.requirements(chatbotGoodSession, chatbot)
    ).resolves.toBeTruthy()
  })
})
