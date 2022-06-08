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
  responseChoiceId: number
  choiceText: string
  displayPriority: number
}

export type PresessionSurveyQuestion = {
  questionText: string
  displayPriority: number
  questionType: string
}
export type PresessionSurvey = {
  questionId: string
  question: PresessionSurveyQuestion
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
    const rowsByQuestion = _.groupBy(rows, v => v.questionId) // dictionary with question: key, and values: array of objects with that id

    const survey: PresessionSurvey[] = []
    // for(const [questionId, rows] of Object.entries(rowsByQuestion)){
    //   const question: PresessionSurveyQuestion = {}
    //   for(const row of rows) {
    //     question[row.questionId] = {
    //       responseChoiceId: row.responseChoiceId,
    //       responseChoiceText: row.responseChoiceText,
    //       responseDisplayPriority: row.responseDisplayPriority
    //     }
    //   }
    //   // survey[question] = responses
    //   survey.push({
    //     questionId: questionId,
    //     questionText: rows.questionText,

    //   })
    // }
    return survey
  } catch (err) {
    throw new RepoReadError(err)
  }
}
