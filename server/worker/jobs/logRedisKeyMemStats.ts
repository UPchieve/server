import {
  redisClient,
  getMemoryStatsByPattern,
} from '../../services/RedisService'
import logger from '../../logger'

export async function logRedisKeyMemStats() {
  const keyPatterns = [
    'user-presence*',
    'user-rewards*',
    'quill*',
    'zwibbler*',
    'getting-started-assignments*',
    'online:subject*',
  ]
  const stats = []

  for (const keyPattern of keyPatterns) {
    stats.push(await getMemoryStatsByPattern(keyPattern, redisClient))
  }

  logger.info(stats)
}
