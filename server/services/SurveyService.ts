import { Ulid } from '../models/pgUtils'
import {
  getPresessionSurveyResponse,
  getUserPostsessionSurveyResponses,
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
  getSurveyIdForLatestImpactStudySurveySubmission,
  getSimpleSurveyDefinitionBySurveyId,
  getSurveyTypeFromSurveyTypeId,
} from '../models/Survey'
import * as SessionRepo from '../models/Session'
import * as SurveyRepo from '../models/Survey'
import * as UserService from '../services/UserService'
import * as UserRolesService from '../services/UserRolesService'
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
import { USER_ROLES_TYPE, USER_ROLES } from '../constants'
import { partition } from 'lodash'
import { processFeedbackMetrics } from './SessionFlagsService'
import { TransactionClient } from '../db'
import QueueService from './QueueService'
import { Jobs } from '../worker/jobs'

export const asSurveySubmissions = asFactory<SaveUserSurveySubmission>({
  questionId: asNumber,
  responseChoiceId: asOptional(asNumber),
  openResponse: asString,
})

export type SaveSurveyAndSubmissions = SaveUserSurvey & {
  submissions: SaveUserSurveySubmission[]
}

export const asSaveUserSurveyAndSubmissions =
  asFactory<SaveSurveyAndSubmissions>({
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

const FIVE_MINUTES = 1000 * 60 * 5

export async function saveUserSurvey(
  userId: Ulid,
  data: SaveSurveyAndSubmissions,
  tc?: TransactionClient
): Promise<void> {
  const userSurvey = {
    surveyId: data.surveyId,
    sessionId: data.sessionId,
    surveyTypeId: data.surveyTypeId,
    progressReportId: data.progressReportId,
  }
  // Filter out responses the user didn't answer.
  const submissions = data.submissions.filter(
    (resp) => resp.responseChoiceId !== null
  )
  await saveUserSurveyAndSubmissions(userId, userSurvey, submissions, tc)

  // Only process feedback metrics for post-session surveys.
  if (userSurvey.sessionId) {
    const surveyType = await getSurveyTypeFromSurveyTypeId(
      userSurvey.surveyTypeId
    )
    if (surveyType === 'postsession') {
      await processFeedbackMetrics(userSurvey.sessionId)

      const role = await UserRolesService.getRoleContext(userId)
      if (role.activeRole === 'student') {
        await QueueService.add(
          Jobs.MaybeSendStudentFeedbackToVolunteer,
          { sessionId: userSurvey.sessionId },
          { removeOnComplete: true, removeOnFail: false, delay: FIVE_MINUTES }
        )
      }
    }
  }
}

export type PostsessionSurveyRatingsMetric = {
  selfReportedStudentRating: {
    total: number
    average: number
  }
  selfReportedVolunteerRating: {
    total: number
    average: number
  }
  partnerReportedStudentRating: {
    total: number
    average: number
  }
  partnerReportedVolunteerRating: {
    total: number
    average: number
  }
  // Legacy values
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
  userId: string
): Promise<PostsessionSurveyRatingsMetric> => {
  const surveyResponses = await getUserPostsessionSurveyResponses(userId)
  const legacyRole = (await UserRolesService.getRoleContext(userId)).legacyRole

  const getAverage = (ratings: PostsessionSurveyGoalResponse[]): number => {
    if (!ratings.length) return 0
    return ratings.reduce((acc, next) => acc + next.score, 0) / ratings.length
  }

  const [selfSubmissions, partnerSubmissions] = partition(
    surveyResponses,
    (r) => r.submitterUserId === userId
  )

  const [selfRatingAsStudent, selfRatingAsVolunteer] = partition(
    selfSubmissions,
    (r) => r.roleInSession === 'student'
  )
  const [partnerRatingAsVolunteer, partnerRatingAsStudent] = partition(
    partnerSubmissions,
    (r) => r.roleInSession === 'volunteer'
  )

  const selfReportedStudentRating = {
    total: selfRatingAsStudent.length,
    average: getAverage(selfRatingAsStudent),
  }
  const selfReportedVolunteerRating = {
    total: selfRatingAsVolunteer.length,
    average: getAverage(selfRatingAsVolunteer),
  }
  const partnerReportedStudentRating = {
    total: partnerRatingAsVolunteer.length,
    average: getAverage(partnerRatingAsVolunteer),
  }
  const partnerReportedVolunteerRating = {
    total: partnerRatingAsStudent.length,
    average: getAverage(partnerRatingAsStudent),
  }

  return {
    selfReportedStudentRating,
    selfReportedVolunteerRating,
    partnerReportedStudentRating,
    partnerReportedVolunteerRating,
    // Legacy values
    selfReportedRating:
      legacyRole === 'student'
        ? selfReportedStudentRating
        : selfReportedVolunteerRating,
    partnerReportedRating:
      legacyRole === 'student'
        ? partnerReportedStudentRating
        : partnerReportedVolunteerRating,
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
    (await UserService.getUserContactInfo(session.studentId))?.firstName ?? ''
  let coachName: string = ''
  if (session.volunteerId) {
    coachName =
      (await UserService.getUserContactInfo(session.volunteerId))?.firstName ??
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

export async function getLatestImpactStudySurveyResponses(
  userId: Ulid
): Promise<SurveyQueryResponse | undefined> {
  const latestImpactSurveyId =
    await getSurveyIdForLatestImpactStudySurveySubmission(userId)
  if (!latestImpactSurveyId) return

  const [submissions, survey] = await Promise.all([
    getLatestUserSubmissionsForSurveyBySurveyType(userId, 'impact-study'),
    getSimpleSurveyDefinitionBySurveyId(latestImpactSurveyId),
  ])

  const surveyWithSubmissions = survey.survey.map((question) => {
    const matchingSubmission = submissions.find(
      (submission) => submission.questionId === question.questionId
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

export async function getLatestUserSubmissionsForSurveyId(
  userId: Ulid,
  surveyId: number,
  tc?: TransactionClient
) {
  return getLatestUserSubmissionsForSurveyBySurveyId(userId, surveyId, tc)
}

export async function getStudentFeedbackForSession(
  sessionId: Ulid,
  tc?: TransactionClient
) {
  return SurveyRepo.getStudentFeedbackForSession(sessionId, tc)
}
