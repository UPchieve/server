import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { makeRequired, makeSomeOptional, Ulid, getDbUlid } from '../pgUtils'
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
}: {
  sessionId: Ulid
  resourceUri?: string
}): Promise<SessionAudio> {
  try {
    const id = getDbUlid()
    const result = await pgQueries.createSessionAudio.run(
      {
        id,
        sessionId,
        resourceUri,
      },
      getClient()
    )
    return makeSomeOptional(result[0], [
      'resource_uri',
      'volunteer_joined_at',
      'student_joined_at',
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
}): Promise<SessionAudio> {
  try {
    return await pgQueries.updateSessionAudio.run(
      {
        sessionId,
        studentJoinedAt,
        volunteerJoinedAt,
        resourceUri,
      },
      getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}
