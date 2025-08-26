import { asFactory, asString } from '../utils/type-utils'
import * as SubjectsRepo from '../models/Subjects'
import * as FeatureFlagService from './FeatureFlagService'
import Case from 'case'
import { TransactionClient } from '../db'
import { SUBJECTS } from '../constants'
import { Ulid } from '../models/pgUtils'
import * as CacheService from '../cache'
import config from '../config'
import logger from '../logger'

export const HIGH_LEVEL_SUBJECTS_ENABLED_CACHE_KEY =
  'high-level-subjects-enabled'
export const HIGH_LEVEL_SUBJECTS_VALUE_CACHE_KEY = 'high-level-subjects'
export const DEFAULT_HIGH_LEVEL_SUBJECTS = [
  SUBJECTS.CALCULUS_AB,
  SUBJECTS.CHEMISTRY,
  SUBJECTS.STATISTICS,
]

export type ValidSubjectAndTopicCheck = {
  subject: string
  topic: string
}

export const asValidSubjectAndTopicCheck = asFactory<ValidSubjectAndTopicCheck>(
  {
    subject: asString,
    topic: asString,
  }
)

export async function isValidSubjectAndTopic(data: unknown): Promise<boolean> {
  const { subject, topic } = asValidSubjectAndTopicCheck(data)
  const result = await SubjectsRepo.getSubjectAndTopic(
    Case.camel(subject),
    Case.camel(topic)
  )
  return !!result
}

export async function getTopics(): Promise<SubjectsRepo.GetTopicsResult[]> {
  return SubjectsRepo.getTopics()
}

export async function getTopicIdFromName(
  topicName: string = '',
  tc: TransactionClient
) {
  if (!topicName) return
  return SubjectsRepo.getTopicIdFromName(topicName, tc)
}

export async function getSubjectsForTopicByTopicId(
  topicId: number,
  tc?: TransactionClient
) {
  return SubjectsRepo.getSubjectsForTopicByTopicId(topicId, tc)
}

export async function getSubjectsWithTopic() {
  return SubjectsRepo.getSubjectsWithTopic()
}

export async function getHighLevelSubjects(userId: Ulid): Promise<SUBJECTS[]> {
  /*
  For performance reasons, attempt to read from the cache first.
  High Level Subjects has enabled/disabled status as well as a list of subjects.
  When disabled, use a default list.
   */
  try {
    const isEnabledCache = await CacheService.getIfExists(
      HIGH_LEVEL_SUBJECTS_ENABLED_CACHE_KEY
    )
    if (isEnabledCache && isEnabledCache.toLowerCase() === 'true') {
      return getAndMaybeSetHighLevelSubjects(userId)
    }
    const isEnabledFeatureFlag =
      await FeatureFlagService.getHighLevelSubjectsFeatureFlag(userId)
    const isEnabled = isEnabledFeatureFlag ?? false
    await CacheService.saveWithExpiration(
      HIGH_LEVEL_SUBJECTS_ENABLED_CACHE_KEY,
      JSON.stringify(isEnabled),
      config.highLevelSubjectsCacheTtl
    )
    if (!isEnabled) {
      return DEFAULT_HIGH_LEVEL_SUBJECTS
    }
    return await getAndMaybeSetHighLevelSubjects(userId)
  } catch (err) {
    logger.error(
      { err },
      'Failed to fetch high level subjects. Using default list'
    )
    return DEFAULT_HIGH_LEVEL_SUBJECTS
  }
}

async function getAndMaybeSetHighLevelSubjects(
  userId: Ulid
): Promise<SUBJECTS[]> {
  const cacheValue = await CacheService.getIfExists(
    HIGH_LEVEL_SUBJECTS_VALUE_CACHE_KEY
  )
  if (cacheValue) {
    return JSON.parse(cacheValue)
  }
  const highLevelSubjectsFeatureFlag =
    await FeatureFlagService.getHighLevelSubjectsFeatureFlagPayload(userId)
  const highLevelSubjects =
    highLevelSubjectsFeatureFlag ?? DEFAULT_HIGH_LEVEL_SUBJECTS
  await CacheService.saveWithExpiration(
    HIGH_LEVEL_SUBJECTS_VALUE_CACHE_KEY,
    JSON.stringify(highLevelSubjects),
    config.highLevelSubjectsCacheTtl
  )
  return highLevelSubjects
}
