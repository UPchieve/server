import { getClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import { getDbUlid, makeRequired, makeSomeRequired, Ulid } from '../pgUtils'
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
import _ from 'lodash'

export type LegacySurveyQueryResult = Omit<LegacySurvey, 'responseData'> & {
  responseData: pgQueries.Json
}

// parse a query result containing `responseData` from JSON to an object
export function parseQueryResult(
  result: LegacySurveyQueryResult
): LegacySurvey {
  const responseData =
    typeof result.responseData === 'string'
      ? JSON.parse(result.responseData)
      : result.responseData

  return { ...result, responseData: fixNumberInt(responseData) }
}

export async function savePresessionSurvey(
  userId: Ulid,
  sessionId: Ulid,
  responseData: object
): Promise<LegacySurvey> {
  try {
    const result = await pgQueries.savePresessionSurvey.run(
      {
        id: getDbUlid(),
        userId,
        sessionId,
        responseData: JSON.stringify(responseData),
      },
      getClient()
    )
    if (result.length) {
      const survey = makeRequired(result[0])
      return parseQueryResult(survey)
    }
    throw new RepoCreateError('Error upserting presession survey')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

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
        sessionId: surveyData.sessionId,
        surveyTypeId: surveyData.surveyTypeId,
      },
      getClient()
    )
    if (!result.length) {
      throw new RepoCreateError('Error upserting user survey')
    }

    const survey = makeRequired(result[0])
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

// @todo: clean up old presession survey code
// NOTE: this query can be replaced by a JOIN that happens when we fetch
// the session on the feedback page
export async function getPresessionSurveyForFeedback(
  userId: Ulid,
  sessionId: Ulid
): Promise<LegacySurvey | undefined> {
  try {
    const result = await pgQueries.getPresessionSurveyForFeedback.run(
      {
        userId,
        sessionId,
      },
      getClient()
    )
    if (result.length) {
      const survey = makeRequired(result[0])
      return parseQueryResult(survey)
    }
  } catch (err) {
    throw new RepoReadError(err)
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

export async function getSurveyDefinition(
  subjectName: string,
  surveyType: SurveyType
): Promise<SurveyQueryResponse> {
  try {
    const result = await pgQueries.getSurveyDefinition.run(
      { subjectName, surveyType },
      getClient()
    )

    const resultArr = result.map(v =>
      makeSomeRequired(v, ['responseDisplayImage'])
    )
    const rowsByQuestion = _.groupBy(resultArr, v => v.questionId)

    const survey: SurveyQuestionDefinition[] = []
    for (const [question, rows] of Object.entries(rowsByQuestion)) {
      const responses: SurveyResponseDefinition[] = []
      const temp = rows[0]
      const questionData = {
        questionId: question,
        questionText: temp.questionText,
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

    const data = {
      surveyId: resultArr[0].surveyId,
      surveyTypeId: resultArr[0].surveyTypeId,
      survey,
    }

    return data
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type StudentPresessionSurveyResponse = {
  displayLabel: string
  response: string
  score: number
  displayOrder: number
}

export async function getPresessionSurveyResponse(
  sessionId: string
): Promise<StudentPresessionSurveyResponse[]> {
  try {
    const result = await pgQueries.getPresessionSurveyResponse.run(
      { sessionId },
      getClient()
    )

    if (result.length)
      return result.map(row => makeSomeRequired(row, ['displayImage']))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}
