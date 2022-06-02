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
// @todo: remove and replace this function with the new one
// export async function getPresessionSurveyLegacy(
//   userId: Ulid,
//   sessionId: Ulid
// ): Promise<Survey | undefined> {
//   try {
//     const result = await pgQueries.getPresessionSurveyLegacy.run(
//       {
//         userId,
//         sessionId,
//       },
//       getClient()
//     )
//     if (result.length) {
//       const survey = makeRequired(result[0])
//       return parseQueryResult(survey)
//     }
//   } catch (err) {
//     throw new RepoReadError(err)
//   }
// }

export type SurveyResponseDataType = {
  choiceText: string,
  displayPriority: number
}

export type PresessionSurvey = {
  questionText: string
  displayPriority: number
  questionType: string
  responses: SurveyResponseDataType[]
}

export async function getPresessionSurvey(
  subjectName: string
): Promise<PresessionSurvey[]> {
  try {
    const result = await pgQueries.getPresessionSurvey.run(
      { subjectName },
      getClient()
    )
  
    if (result.length) 
      return result.map(v => makeRequired(v))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}
