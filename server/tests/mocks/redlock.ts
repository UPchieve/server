// ioredis-mock treats every argument as a key in commands registered with
// defineCommand and no fixed numberOfKeys, which is how Redlock registers its
// scripts, so the real Redlock can never acquire a lock in tests. this
// stand-in runs `using` calls for the same key one at a time, in process.
// use with:
// jest.mock('@sesamecare-oss/redlock', () => jest.requireActual('<path>/mocks/redlock'))
const queues = new Map<string, Promise<unknown>>()

export class Redlock {
  using(keys: string[], _duration: number, routine: () => Promise<unknown>) {
    const key = keys.join(',')
    const previous = queues.get(key) ?? Promise.resolve()
    const run = previous.then(() => routine())
    queues.set(
      key,
      run.catch(() => undefined)
    )
    return run
  }
}
