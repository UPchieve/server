/**
 * @group database/parallel
 */

import {
  createSessionAudio,
  getSessionAudioBySessionId,
  updateSessionAudio,
} from '../../models/SessionAudio'
import { getDbUlid, Ulid } from '../../models/pgUtils'
import { buildSessionAudioRow, buildSessionRow } from '../mocks/generate'
import { getClient } from '../../db'
import { insertSingleRow } from '../db-utils'

describe('SessionAudio', () => {
  const dbClient = getClient()
  const studentId = '01919662-885c-d39a-1749-5aaf18cf5d3b'

  const insertSession = async (id: Ulid) => {
    await insertSingleRow(
      'sessions',
      await buildSessionRow({ id, studentId }),
      dbClient
    )
  }

  const normalizeUlid = (str: string) => str.toLowerCase().replace(/-/g, '')

  describe('getSessionAudioBySessionId', () => {
    it('Returns undefined if no SessionAudio exists for the sessionId', async () => {
      const sessionId = getDbUlid()
      const result = await getSessionAudioBySessionId(sessionId)
      expect(result).toBeUndefined()
    })

    it('Retrieves the SessionAudio for the sessionId', async () => {
      const sessionId = getDbUlid()
      await insertSession(sessionId)
      const sessionAudioId = getDbUlid()
      const sessionAudioRow = buildSessionAudioRow(sessionId, {
        id: sessionAudioId,
      })
      await insertSingleRow('session_audio', sessionAudioRow, dbClient)
      const result = await getSessionAudioBySessionId(sessionAudioRow.sessionId)
      expect(normalizeUlid(result?.id as string)).toEqual(
        normalizeUlid(sessionAudioId)
      )
    })
  })

  describe('createSessionAudio', () => {
    it('Creates the SessionAudio', async () => {
      const sessionId = await getDbUlid()
      await insertSession(sessionId)
      const resourceUri = 'test-uri'
      const studentJoinedAt = new Date()
      const created = await createSessionAudio({
        sessionId,
        resourceUri,
        studentJoinedAt,
      })
      expect(normalizeUlid(created.sessionId)).toEqual(normalizeUlid(sessionId))
      expect(created.resourceUri).toEqual(resourceUri)
      expect(created.studentJoinedAt).toEqual(studentJoinedAt)
      expect(created?.volunteerJoinedAt).toBeUndefined()
    })
  })

  describe('updateSessionAudio', () => {
    it('Updates just the values passed in', async () => {
      const sessionId = await getDbUlid()
      await insertSession(sessionId)
      const created = await createSessionAudio({
        sessionId,
      })
      expect(normalizeUlid(created.sessionId)).toEqual(normalizeUlid(sessionId))

      // Update just joined_at columns
      const studentJoinedAt = new Date()
      const volunteerJoinedAt = new Date()
      const updated = await updateSessionAudio({
        sessionId,
        studentJoinedAt,
        volunteerJoinedAt,
      })
      expect(updated?.volunteerJoinedAt).toEqual(volunteerJoinedAt)
      expect(updated?.studentJoinedAt).toEqual(studentJoinedAt)
      expect(updated?.resourceUri).toBeUndefined()
    })
  })
})
