import { getClient } from '../../db'
import { RepoCreateError, RepoReadError } from '../Errors'
import { getDbUlid, makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { Survey } from './types'
import { fixNumberInt } from '../../utils/fix-number-int'

export type SurveyQueryResult = Omit<Survey, 'responseData'> & {
  responseData: pgQueries.Json
}

// parse a query result containing `responseData` from JSON to an object
export function parseQueryResult(result: SurveyQueryResult): Survey {
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
): Promise<Survey> {
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

// NOTE: this query can be replaced by a JOIN that happens when we fetch
// the session on the feedback page
export async function getPresessionSurvey(
  userId: Ulid,
  sessionId: Ulid
): Promise<Survey | undefined> {
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

export async function getPresessionSurveyNew(
  subjectName: string
): Promise<PresessionSurvey[]> {
  try {
    const result = await pgQueries.getPresessionSurveyNew.run(
      { subjectName },
      getClient()
    )

    const rows = result.map(v => makeRequired(v))
    const rowsByQuestion = _.groupBy(rows, v => v.questionId)

    const survey: PresessionSurvey[] = []
    for (const [question, rows] of Object.entries(rowsByQuestion)) {
      const responses: PresessionSurveyResponse[] = []
      const questionIndex = 0

      for (const row of rows) {
        const responseItem: PresessionSurveyResponse = {
          responseId: row.responseId,
          responseText: row.responseText,
          responseDisplayPriority: row.responseDisplayPriority,
        }
        responses.push(responseItem)
      }

      survey.push({
        questionId: question,
        questionText: rows[questionIndex].questionText,
        displayPriority: rows[questionIndex].displayPriority,
        questionType: rows[questionIndex].questionType,
        responses: responses,
      })
    }
    return survey
  } catch (err) {
    throw new RepoReadError(err)
  }
}
