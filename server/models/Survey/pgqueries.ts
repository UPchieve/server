import { getClient } from '../../pg'
import { RepoCreateError, RepoReadError } from '../Errors'
import { getDbUlid, makeRequired, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { PgSurvey } from './types'

export type PgSurveyQueryResult = Omit<PgSurvey, 'responseData'> & {
  responseData: pgQueries.Json
}

export function parseQueryResult(result: PgSurveyQueryResult): PgSurvey {
  const responseData =
    typeof result.responseData === 'string'
      ? JSON.parse(result.responseData)
      : {}

  return { ...result, responseData }
}

export async function savePresessionSurvey(
  userId: Ulid,
  sessionId: Ulid,
  responseData: object
): Promise<PgSurvey> {
  try {
    const result = await pgQueries.savePresessionSurvey.run(
      {
        id: getDbUlid(),
        sessionId,
        userId,
        responseData: JSON.stringify(responseData),
      },
      getClient()
    )
    if (result.length) {
      const parsedResult = parseQueryResult(result[0])
      return makeRequired(parsedResult)
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
): Promise<PgSurvey | undefined> {
  try {
    const result = await pgQueries.getPresessionSurvey.run(
      {
        userId,
        sessionId,
      },
      getClient()
    )
    if (result.length) {
      const parsedResult = parseQueryResult(result[0])
      return makeRequired(parsedResult)
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
