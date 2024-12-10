import { getClient, getRoClient } from '../../db'
import { RepoCreateError, RepoDeleteError, RepoReadError } from '../Errors'
import {
  getDbUlid,
  makeRequired,
  makeSomeRequired,
  makeSomeOptional,
  Ulid,
} from '../pgUtils'
import * as pgQueries from './pg.queries'
import {
  LegacySurvey,
  SaveUserSurveySubmission,
  SaveUserSurvey,
  SurveyQueryResponse,
  SurveyResponseDefinition,
  SurveyQuestionDefinition,
  SurveyType,
} from './types'
import { fixNumberInt } from '../../utils/fix-number-int'
import { USER_ROLES, USER_ROLES_TYPE } from '../../constants'
import _, { result } from 'lodash'

export async function saveUserSurveyAndSubmissions(
  userId: Ulid,
  surveyData: SaveUserSurvey,
  submissions: SaveUserSurveySubmission[]
): Promise<void> {
  const client = await getClient().connect()
  try {
    await client.query('BEGIN')

    const result = await pgQueries.saveUserSurvey.run(
      {
        surveyId: surveyData.surveyId,
        userId,
        sessionId: surveyData.sessionId ?? undefined,
        progressReportId: surveyData.progressReportId ?? undefined,
        surveyTypeId: surveyData.surveyTypeId,
      },
      getClient()
    )
    if (!result.length) {
      throw new RepoCreateError('Error upserting user survey')
    }

    const survey = makeSomeOptional(result[0], [
      'sessionId',
      'progressReportId',
    ])
    const errors: string[] = []
    for (const submission of submissions) {
      const result = await pgQueries.saveUserSurveySubmissions.run(
        {
          userSurveyId: survey.id,
          questionId: submission.questionId,
          responseChoiceId: submission.responseChoiceId,
          openResponse: submission.openResponse
            ? submission.openResponse
            : undefined,
        },
        client
      )
      if (!result.length && makeRequired(result[0]).ok)
        errors.push(
          `Insert query for user survey submission ${JSON.stringify(
            submission
          )} did not return ok`
        )
    }
    if (errors.length) throw new RepoReadError(errors.join('\n'))
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoCreateError(err)
  } finally {
    client.release()
  }
}

export async function getStudentsPresessionGoal(
  sessionId: Ulid
): Promise<string | undefined> {
  try {
    const result = await pgQueries.getStudentsPresessionGoal.run(
      {
        sessionId,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).goal
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSimpleSurveyDefinition(
  surveyType: SurveyType,
  subjectName?: string
): Promise<SurveyQueryResponse> {
  try {
    const result = await pgQueries.getSimpleSurveyDefinition.run(
      { subjectName, surveyType },
      getClient()
    )
    const resultArr = result.map(v =>
      makeSomeOptional(v, ['responseDisplayImage'])
    )
    return formatSurveyDefinition(resultArr)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getPostsessionSurveyDefinition(
  surveyType: SurveyType,
  sessionId: Ulid,
  userRole: USER_ROLES_TYPE
): Promise<SurveyQueryResponse> {
  try {
    const replacementColumns = await pgQueries.getPostsessionSurveyReplacementColumns.run(
      { surveyType, sessionId, userRole },
      getClient()
    )
    const replacementColumnsArr = replacementColumns.map(c =>
      makeSomeRequired(c, ['id'])
    )
    const surveyDefinitionExceptReplacementColumns = await pgQueries.getPostsessionSurveyDefinitionWithoutReplacementColumns.run(
      { surveyType, sessionId, userRole },
      getClient()
    )

    const resultArr = surveyDefinitionExceptReplacementColumns.map(v =>
      makeSomeOptional(v, ['responseDisplayImage'])
    )
    return formatSurveyDefinition(resultArr, replacementColumnsArr)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type SurveyDefinitionExceptReplacementColumns = {
  surveyId: number
  name?: string
  surveyTypeId: number
  displayPriority: number
  questionId: number
  questionText: string
  questionType: string
  responseId: number
  responseText: string
  responseDisplayImage?: string
  responseDisplayPriority: number
}

export type SurveyReplacementColumn = {
  id: number
  replacementText1?: string
  replacementText2?: string
}

export function formatSurveyDefinition(
  resultArr: SurveyDefinitionExceptReplacementColumns[],
  replacementColumns?: SurveyReplacementColumn[]
): SurveyQueryResponse {
  const rowsByQuestion = _.groupBy(resultArr, v => v.questionId)
  const survey: SurveyQuestionDefinition[] = []
  for (const [question, rows] of Object.entries(rowsByQuestion)) {
    const responses: SurveyResponseDefinition[] = []
    const temp = rows[0]

    let questionText = temp.questionText
    if (replacementColumns) {
      const associatedReplacementColumns = replacementColumns.filter(
        (col: any) => question == col.id
      )[0]
      if (
        associatedReplacementColumns &&
        associatedReplacementColumns.replacementText1
      ) {
        questionText = questionText.replace(
          /%s/,
          associatedReplacementColumns.replacementText1
        )
        if (associatedReplacementColumns.replacementText2) {
          questionText = questionText.replace(
            /%s/,
            associatedReplacementColumns.replacementText2
          )
        }
      }
    }
    const questionData = {
      questionId: question,
      questionText: questionText,
      displayPriority: temp.displayPriority,
      questionType: temp.questionType,
    }

    const sortedRows = rows.sort(
      (a, b) => a.responseDisplayPriority - b.responseDisplayPriority
    )

    for (const row of sortedRows) {
      const responseItem: SurveyResponseDefinition = {
        responseId: row.responseId,
        responseText: row.responseText,
        responseDisplayPriority: row.responseDisplayPriority,
        responseDisplayImage: row.responseDisplayImage,
      }
      responses.push(responseItem)
    }
    survey.push({
      ...questionData,
      responses: responses,
    })
  }
  return {
    surveyId: resultArr[0].surveyId,
    surveyTypeId: resultArr[0].surveyTypeId,
    survey,
  }
}

export type SimpleSurveyResponse = {
  displayLabel: string
  response: string
  score: number
  displayOrder: number
  displayImage?: string
}

export async function getPresessionSurveyResponse(
  sessionId: string
): Promise<SimpleSurveyResponse[]> {
  try {
    const result = await pgQueries.getPresessionSurveyResponse.run(
      { sessionId },
      getClient()
    )
    if (result.length)
      return result.map(row => makeSomeOptional(row, ['displayImage']))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type PostsessionSurveyResponse = {
  userRole: string
  questionText: string
  displayLabel: string
  response?: string
  displayOrder: number
  score: number
}

export async function getPostsessionSurveyResponse(
  sessionId: string,
  userRole: USER_ROLES_TYPE
): Promise<PostsessionSurveyResponse[]> {
  try {
    if (userRole === USER_ROLES.STUDENT) {
      const result = await pgQueries.getStudentPostsessionSurveyResponse.run(
        { sessionId },
        getClient()
      )
      if (result.length)
        return result.map(row => makeSomeOptional(row, ['response']))
      return []
    } else {
      const result = await pgQueries.getVolunteerPostsessionSurveyResponse.run(
        { sessionId },
        getClient()
      )
      if (result.length)
        return result.map(row => makeSomeOptional(row, ['response']))
      return []
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getPostsessionSurveyResponsesForSessionMetrics(
  sessionId: string
): Promise<PostsessionSurveyResponse[]> {
  try {
    const studentResponses = await getPostsessionSurveyResponse(
      sessionId,
      USER_ROLES.STUDENT
    )
    const volunteerResponses = await getPostsessionSurveyResponse(
      sessionId,
      USER_ROLES.VOLUNTEER
    )
    return studentResponses.concat(volunteerResponses)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSessionRating(
  sessionId: string,
  userRole: USER_ROLES_TYPE
): Promise<number | undefined> {
  if (userRole === USER_ROLES.STUDENT) {
    const ratings = await pgQueries.getStudentSessionRating.run(
      { sessionId },
      getRoClient()
    )
    const result = ratings.map(rate => rate.score)
    return result.length ? result[0] : undefined
  }
  const ratings = await pgQueries.getVolunteerSessionRating.run(
    { sessionId },
    getRoClient()
  )
  const result = ratings.map(rate => rate.score)
  return result.length ? result[0] : undefined
}

export async function deleteDuplicateUserSurveys(): Promise<void> {
  try {
    await pgQueries.deleteDuplicateUserSurveys.run(undefined, getClient())
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function getProgressReportSurveyResponse(
  userId: Ulid,
  progressReportId: Ulid
): Promise<SimpleSurveyResponse[]> {
  try {
    const result = await pgQueries.getProgressReportSurveyResponse.run(
      { userId, progressReportId },
      getClient()
    )
    if (result.length)
      return result.map(row => makeSomeOptional(row, ['displayImage']))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export const getStudentPostsessionSurveyGoalQuestionRatings = async (
  userId: string
) => {
  try {
    const ratings = await pgQueries.getStudentPostsessionSurveyGoalQuestionRatings.run(
      {
        userId,
      },
      getRoClient()
    )
    return ratings ?? []
  } catch (err) {
    throw new RepoReadError(err)
  }
}
