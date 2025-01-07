import { Ulid } from '../models/pgUtils'
import {
  getPresessionSurveyResponse,
  getStudentPostsessionSurveyGoalQuestionRatings,
  getVolunteerPostsessionSurveyGoalQuestionRatings,
  PostsessionSurveyGoalResponse,
  saveUserSurveyAndSubmissions,
  SimpleSurveyResponse,
  SurveyQueryResponse,
  SurveyQuestionDefinition,
  SurveyResponseDefinition,
  getSimpleSurveyDefinition,
  getLatestUserSubmissionsForSurveyBySurveyType,
  getLatestUserSubmissionsForSurveyBySurveyId,
  SurveryUserResponseDefinition,
} from '../models/Survey'
import * as SessionRepo from '../models/Session'
import * as SurveyRepo from '../models/Survey'
import * as UserRepo from '../models/User'
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
  responseChoiceId: asOptional(asNumber),
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
  const session = await SessionRepo.getSessionById(sessionId)
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

export async function getPostsessionSurveyDefinition(
  sessionId: Ulid,
  userRole: USER_ROLES_TYPE
): Promise<SurveyQueryResponse | undefined> {
  // Get the replacement column options.
  const session = await SessionRepo.getSessionById(sessionId)
  const studentName =
    (await UserRepo.getUserContactInfoById(session.studentId))?.firstName ?? ''
  let coachName: string = ''
  if (session.volunteerId) {
    coachName =
      (await UserRepo.getUserContactInfoById(session.volunteerId))?.firstName ??
      ''
  }
  const subjectName = session.subjectDisplayName
  const studentGoal =
    (await SurveyRepo.getStudentsPresessionGoal(sessionId)) ?? ''

  const postsessionSurveyDefinition =
    (await SurveyRepo.getPostsessionSurveyDefinition(sessionId, userRole)) ?? []

  const survey: SurveyQuestionDefinition[] = []
  for (const question of postsessionSurveyDefinition ?? []) {
    if (
      skipQuestion(
        question.firstReplacementColumn,
        question.secondReplacementColumn
      )
    ) {
      continue
    }

    question.questionText = question.questionText
      .replace(/%s/, getReplacementText(question.firstReplacementColumn))
      .replace(/%s/, getReplacementText(question.secondReplacementColumn))
    survey.push({
      questionId: question.questionId,
      questionText: question.questionText,
      displayPriority: question.displayPriority,
      questionType: question.questionType,
      responses: (question.responses as SurveyResponseDefinition[]).sort(
        (a, b) =>
          (a.responseDisplayPriority ?? 0) - (b.responseDisplayPriority ?? 0)
      ),
    })
  }

  if (postsessionSurveyDefinition.length) {
    return {
      surveyId: postsessionSurveyDefinition[0].surveyId,
      surveyTypeId: postsessionSurveyDefinition[0].surveyTypeId,
      survey,
    }
  }

  function skipQuestion(first?: string, second?: string) {
    // We wouldn't have a student goal if the student didn't fill out a pre-session survey.
    return (
      (first === 'student_goal' || second === 'student_goal') && !studentGoal
    )
  }

  function getReplacementText(replacementColumn?: string): string {
    if (!replacementColumn) return ''

    switch (replacementColumn) {
      case 'student_name':
        return studentName
      case 'coach_name':
        return coachName
      case 'subject_name':
        return subjectName
      case 'student_goal':
        return studentGoal
      default:
        return ''
    }
  }
}

export async function getImpactSurveyDefinition() {
  return getSimpleSurveyDefinition('impact-study')
}

export async function getImpactStudySurveyResponses(
  userId: Ulid
): Promise<SurveyQueryResponse> {
  const [submissions, survey] = await Promise.all([
    getLatestUserSubmissionsForSurveyBySurveyType(userId, 'impact-study'),
    getSimpleSurveyDefinition('impact-study'),
  ])

  const surveyWithSubmissions = survey.survey.map(question => {
    const matchingSubmission = submissions.find(
      submission => submission.questionId === question.questionId
    )

    const userResponse = matchingSubmission
      ? ({
          responseId: matchingSubmission.responseId,
          response: matchingSubmission.response,
        } as SurveryUserResponseDefinition)
      : undefined

    return {
      ...question,
      userResponse,
    }
  })

  return {
    ...survey,
    survey: surveyWithSubmissions,
  }
}
