import { asFactory, asString } from '../utils/type-utils'
import * as SubjectsRepo from '../models/Subjects'
import Case from 'case'

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
