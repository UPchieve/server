import Redis from 'ioredis'
import config from '../config'

export const redisClient = new Redis(config.redisConnectionString)
// Enable Keyspace Notifications for expired events
// this let's us run a callback when a cache key expires
redisClient.config('SET', 'notify-keyspace-events', 'Ex')

export const redisSubClient = new Redis(config.redisConnectionString)

export const EXPIRED_KEY_CHANNEL = '__keyevent@0__:expired'
// Subscribe to the expiration channel
redisSubClient.subscribe(EXPIRED_KEY_CHANNEL)

export async function getMemoryStatsByPattern(
  pattern: string,
  redisClient: Redis.Redis
) {
  let totalBytes = 0
  let keyCount = 0

  const stream = redisClient.scanStream({
    match: pattern,
    count: 1000,
  })

  for await (const keys of stream) {
    const sizes = await Promise.all(
      keys.map(
        async (key: string) =>
          await redisClient.send_command('MEMORY', ['USAGE', key])
      )
    )

    // Use reduce to accumulate total size and key count
    const { batchTotal, batchCount } = sizes.reduce(
      (acc, size) => {
        if (size !== null) {
          acc.batchTotal += Number(size)
          acc.batchCount++
        }
        return acc
      },
      { batchTotal: 0, batchCount: 0 }
    )

    totalBytes += batchTotal
    keyCount += batchCount
  }

  return {
    pattern,
    keyCount,
    totalBytes,
    totalMB: (totalBytes / 1024 / 1024).toFixed(2),
  }
}
