import { SessionMeeting } from './types'
import * as pgQueries from './pg.queries'
import { RepoCreateError, RepoReadError } from '../Errors'
import { getClient, TransactionClient } from '../../db'
import { getDbUlid, makeRequired, makeSomeOptional } from '../pgUtils'

export async function insertSessionMeeting(
  sessionId: string,
  externalId: string,
  provider: string,
  client?: TransactionClient
): Promise<SessionMeeting> {
  try {
    const result = await pgQueries.insertSessionMeeting.run(
      {
        id: getDbUlid(),
        sessionId,
        externalId,
        provider,
      },
      client ?? getClient()
    )
    return makeRequired(result[0])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function addRecordingIdToSessionMeeting(
  id: string,
  recordingId: string,
  client?: TransactionClient
): Promise<SessionMeeting> {
  try {
    const result = await pgQueries.addRecordingIdToSessionMeeting.run(
      {
        id,
        recordingId,
      },
      client ?? getClient()
    )
    return makeRequired(result[0])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getSessionMeetingBySessionId(
  sessionId: string,
  client?: TransactionClient
): Promise<SessionMeeting | undefined> {
  try {
    const result = await pgQueries.getSessionMeetingBySessionId.run(
      {
        sessionId,
      },
      client ?? getClient()
    )
    if (result.length) {
      if (result.length > 1) {
        throw new RepoReadError(
          `Found multiple session meetings for session ${sessionId} when max 1 is expected`
        )
      }
      return makeSomeOptional(result[0], ['recordingId'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
