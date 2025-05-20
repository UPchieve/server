/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import * as ModerationInfractionsRepo from '../../models/ModerationInfractions'
import { buildSessionRow } from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import { camelCaseKeys, insertSingleRow } from '../db-utils'

describe('ModerationInfractions', () => {
  const dbClient = getClient()
  const userId = '01919662-885c-d39a-1749-5aaf18cf5d3b'
  let session: any
  const infractionReason = { profanity: ['blah'] }

  beforeAll(async () => {
    session = await insertSingleRow(
      'sessions',
      await buildSessionRow({
        id: getDbUlid(),
        studentId: userId,
      }),
      dbClient
    )
  })

  afterEach(async () => {
    await dbClient.query(
      'DELETE FROM moderation_infractions WHERE user_id = $1',
      [userId]
    )
  })

  describe('insertModerationInfraction', () => {
    it('Inserts the infraction', async () => {
      await ModerationInfractionsRepo.insertModerationInfraction(
        {
          userId,
          sessionId: session.id,
          reason: infractionReason,
        },
        dbClient
      )

      const infractions = await dbClient.query(
        'SELECT * FROM moderation_infractions WHERE user_id = $1',
        [userId]
      )
      expect(infractions.rows.length).toEqual(1)
      expect(camelCaseKeys(infractions.rows[0])).toEqual(
        expect.objectContaining({
          userId,
          sessionId: session.id,
          reason: infractionReason,
        })
      )
    })
  })

  describe('getModerationInfractionsByUserId', () => {
    it('Gets the infractions matching the filters', async () => {
      const secondSession = await buildSessionRow({
        id: getDbUlid(),
        studentId: userId,
      })
      const dbSession = await insertSingleRow(
        'sessions',
        secondSession,
        dbClient
      )
      const insertQuery =
        'INSERT INTO moderation_infractions (id, user_id, session_id, reason, active) VALUES ($1, $2, $3, $4, $5)'
      await dbClient.query(insertQuery, [
        getDbUlid(),
        userId,
        session.id,
        infractionReason,
        true,
      ]) // active
      await dbClient.query(insertQuery, [
        getDbUlid(),
        userId,
        session.id,
        infractionReason,
        false,
      ]) // inactive, first session
      await dbClient.query(insertQuery, [
        getDbUlid(),
        userId,
        dbSession.id,
        infractionReason,
        true,
      ]) // active, 2nd session

      const noFilters =
        await ModerationInfractionsRepo.getModerationInfractionsByUser(userId)
      const activeOnly =
        await ModerationInfractionsRepo.getModerationInfractionsByUser(userId, {
          active: true,
        })
      const inactiveOnly =
        await ModerationInfractionsRepo.getModerationInfractionsByUser(userId, {
          active: false,
        })
      const sessionOneOnly =
        await ModerationInfractionsRepo.getModerationInfractionsByUser(userId, {
          sessionId: session.id,
        })
      const sessionOneActiveOnly =
        await ModerationInfractionsRepo.getModerationInfractionsByUser(userId, {
          sessionId: session.id,
          active: true,
        })

      // No filters
      expect(noFilters.length).toEqual(3)
      // Active filter
      expect(activeOnly.length).toEqual(2)
      expect(activeOnly.map((r) => r.active)).toEqual([true, true])
      // Inactive filter
      expect(inactiveOnly.length).toEqual(1)
      expect(inactiveOnly[0].active).toBeFalsy()
      // Session one filter
      expect(sessionOneOnly.length).toEqual(2)
      expect(sessionOneOnly.map((r) => r.sessionId)).toEqual([
        session.id,
        session.id,
      ])
      // Session one and active filter
      expect(sessionOneActiveOnly.length).toEqual(1)
      expect(sessionOneActiveOnly[0]).toEqual(
        expect.objectContaining({
          sessionId: session.id,
          active: true,
        })
      )
    })
  })

  describe('updateModerationInfractionById', () => {
    it('Updates the infraction', async () => {
      const id = getDbUlid()
      const result = await dbClient.query(
        'INSERT INTO moderation_infractions (id, user_id, session_id, reason) VALUES ($1, $2, $3, $4) RETURNING id',
        [id, userId, session.id, infractionReason]
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
})
