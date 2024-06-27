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

declare global {
  namespace jest {
    interface Expect {
      toBeTransactionClient(): CustomMatcherResult
    }
  }
}
export {}
