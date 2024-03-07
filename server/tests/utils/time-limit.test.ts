import logger from '../../logger'
import { timeLimit } from '../../utils/time-limit'

describe('timeLimit', () => {
  it('beats the time limit', async () => {
    expect(
      await timeLimit({
        promise: Promise.resolve('it won'),
        fallbackReturnValue: 'it lost',
        timeLimitReachedErrorMessage:
          'This test should not throw an error with this message',
      })
    ).toStrictEqual('it won')
  })

  it('beats the time limit but returns an error', async () => {
    const partialErrorMessage = 'rejected error message'
    expect(
      await timeLimit({
        promise: Promise.reject(partialErrorMessage),
        waitInMs: 10,
        fallbackReturnValue: 'it lost',
        timeLimitReachedErrorMessage:
          'This test should not throw an error with this message',
      })
    ).toStrictEqual('it lost')
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(partialErrorMessage),
      })
    )
  })

  it('loses to time limit', async () => {
    const partialMessage = 'This test should throw an error with this message'
    const result = await timeLimit({
      promise: new Promise(r => {
        setTimeout(() => r('it won'), 10)
      }),
      fallbackReturnValue: 'it lost',
      timeLimitReachedErrorMessage: partialMessage,
      waitInMs: 1,
    })
    expect(result).toBe('it lost')
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(partialMessage),
      })
    )
  })
})
