import { Ulid } from '../models/pgUtils'
import { getSessionById } from '../models/Session'
import {
  getPresessionSurveyResponse,
  getStudentPostsessionSurveyGoalQuestionRatings,
  getVolunteerPostsessionSurveyGoalQuestionRatings,
  PostsessionSurveyGoalResponse,
  saveUserSurveyAndSubmissions,
  SimpleSurveyResponse,
} from '../models/Survey'
import { getTotalSessionsByUserId } from '../models/User'
import { SaveUserSurvey, SaveUserSurveySubmission } from '../models/Survey'
import {
  asArray,
  asEnum,
  asFactory,
  asNumber,
  asOptional,
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
  sessionId: asOptional(asString),
  progressReportId: asOptional(asString),
  surveyTypeId: asNumber,
  submissions: asArray(asSurveySubmissions),
})

type VolunteerContextResponse = {
  totalStudentSessions: number
  responses: SimpleSurveyResponse[]
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

export async function saveUserSurvey(
  userId: Ulid,
  data: unknown
): Promise<void> {
  const survey = asSaveUserSurveyAndSubmissions(data)
  const userSurvey = {
    surveyId: survey.surveyId,
    sessionId: survey.sessionId,
    surveyTypeId: survey.surveyTypeId,
    progressReportId: survey.progressReportId,
  }
  // filter out questions the user didn't answer
  const submissions = survey.submissions.filter(
    resp => resp.responseChoiceId !== null
  )
  await saveUserSurveyAndSubmissions(userId, userSurvey, submissions)
  if (userSurvey.sessionId)
    emitter.emit(FEEDBACK_EVENTS.FEEDBACK_SAVED, userSurvey.sessionId)
}

export type PostsessionSurveyRatingsMetric = {
  selfReportedRating: {
    total: number
    average: number
  }
  partnerReportedRating: {
    total: number
    average: number
  }
}
export const getUserPostsessionGoalRatingsMetrics = async (
  userId: string,
  userRole: string
): Promise<PostsessionSurveyRatingsMetric> => {
  const isTutor = userRole === 'volunteer' || userRole === 'admin'
  const ratingsFromStudentsRaw = await getStudentPostsessionSurveyGoalQuestionRatings(
    userId
  )
  const ratingsFromVolunteersRaw = await getVolunteerPostsessionSurveyGoalQuestionRatings(
    userId
  )

  const getAverage = (ratings: PostsessionSurveyGoalResponse[]): number => {
    if (!ratings.length) return 0
    return ratings.reduce((acc, next) => acc + next.score, 0) / ratings.length
  }

  const studentRating = {
    total: ratingsFromStudentsRaw.length,
    average: getAverage(ratingsFromStudentsRaw),
  }
  const volunteerRating = {
    total: ratingsFromVolunteersRaw.length,
    average: getAverage(ratingsFromVolunteersRaw),
  }

  const selfReportedRating = isTutor ? volunteerRating : studentRating
  const partnerReportedRating = isTutor ? studentRating : volunteerRating

  return {
    selfReportedRating,
    partnerReportedRating,
  }
}

export const asUserRole = asEnum<USER_ROLES_TYPE>(USER_ROLES)

export function parseUserRole(param: string) {
  const cleanedInput = asUserRole(param)
  return cleanedInput
}
