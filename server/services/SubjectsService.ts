import { asFactory, asString } from '../utils/type-utils'
import * as SubjectsRepo from '../models/Subjects'
import * as FeatureFlagService from './FeatureFlagService'
import Case from 'case'
import { TransactionClient } from '../db'
import { SUBJECTS } from '../constants'
import { Ulid } from '../models/pgUtils'

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

export async function getHighLevelSubjects(userId: Ulid) {
  const isEnabled =
    await FeatureFlagService.getHighLevelSubjectsFeatureFlag(userId)
  if (!isEnabled) {
    return DEFAULT_HIGH_LEVEL_SUBJECTS
  }
  const featureFlagResponse =
    await FeatureFlagService.getHighLevelSubjectsFeatureFlagPayload(userId)
  if (!featureFlagResponse) {
    return DEFAULT_HIGH_LEVEL_SUBJECTS
  }
  return featureFlagResponse
}
