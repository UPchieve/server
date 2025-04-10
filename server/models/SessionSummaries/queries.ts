import { getClient, TransactionClient } from '../../db'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { getDbUlid, makeSomeOptional, Ulid } from '../pgUtils'
import * as pgQueries from './pg.queries'
import { USER_ROLES_TYPE } from '../../constants'
import moment from 'moment'
import { SessionSummary } from './types'

export async function addSessionSummary(
  sessionId: Ulid,
  summary: string,
  userType: USER_ROLES_TYPE,
  tc?: TransactionClient
): Promise<SessionSummary> {
  try {
    const result = await pgQueries.addSessionSummary.run(
      { id: getDbUlid(), sessionId, summary, userType },
      tc ?? getClient()
    )
    if (!result.length)
      throw new RepoCreateError('Insert summary did not return ok')
    return makeSomeOptional(result[0], ['summary'])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getLatestSessionSummary(
  sessionId: Ulid,
  tc?: TransactionClient
): Promise<SessionSummary> {
  try {
    const summaries = await pgQueries.getSessionSummariesBySessionId.run(
      { sessionId },
      tc ?? getClient()
    )
    if (!summaries.length) throw new RepoReadError('No summaries found')

    summaries.sort(
      (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
    )

    return makeSomeOptional(summaries[0], ['summary'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
