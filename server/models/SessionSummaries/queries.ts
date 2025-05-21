import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { getDbUlid, makeRequired, makeSomeOptional, Uuid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { USER_ROLES_TYPE } from '../../constants'
import { SessionSummary } from './types'

export async function addSessionSummary(
  sessionId: Uuid,
  summary: string,
  userType: USER_ROLES_TYPE,
  traceId: string,
  tc?: TransactionClient
): Promise<SessionSummary> {
  try {
    const result = await pgQueries.addSessionSummary.run(
      { id: getDbUlid(), sessionId, summary, traceId, userType },
      tc ?? getClient()
    )
    if (!result.length)
      throw new RepoCreateError('Insert summary did not return ok')
    return makeRequired(result[0])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getSessionSummaryByUserType(
  sessionId: Uuid,
  userType: USER_ROLES_TYPE,
  tc?: TransactionClient
): Promise<SessionSummary | undefined> {
  try {
    const summaries = await pgQueries.getSessionSummaryBySessionId.run(
      { sessionId, userType },
      tc ?? getClient()
    )
    if (summaries.length) return makeSomeOptional(summaries[0], ['traceId'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
