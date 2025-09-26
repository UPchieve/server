import { Job } from 'bull'
import Redis from 'ioredis'
import { redisClient } from '../../services/RedisService'
import logger from '../../logger'

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
    try {
      const sizes = await Promise.all(
        keys.map(
          async (key: string) =>
            await redisClient.send_command('MEMORY', ['USAGE', key])
        )
      )

      // Use reduce to accumulate total size and key count
      const { batchTotal, batchCount } = sizes.reduce(
        (acc, size) => {
          if (size) {
            acc.batchTotal += Number(size)
            acc.batchCount++
          }
          return acc
        },
        { batchTotal: 0, batchCount: 0 }
      )

      totalBytes += batchTotal
      keyCount += batchCount
    } catch (error) {
      logger.error(
        error,
        `Couldn't get redis memory stats for some keys like: ${pattern}`
      )
    }
  }

  return {
    pattern,
    keyCount,
    totalBytes,
    totalMB: (totalBytes / 1024 / 1024).toFixed(2),
  }
}

export interface RedisKeyPatterns {
  keyPatterns: string[]
}

export async function logRedisKeyMemStats(job: Job<RedisKeyPatterns>) {
  const stats = []

  for (const keyPattern of job.data.keyPatterns) {
    stats.push(await getMemoryStatsByPattern(keyPattern, redisClient))
  }

  logger.info(stats, 'Redis Keys Memory Stats')
}
