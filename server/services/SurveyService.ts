import { Ulid } from '../models/pgUtils'
import { getSessionById } from '../models/Session'
import {
  getPresessionSurveyResponse,
  saveUserSurveyAndSubmissions,
  StudentPresessionSurveyResponse,
} from '../models/Survey'
import { getTotalSessionsByUserId } from '../models/User'
import { asSaveUserSurveyAndSubmissions } from '../utils/survey-utils'

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
  const submissions = survey.submissions
  await saveUserSurveyAndSubmissions(userId, userSurvey, submissions)
}
