import { getClient } from '../../db'
import { buildSessionRow, buildUserCensorshipRow } from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import { insertSingleRow } from '../db-utils'
import {
  getUserCensorshipsBySessionId,
  insertUserCensorship,
  UserCensorship,
} from '../../models/UserCensorships'
import { normalizeUlid } from './utils'

describe('UserCensorships', () => {
  const dbClient = getClient()

  const studentId = '01919662-885c-d39a-1749-5aaf18cf5d3b'
  const volunteerId = '01919662-8804-8772-ecf7-b08dfa28c6e4'

  describe('getUserCensorshipsForSession', () => {
    it('Gets all user censorships for the session', async () => {
      const sessionId = getDbUlid()
      const sessionRow = await buildSessionRow({
        id: sessionId,
        studentId,
        volunteerId,
        subjectId: 1,
      })
      await insertSingleRow('sessions', sessionRow, dbClient)
      const userCensorshipsRow = buildUserCensorshipRow(sessionId, studentId, {
        reason: 'test reason 1',
      })
      await insertSingleRow('user_censorships', userCensorshipsRow, dbClient)
      const result: UserCensorship[] = await getUserCensorshipsBySessionId(
        sessionId
      )

      expect(result.length).toEqual(1)
      expect(result[0]).toEqual(
        expect.objectContaining({
          reason: 'test reason 1',
          active: true,
        })
      )
      expect(normalizeUlid(result[0].userId)).toEqual(normalizeUlid(studentId))
      expect(normalizeUlid(result[0].sessionId)).toEqual(
        normalizeUlid(sessionId)
      )
    })
  })

  describe('insertUserCensorship', () => {
    it('Inserts the user censorship and reports the correct count by (user_id, session_id)', async () => {
      const sessionId = getDbUlid()
      const sessionRow = await buildSessionRow({
        id: sessionId,
        studentId,
        volunteerId,
        subjectId: 1,
      })
      await insertSingleRow('sessions', sessionRow, dbClient)

      // student has 1 censorship, volunteer has 2
      const studentCensorshipCount = await insertUserCensorship({
        userId: studentId,
        sessionId,
        reason: 'student reason',
        medium: 'audio',
      })
      expect(studentCensorshipCount).toEqual(1)
      const initialVolunteerCensorshipCount = await insertUserCensorship({
        userId: volunteerId,
        sessionId,
        reason: 'volunteer reason 1',
        medium: 'audio',
      })
      expect(initialVolunteerCensorshipCount).toEqual(1)
      const secondVolunteerCensorshipCount = await insertUserCensorship({
        userId: volunteerId,
        sessionId,
        reason: 'volunteer reason 2',
        medium: 'audio',
      })
      expect(secondVolunteerCensorshipCount).toEqual(2)
    })
  })
})
