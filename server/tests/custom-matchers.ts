expect.extend({
  toBeTransactionClient(received: any) {
    if (typeof received.query === 'function') {
      return {
        pass: true,
        message: () =>
          'Expected ${typeof received} not to be a TransactionClient.',
      }
    }
    return {
      pass: false,
      message: () => `Expected ${typeof received} to be a TransactionClient.`,
    }
  },
})

expect.extend({
  toBeTraceClient(received: any) {
    if (typeof received.trace === 'function') {
      return {
        pass: true,
        message: () => `Expected ${typeof received} not to be a TraceClient.`,
      }
    }
    return {
      pass: false,
      message: () => `Expected ${typeof received} to be a TraceClient.`,
    }
  },
})

declare global {
  namespace jest {
    interface Expect {
      toBeTransactionClient(): CustomMatcherResult
      toBeTraceClient(): CustomMatcherResult
    }
  }
}
export {}
