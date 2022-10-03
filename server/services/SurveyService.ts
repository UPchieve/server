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

export const asSurveySubmissions = asFactory<SaveUserSurveySubmission>({
  questionId: asNumber,
  responseChoiceId: asNumber,
  openResponse: asString,
})

export type SaveSurveyAndSubmissions = SaveUserSurvey & {
  submissions: SaveUserSurveySubmission[]
}

export const asSaveUserSurveyAndSubmissions = asFactory<
  SaveSurveyAndSubmissions
>({
  surveyId: asNumber,
  sessionId: asString,
  surveyTypeId: asNumber,
  submissions: asArray(asSurveySubmissions),
})

type VolunteerContextResponse = {
  totalStudentSessions: number
  responses: StudentPresessionSurveyResponse[]
}

export async function getContextSharingForVolunteer(
  sessionId: Ulid
): Promise<VolunteerContextResponse> {
  const responses = await getPresessionSurveyResponse(sessionId)
  const session = await getSessionById(sessionId)
  const totalStudentSessions = await getTotalSessionsByUserId(session.studentId)
  return {
    totalStudentSessions,
    responses,
  }
}

export async function validateSaveUserSurveyAndSubmissions(
  userId: Ulid,
  data: unknown
): Promise<void> {
  const survey = asSaveUserSurveyAndSubmissions(data)
  const userSurvey = {
    surveyId: survey.surveyId,
    sessionId: survey.sessionId,
    surveyTypeId: survey.surveyTypeId,
  }
  // filter out questions the user didn't answer
  const submissions = survey.submissions.filter(
    resp => resp.responseChoiceId !== null
  )
  await saveUserSurveyAndSubmissions(userId, userSurvey, submissions)
  emitter.emit(FEEDBACK_EVENTS.FEEDBACK_SAVED, survey.sessionId)
}

export const asUserRole = asEnum<USER_ROLES_TYPE>(USER_ROLES)

export function parseUserRole(param: string) {
  const cleanedInput = asUserRole(param)
  return cleanedInput
}
