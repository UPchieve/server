test.todo('postgres migration')
/*import { performance } from 'perf_hooks'

import { ChatbotMessage } from '../../../worker/jobs/chatbot/messages'
import { messageControlFlow } from '../../../worker/jobs/chatbot'
import { buildSessionForChatbot } from '../../generate'
import { log } from '../../../worker/logger'
import { getDbUlid } from '../../../models/pgUtils'
jest.mock('socket.io-client')
jest.mock('../../../worker/logger')

const TEST_MESSAGE_DELAY = 100

const conditionOne = jest.fn()
const conditionTwo = jest.fn()
const actionOne = jest.fn()
const actionTwo = jest.fn()

const messageOne: ChatbotMessage = {
  key: 'Message One',
  content: () => 'lorem ipsum',
  requirements: conditionOne,
  action: actionOne,
}

const messageTwo: ChatbotMessage = {
  key: 'Message Two',
  content: () => 'dolor sit amet',
  requirements: conditionTwo,
  action: actionTwo,
}

const fakeMessages = [messageOne, messageTwo]

describe('Test message control flow', () => {
  const session = buildSessionForChatbot()
  const chatbot = getDbUlid()

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Sends only messages for passed condition checks', async () => {
    conditionOne.mockResolvedValueOnce(true)
    conditionTwo.mockResolvedValueOnce(false)

    await expect(
      messageControlFlow(session, chatbot, fakeMessages, TEST_MESSAGE_DELAY)
    ).resolves.not.toThrowError()

    expect(log).toHaveBeenLastCalledWith(
      `Planning to send message ${messageOne.key} to session ${session.id}`
    )
  })

  test('Messages are sent with proper delay', async () => {
    conditionOne.mockResolvedValueOnce(true)
    conditionTwo.mockResolvedValueOnce(true)
    const start = performance.now()

    await expect(
      messageControlFlow(session, chatbot, fakeMessages, TEST_MESSAGE_DELAY)
    ).resolves.not.toThrowError()

    const end = performance.now()
    expect(end - start).toBeGreaterThanOrEqual(TEST_MESSAGE_DELAY * 2)
  })

  test('Gracefully handles errors in condition check', async () => {
    conditionOne.mockResolvedValueOnce(true)
    const testError = new Error('Error in condition two')
    conditionTwo.mockRejectedValueOnce(testError)

    await expect(
      messageControlFlow(session, chatbot, fakeMessages, TEST_MESSAGE_DELAY)
    ).rejects.toThrowError(testError.message)

    expect(log).toHaveBeenLastCalledWith(
      `Planning to send message ${messageOne.key} to session ${session.id}`
    )
  })

  test('Executes actions only for passed condition checks', async () => {
    conditionOne.mockResolvedValueOnce(true)
    conditionTwo.mockResolvedValueOnce(false)

    await expect(
      messageControlFlow(session, chatbot, fakeMessages, TEST_MESSAGE_DELAY)
    ).resolves.not.toThrowError()

    expect(actionOne).toHaveBeenCalled()
    expect(actionTwo).not.toHaveBeenCalled()
  })

  test('Gracefully handles errors in action execution', async () => {
    conditionOne.mockResolvedValueOnce(true)
    conditionTwo.mockResolvedValueOnce(true)
    const testError = new Error('Error in action two')
    actionTwo.mockRejectedValueOnce(testError)

    await expect(
      messageControlFlow(session, chatbot, fakeMessages, TEST_MESSAGE_DELAY)
    ).rejects.toThrowError(testError.message)

    expect(actionOne).toHaveBeenCalled()
    expect(actionTwo).toHaveBeenCalled()
  })
})
*/
