import { getClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { getDbUlid, makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import {
  LegacySurvey,
  SaveUserSurveySubmission,
  SaveUserSurvey,
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
    for (const s of submissions) {
      const result = await pgQueries.saveUserSurveySubmissions.run(
        {
          userSurveyId: survey.id,
          questionId: s.questionId,
          responseChoiceId: s.responseChoiceId,
          openResponse: s.openResponse ? s.openResponse : undefined,
        },
        client
      )
      if (!result.length && makeRequired(result[0]).ok)
        errors.push(
          `Insert query for user survey submission ${JSON.stringify(s)} did not return ok`
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

// NOTE: this query can be replaced by a JOIN that happens when we fetch
// the session on the feedback page
export async function getPresessionSurvey(
  userId: Ulid,
  sessionId: Ulid
): Promise<LegacySurvey | undefined> {
  try {
    const result = await pgQueries.getPresessionSurvey.run(
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

export type PresessionSurveyResponse = {
  responseId: number
  responseText: string
  responseDisplayPriority: number
}

export type PresessionSurvey = {
  questionId: string
  questionText: string
  displayPriority: number
  questionType: string
  responses: PresessionSurveyResponse[]
}

// @todo: clean up old presession survey code and rename functions without the "new" keyword
export async function getPresessionSurveyNew(
  subjectName: string
): Promise<PresessionSurvey[]> {
  try {
    const result = await pgQueries.getPresessionSurveyNew.run(
      { subjectName },
      getClient()
    )

    const resultArr = result.map(v => makeRequired(v))
    const rowsByQuestion = _.groupBy(resultArr, v => v.questionId)

    const survey: PresessionSurvey[] = []
    for (const [question, rows] of Object.entries(rowsByQuestion)) {
      const responses: PresessionSurveyResponse[] = []
      const temp = rows[0]
      const questionData = {
        questionId: question,
        questionText: temp.questionText,
        displayPriority: temp.displayPriority,
        questionType: temp.questionType,
      }

      for (const row of rows) {
        const responseItem: PresessionSurveyResponse = {
          responseId: row.responseId,
          responseText: row.responseText,
          responseDisplayPriority: row.responseDisplayPriority,
        }
        responses.push(responseItem)
      }

      survey.push({
        ...questionData,
        responses: responses,
      })
    }
    return survey
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

    if (result.length) return result.map(row => makeRequired(row))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}
