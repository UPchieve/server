import { mocked } from 'jest-mock'
import logger from '../../logger'
import { timeLimit } from '../../utils/time-limit'

jest.mock('../../logger')
const mockedLogger = mocked(logger)

describe('timeLimit', () => {
  it('beats the time limit', async () => {
    const waitInMs = 10
    expect(
      await timeLimit({
        promise: Promise.resolve('it won'),
        waitInMs,
        fallbackReturnValue: 'it lost',
        timeLimitReachedErrorMessage:
          'This test should not throw an error with this message',
      })
    ).toStrictEqual('it won')
    // wait to make sure we successfully cleared the timeout
    await new Promise((r) => setTimeout(r, waitInMs + 10))
    expect(mockedLogger.error).toHaveBeenCalledTimes(0)
  })

  it('beats the time limit but returns an error', async () => {
    const partialErrorMessage = 'rejected error message'
    const waitInMs = 10
    expect(
      await timeLimit({
        promise: Promise.reject(partialErrorMessage),
        waitInMs,
        fallbackReturnValue: 'it lost',
        timeLimitReachedErrorMessage:
          'This test should not throw an error with this message',
      })
    ).toStrictEqual('it lost')
    // wait to make sure we successfully cleared the timeout
    await new Promise((r) => setTimeout(r, waitInMs + 10))
    expect(mockedLogger.error).toHaveBeenCalledTimes(1)
    expect(mockedLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(partialErrorMessage),
      })
    )
  })

  it('loses to time limit', async () => {
    const partialMessage = 'This test should throw an error with this message'
    const result = await timeLimit({
      promise: new Promise((r) => setTimeout(() => r('it won'), 10)),
      fallbackReturnValue: 'it lost',
      timeLimitReachedErrorMessage: partialMessage,
      waitInMs: 1,
    })
    expect(result).toBe('it lost')
    expect(mockedLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(partialMessage),
      })
    )
  })
})
