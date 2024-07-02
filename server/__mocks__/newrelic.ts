/**
 * NewRelic automocking does not prevent the real agent from being started so
 * we must implement our own manual mock.
 *
 * We also use nrelic.getTransaction and newrelic.startBackgroundTransaction
 * but the files that use these are untested since they jsut set up the worker
 * and listeners. So we only mock new relic functionality used in code
 * that is actually tested.
 */

export default {
  startWebTransaction: (url: string, handler: () => void) => {
    handler()
  },
  startSegment: async (
    name: string,
    record: boolean,
    handler: () => Promise<void>
  ) => {
    await handler()
  },
  addCustomAttribute: (key: string, value: unknown) => {
    return
  },
  recordMetric: (name: string, value: unknown) => {
    return
  },
}
