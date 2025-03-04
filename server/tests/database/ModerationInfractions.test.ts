/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import * as ModerationInfractionsRepo from '../../models/ModerationInfractions/queries'
import {
  buildModerationInfractionRow,
  buildSessionRow,
} from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import { insertSingleRow } from '../db-utils'

describe('ModerationInfractions', () => {
  const dbClient = getClient()
  const userId = '01919662-885c-d39a-1749-5aaf18cf5d3b'
  let sessionId = getDbUlid()
  let session: any
  const infractionReason = { profanity: ['blah'] }

  beforeAll(async () => {
    session = await buildSessionRow({
      id: sessionId,
      studentId: userId,
    })
    await insertSingleRow('sessions', session, dbClient)
  })

  describe('insertModerationInfraction', () => {
    it('Inserts the infraction and returns the count by (user, session)', async () => {
      const count = await ModerationInfractionsRepo.insertModerationInfraction(
        {
          userId,
          sessionId,
          reason: infractionReason,
        },
        dbClient
      )
      expect(count).toEqual(1)
    })
  })

  describe('updateModerationInfractionById', () => {
    it('Updates the infraction', async () => {
      const id = getDbUlid()
      const result = await dbClient.query(
        'INSERT INTO moderation_infractions (id, user_id, session_id, reason) VALUES ($1, $2, $3, $4) RETURNING id',
        [id, userId, sessionId, infractionReason]
      )
      expect(result.rows.length).toEqual(1)
      const infractionId = result.rows[0].id
      const inserted = await dbClient.query(
        'SELECT id, active FROM moderation_infractions WHERE id = $1',
        [infractionId]
      )
      expect(inserted.rows.length).toEqual(1)
      expect(inserted.rows[0].active).toEqual(true)

      await ModerationInfractionsRepo.updateModerationInfractionById(
        id,
        {
          active: false,
        },
        dbClient
      )
      const updated = await dbClient.query(
        'SELECT id, active FROM moderation_infractions WHERE id = $1',
        [id]
      )
      expect(updated.rows.length).toEqual(1)
      expect(updated.rows[0].active).toEqual(false)
    })
  })

  describe('getModerationInfractionsByUserAndSession', () => {
    it('Returns the infractions', async () => {
      const infractionReason1 = {
        profanity: ['la', 'di', 'da'],
      }
      const infractionReason2 = {
        ...infractionReason1,
        phone: ['8608281234'],
      }
      const sessionId = getDbUlid()
      const session = await buildSessionRow(
        {
          id: sessionId,
          studentId: userId,
        },
        dbClient
      )
      await insertSingleRow('sessions', session, dbClient)

      const infractions = [
        buildModerationInfractionRow(userId, sessionId, {
          reason: infractionReason1,
        }),
        buildModerationInfractionRow(userId, sessionId, {
          reason: infractionReason2,
        }),
      ]
      await insertSingleRow('moderation_infractions', infractions[0], dbClient)
      await insertSingleRow('moderation_infractions', infractions[1], dbClient)
      const result =
        await ModerationInfractionsRepo.getModerationInfractionsByUserAndSession(
          userId,
          sessionId,
          dbClient
        )
      expect(result.length).toEqual(2)
      expect(result.map((infraction) => infraction.reason)).toEqual([
        infractionReason1,
        infractionReason2,
      ])
    })
  })
})
