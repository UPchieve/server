/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { insertSessionOffer } from '../../models/SessionOffer'
import { getCanonicalDbUlid } from '../../models/pgUtils'
import { buildSessionRow } from '../mocks/generate'
import { insertSingleRow } from '../db-utils'
import {
  createTestStudent,
  createTestUser,
  createTestVolunteer,
} from './seed-utils'

const client = getClient()

describe('SessionOffer repo', () => {
  describe('insertSessionOffer', () => {
    test('inserts a closed offer with its scoring input and output', async () => {
      const student = await createTestStudent(client)
      const volunteer = await createTestUser(client)
      await createTestVolunteer(client, volunteer.id)
      const session = await buildSessionRow({
        id: getCanonicalDbUlid(),
        studentId: student.user_id,
      })
      await insertSingleRow('sessions', session, client)

      const offeredAt = new Date()
      const input = [
        { volunteerId: volunteer.id, onlineAndWaitingInMs: 60_000 },
      ]
      const output = {
        scorecardVersion: '1',
        ranked: [
          {
            candidate: input[0],
            score: 1,
            metricScores: { timeWaitingForSession: 1 },
          },
        ],
      }

      const id = await insertSessionOffer({
        sessionId: session.id,
        volunteerId: volunteer.id,
        offeredAt,
        outcome: 'shadow-offered',
        closedAt: offeredAt,
        scorecardVersion: output.scorecardVersion,
        input,
        output,
      })

      const { rows } = await client.query(
        'SELECT * FROM session_offers WHERE id = $1',
        [id]
      )
      expect(rows).toEqual([
        expect.objectContaining({
          session_id: session.id,
          volunteer_id: volunteer.id,
          offered_at: offeredAt,
          outcome: 'shadow-offered',
          closed_at: offeredAt,
          scorecard_version: output.scorecardVersion,
          input,
          output,
        }),
      ])
    })
  })
})
