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

  describe('deleteAuthSessionsByUserId', () => {
    it('deletes the sessions with the given user', async () => {
      const initialSessions = await getSessions()
      expect(initialSessions.rows.length).toEqual(0)

      const sid = getDbUlid()
      const expiresAt = moment()
        .add(1, 'day')
        .toDate()
      const userId = getDbUlid()
      const sessionJson = JSON.stringify({
        passport: {
          user: userId,
        },
      })
      // Insert session and verify it's there
      await client.query(
        'INSERT INTO auth.session (sid, sess, expire) VALUES ($1, $2, $3);',
        [sid, sessionJson, expiresAt]
      )
      const existingSessions = await getSessions()
      expect(existingSessions.rows.length).toEqual(1)
      expect(existingSessions.rows[0]['sess']['passport']['user']).toEqual(
        userId
      )

      // @TODO - Run the delete query and ensure session is gone.
      // @TODO - Also make sure sessions without that user are still present.
      // @TODO - So, to do the above, insert multiple sessions for userId as well as another for a separate user.
      // deleteAuthSessionsByUserId
    })
  })
})
