import { Job } from 'bull'
import {
  redisClient,
  getMemoryStatsByPattern,
} from '../../services/RedisService'
import logger from '../../logger'

export interface RedisKeyPatterns {
  keyPatterns: string[]
}

export async function logRedisKeyMemStats(job: Job<RedisKeyPatterns>) {
  const stats = []

  for (const keyPattern of job.data.keyPatterns) {
    stats.push(await getMemoryStatsByPattern(keyPattern, redisClient))
  }

  logger.info(stats)
}
