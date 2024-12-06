import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import {
  makeRequired,
  makeSomeOptional,
  Ulid,
  getDbUlid,
  makeSomeRequired,
} from '../pgUtils'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { SessionAudio } from './types'

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
  resourceUri,
  studentJoinedAt,
  volunteerJoinedAt,
}: {
  sessionId: Ulid
  resourceUri?: string
  studentJoinedAt?: Date
  volunteerJoinedAt?: Date
}): Promise<SessionAudio> {
  try {
    const id = getDbUlid()
    const result = await pgQueries.createSessionAudio.run(
      {
        id,
        sessionId,
        resourceUri,
        studentJoinedAt,
        volunteerJoinedAt,
      },
      getClient()
    )
    return makeSomeOptional(result[0], [
      'resourceUri',
      'volunteerJoinedAt',
      'studentJoinedAt',
    ])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateSessionAudio({
  sessionId,
  studentJoinedAt,
  volunteerJoinedAt,
  resourceUri,
}: {
  sessionId: Ulid
  studentJoinedAt?: Date
  volunteerJoinedAt?: Date
  resourceUri?: string
}): Promise<SessionAudio | undefined> {
  try {
    const result = await pgQueries.updateSessionAudio.run(
      {
        sessionId,
        studentJoinedAt,
        volunteerJoinedAt,
        resourceUri,
      },
      getClient()
    )
    if (result.length)
      return makeSomeOptional(result[0], [
        'studentJoinedAt',
        'volunteerJoinedAt',
        'resourceUri',
      ])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
