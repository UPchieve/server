import { Job } from 'bull'
import Redis from 'ioredis'
import { redisClient } from '../../services/RedisService'
import { createSlackAlert } from '../../services/SlackAlertService'
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

type RedisStats = {
  pattern: string
  keyCount: number
  totalMB: string
}

const DEFAULT_KEY_PATTERNS = [
  'user-presence*',
  'user-rewards*',
  'quill*',
  'zwibbler*',
  'getting-started-assignments*',
  'online:subject*',
  'bull*',
  'USER_ROLE_CONTEXT*',
]

function formatRedisStats(stats: RedisStats[]): string {
  const header =
    'Pattern'.padEnd(35) + 'Keys'.padStart(10) + ' | ' + 'MB'.padStart(6)
  const divider = '-'.repeat(65)

  const rows = stats
    .map(
      ({ pattern, keyCount, totalMB }) =>
        pattern.padEnd(35) +
        keyCount.toString().padStart(10) +
        ' | ' +
        totalMB.toString().padStart(6)
    )
    .join('\n')

  return `Redis Key Pattern Stats:\n\n${header}\n${divider}\n${rows}`
}

export async function logRedisKeyMemStats(job: Job<RedisKeyPatterns>) {
  const stats = []

  const keyPatterns = job.data.keyPatterns?.length
    ? job.data.keyPatterns
    : DEFAULT_KEY_PATTERNS

  for (const keyPattern of keyPatterns) {
    stats.push(await getMemoryStatsByPattern(keyPattern, redisClient))
  }

  const formattedStats = formatRedisStats(stats)
  logger.info(formattedStats)

  await createSlackAlert('Redis Memory Usage', formattedStats)
}
