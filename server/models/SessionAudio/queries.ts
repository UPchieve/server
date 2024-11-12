import { SessionAudio } from './types'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { makeRequired, makeSomeOptional, Ulid, getDbUlid } from '../pgUtils'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { SessionAudio, SessionAudioCreatedByRole } from './types'

export async function getSessionAudioBySessionId(
  sessionId: Ulid
): Promise<SessionAudio | undefined> {
  try {
    const results = await pgQueries.getSessionAudioBySessionId.run(
      {
        sessionId,
      },
      getClient()
    )
    if (results.length) {
      return makeSomeOptional(results[0], [
        'resourceUri',
        'studentJoinedAt',
        'volunteerJoinedAt',
      ])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createSessionAudio({
  sessionId,
  createdByRole,
  resourceUri,
}: {
  sessionId: Ulid
  createdByRole: SessionAudioCreatedByRole
  resourceUri?: string
}): Promise<Ulid> {
  try {
    const id = getDbUlid()
    const result = await pgQueries.createSessionAudio.run(
      {
        id,
        sessionId,
        createdByRole,
        resourceUri,
      },
      getClient()
    )
    return makeRequired(result[0].createdId)
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateSessionAudioJoinedAtBySessionId({
  sessionId,
  studentJoinedAt,
  volunteerJoinedAt,
}: {
  sessionId: Ulid
  studentJoinedAt?: Date
  volunteerJoinedAt?: Date
}): Promise<void> {
  try {
    await pgQueries.updateSessionAudioJoinedAtBySessionId.run(
      {
        sessionId,
        studentJoinedAt,
        volunteerJoinedAt,
      },
      getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateSessionAudioResourceUriBySessionId({
  sessionId,
  resourceUri,
}: {
  sessionId: Ulid
  resourceUri: string
}): Promise<void> {
  try {
    await pgQueries.updateSessionAudioResourceUriBySessionId.run(
      {
        sessionId,
        resourceUri,
      },
      getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
