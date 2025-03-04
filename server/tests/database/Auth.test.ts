/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { getDbUlid } from '../../models/pgUtils'
import moment from 'moment'
import { deleteAuthSessionsByUserId } from '../../models/Auth'

describe('Auth', () => {
  const client = getClient()

  const getSessions = async () => {
    return client.query('SELECT * FROM auth.session;')
  }

  afterAll(async () => {
    await client.query('DELETE FROM auth.session;')
  })

  it('deleteAuthSessionsByUserId deletes all sessions with the given user', async () => {
    const initialSessions = await getSessions()
    expect(initialSessions.rows.length).toEqual(0)

    const user1Sid1 = getDbUlid()
    const user1Sid2 = getDbUlid()
    const user2Sid = getDbUlid()
    const expiresAt = moment().add(1, 'day').toDate()
    const user1Id = getDbUlid()
    const user2Id = getDbUlid()
    const user1SessionJson = JSON.stringify({
      passport: {
        user: user1Id,
      },
    })
    const user2SessionJson = JSON.stringify({
      passport: {
        user: user2Id,
      },
    })

    // Insert 2 sessions for user 1 and 1 for user 2
    await client.query(
      `
      INSERT INTO auth.session
      (sid, sess, expire)
      VALUES
      ($1, $2, $3),
      ($4, $2, $3),
      ($5, $6, $3);`,
      [
        user1Sid1,
        user1SessionJson,
        expiresAt,
        user1Sid2,
        user2Sid,
        user2SessionJson,
      ]
    )
    // Verify initial state
    const existingSessions = await getSessions()
    const user1Rows = [existingSessions.rows[0], existingSessions.rows[1]]
    const user2Row = existingSessions.rows[2]
    expect(existingSessions.rows.length).toEqual(3)
    user1Rows.forEach((row) => {
      expect(row['sess']['passport']['user']).toEqual(user1Id)
    })
    expect(user2Row['sess']['passport']['user']).toEqual(user2Id)

    // Now delete all auth sessions for user 1. Only the user 2 session should remain.
    await deleteAuthSessionsByUserId(user1Id)
    const updatedSessions = await getSessions()
    expect(updatedSessions.rows.length).toEqual(1)
    expect(updatedSessions.rows[0]['sess']['passport']['user']).toEqual(user2Id)
  })
})
