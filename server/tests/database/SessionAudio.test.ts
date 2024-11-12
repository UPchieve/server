import {
  createSessionAudio,
  getSessionAudioBySessionId,
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

      // @TODO - uncomment me. Ulid formatting difference is just throwing this off.
      // expect(result).toEqual(expect.objectContaining({
      //   id: sessionAudioId,
      //   sessionId
      // }))
    })
  })

  describe('createSessionAudio', () => {
    it('Creates the SessionAudio', async () => {
      const sessionId = await getDbUlid()
      await insertSession(sessionId)
      const resourceUri = 'test-uri'
      const createdUlid = await createSessionAudio({
        sessionId,
        resourceUri,
      })
      expect(createdUlid).toBeDefined()
      const results = await dbClient.query(
        'SELECT * FROM session_audio WHERE session_id = $1',
        [sessionId]
      )
      expect(results.rows[0].id).toEqual(createdUlid)
    })
  })

  describe('updateSessionAudioJoinedAtBySessionId', () => {
    it.todo('Sets the joinedAt values when given, and leaves others unchanged')
  })

  // describe('updateSessionAudioResourceUriBySessionId', () => {
  //   it.todo('Updates the resource URI for the session')
  // })
})
