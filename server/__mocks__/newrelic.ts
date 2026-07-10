/**
 * NewRelic automocking does not prevent the real agent from being started so
 * we must implement our own manual mock.
 */

const transaction = {
  end: jest.fn(),
}

export default {
  noticeError: jest.fn(),
  startWebTransaction: jest.fn(
    async (_url: string, handler: () => unknown) => await handler()
  ),
  startBackgroundTransaction: jest.fn(
    async (_name: string, handler: () => unknown) => await handler()
  ),
  startSegment: jest.fn(
    async (_name: string, _record: boolean, handler: () => unknown) =>
      await handler()
  ),
  getTransaction: jest.fn(() => transaction),
  addCustomAttribute: jest.fn(),
  recordMetric: jest.fn(),
  recordCustomEvent: jest.fn(),
  recordLogEvent: jest.fn(),
}
