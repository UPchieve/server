import {
  Rules,
  TextModerationPattern,
  TextModerationPatternWithFlags,
} from '../models/TextModerationPatterns'
import * as TextModerationPatternsRepo from '../models/TextModerationPatterns'
import * as CacheService from '../cache'
import { minutesInSeconds } from '../utils/time-utils'
import logger from '../logger'

const CACHE_KEY = 'TEXT-MODERATION-PATTERNS'
const CACHE_TTL_SECONDS = minutesInSeconds(5)

export async function insertTextModerationPattern(
  regex: RegExp,
  flags?: string,
  rules?: Rules
) {
  await TextModerationPatternsRepo.insertTextModerationPattern(
    regex,
    flags,
    rules
  )
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
      const parsed = JSON.parse(
        cacheResults
      ) as TextModerationPatternWithFlags[]
      return parsed.map((pattern) => ({
        id: pattern.id,
        regex: new RegExp(pattern.regex, pattern.flags ?? ''),
        rules: pattern.rules,
      }))
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
  patterns: TextModerationPatternWithFlags[]
): Promise<void> {
  await CacheService.saveWithExpiration(
    CACHE_KEY,
    JSON.stringify(
      patterns.map((p) => ({
        id: p.id,
        regex: p.regex.source,
        flags: p.regex.flags || null,
        rules: p.rules,
      }))
    ),
    CACHE_TTL_SECONDS
  )
}
