import { asFactory, asString } from '../utils/type-utils'
import * as SubjectsRepo from '../models/Subjects'
import Case from 'case'
import { TransactionClient } from '../db'
import { SUBJECTS } from '../constants'
import * as CacheService from '../cache'
import { ComputedSubjectUnlocks } from '../models/Subjects'
import { hoursInSeconds } from '../utils/time-utils'

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

export async function getRequiredCertificationsByComputedSubjectUnlock(): Promise<ComputedSubjectUnlocks> {
  return SubjectsRepo.getRequiredCertificationsByComputedSubjectUnlock()
}

export const COMPUTED_SUBJECT_UNLOCKS_CACHE_KEY = 'COMPUTED_SUBJECT_UNLOCKS'
export async function getCachedComputedSubjectUnlocks(): Promise<ComputedSubjectUnlocks> {
  const cachedValue = await CacheService.getIfExists(
    COMPUTED_SUBJECT_UNLOCKS_CACHE_KEY
  )
  if (cachedValue) {
    return JSON.parse(cachedValue) as ComputedSubjectUnlocks
  }
  const valueFromDb =
    await SubjectsRepo.getRequiredCertificationsByComputedSubjectUnlock()
  await CacheService.saveWithExpiration(
    COMPUTED_SUBJECT_UNLOCKS_CACHE_KEY,
    JSON.stringify(valueFromDb),
    hoursInSeconds(1)
  )
  return valueFromDb
}
