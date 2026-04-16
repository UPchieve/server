import { Rules, TextModerationPattern } from '../models/TextModerationPatterns'
import * as TextModerationPatternsRepo from '../models/TextModerationPatterns/queries'
import * as CacheService from '../cache'
import { minutesInSeconds } from '../utils/time-utils'
import logger from '../logger'

const CACHE_KEY = 'TEXT-MODERATION-PATTERNS'
const CACHE_TTL_SECONDS = minutesInSeconds(5)

export async function insertTextModerationPattern(
  regex: RegExp,
  rules?: Rules
) {
  await TextModerationPatternsRepo.insertTextModerationPattern(regex, rules)
}

export async function getTextModerationPatterns(): Promise<
  TextModerationPattern[]
> {
  const cacheResults = await getPatternsFromCache()
  if (cacheResults) {
    return cacheResults
  }
  const dbResults = await getPatternsFromDb()
  await savePatternsToCache(dbResults)
  return dbResults
}

async function getPatternsFromCache(): Promise<
  TextModerationPattern[] | undefined
> {
  try {
    const cacheResults = await CacheService.getIfExists(CACHE_KEY)
    if (cacheResults) {
      return JSON.parse(cacheResults) as TextModerationPattern[]
    }
  } catch (error) {
    logger.error(
      { error },
      'Failed to read and parse moderation text patterns from cache'
    )
  }
}

async function getPatternsFromDb(): Promise<TextModerationPattern[]> {
  return await TextModerationPatternsRepo.getTextModerationPatterns()
}

async function savePatternsToCache(
  patterns: TextModerationPattern[]
): Promise<void> {
  await CacheService.saveWithExpiration(
    CACHE_KEY,
    JSON.stringify(patterns),
    CACHE_TTL_SECONDS
  )
}
