import { Ulid } from '../models/pgUtils'
import { getSessionById } from '../models/Session'
import {
  getPresessionSurveyResponse,
  saveUserSurveyAndSubmissions,
  StudentPresessionSurveyResponse,
} from '../models/Survey'
import { getTotalSessionsByUserId } from '../models/User'
import { SaveUserSurvey, SaveUserSurveySubmission } from '../models/Survey'
import {
  asArray,
  asEnum,
  asFactory,
  asNumber,
  asString,
} from '../utils/type-utils'
import { USER_ROLES_TYPE, USER_ROLES, FEEDBACK_EVENTS } from '../constants'
import { emitter } from './EventsService'
import { getSubjectAndTopic } from '../models/Subjects'

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
  const result = await getSubjectAndTopic(subject, topic)
  return !!result
}
