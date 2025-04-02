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
} from '../models/Survey'
import * as SessionRepo from '../models/Session'
import * as SurveyRepo from '../models/Survey'
import * as UserService from '../services/UserService'
import * as UserRolesService from '../services/UserRolesService'
import { getTotalSessionsByUserId } from '../models/User'
import {
  SaveUserSurvey,
  SaveUserSurveySubmission,
  PostsessionSurveyResponse,
} from '../models/Survey'
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
import { partition } from 'lodash'

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
    (resp) => resp.responseChoiceId !== null
  )
  await saveUserSurveyAndSubmissions(userId, userSurvey, submissions)
  if (userSurvey.sessionId)
    emitter.emit(FEEDBACK_EVENTS.FEEDBACK_SAVED, userSurvey.sessionId)
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
  const replacementColumns = await getReplacementColumnOptions(sessionId)

  const postsessionSurveyDefinition =
    (await SurveyRepo.getPostsessionSurveyDefinition(sessionId, userRole)) ?? []

  const survey: SurveyQuestionDefinition[] = []
  for (const question of postsessionSurveyDefinition) {
    if (
      skipQuestion(
        replacementColumns.studentGoal,
        question.firstReplacementColumn,
        question.secondReplacementColumn
      )
    ) {
      continue
    }

    question.questionText = question.questionText
      .replace(
        /%s/,
        getReplacementText(question.firstReplacementColumn, replacementColumns)
      )
      .replace(
        /%s/,
        getReplacementText(question.secondReplacementColumn, replacementColumns)
      )

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
  surveyId: number
) {
  return getLatestUserSubmissionsForSurveyBySurveyId(userId, surveyId)
}

type PostsessionSurveyResponses = Omit<
  PostsessionSurveyResponse,
  'replacementColumnOne' | 'replacementColumnTwo' | 'questionText'
> & {
  displayLabel: string
}

export async function getPostsessionSurveyResponse(
  sessionId: Ulid,
  userRole: USER_ROLES_TYPE
): Promise<PostsessionSurveyResponses[]> {
  const replacementColumns = await getReplacementColumnOptions(sessionId)

  const surveyResponses = await SurveyRepo.getPostsessionSurveyResponse(
    sessionId,
    userRole
  )

  const responses: PostsessionSurveyResponses[] = []

  for (const response of surveyResponses) {
    let displayLabel = response.questionText || ''

    if (
      skipQuestion(
        replacementColumns.studentGoal,
        response.replacementColumnOne,
        response.replacementColumnTwo
      )
    ) {
      continue
    }

    if (displayLabel.includes('%s')) {
      const replacements = [
        response.replacementColumnOne
          ? getReplacementText(
              response.replacementColumnOne,
              replacementColumns
            )
          : null,
        response.replacementColumnTwo
          ? getReplacementText(
              response.replacementColumnTwo,
              replacementColumns
            )
          : null,
      ].filter(Boolean)

      replacements.forEach((replacement) => {
        displayLabel = displayLabel.replace('%s', replacement || '')
      })
    }

    const surveyResponse = {
      userRole: response.userRole,
      displayLabel: displayLabel,
      response: response.response,
      score: response.score,
      displayOrder: response.displayOrder,
    }

    responses.push(surveyResponse)
  }

  return responses
}

function getReplacementText(
  replacementColumn: string | null | undefined,
  replacementColumnValues: {
    studentName: string
    coachName: string
    subjectName: string
    studentGoal: string
  }
): string {
  if (!replacementColumn) return ''

  switch (replacementColumn) {
    case 'student_name':
      return replacementColumnValues.studentName
    case 'coach_name':
      return replacementColumnValues.coachName
    case 'subject_name':
      return replacementColumnValues.subjectName
    case 'student_goal':
      return replacementColumnValues.studentGoal
    default:
      return ''
  }
}

// We wouldn't have a student goal if the student didn't fill out a pre-session survey.
function skipQuestion(
  studentGoal: string,
  first?: string,
  second?: string
): boolean {
  return (first === 'student_goal' || second === 'student_goal') && !studentGoal
}

async function getReplacementColumnOptions(sessionId: Ulid): Promise<{
  studentName: string
  coachName: string
  subjectName: string
  studentGoal: string
}> {
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

  return {
    studentName,
    coachName,
    subjectName,
    studentGoal,
  }
}
