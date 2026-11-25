/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import * as SessionMeetingsRepo from '../../models/SessionMeeting/queries'
import { buildSessionRow } from '../mocks/generate'
import { insertSingleRow } from '../db-utils'

describe('SessionMeeting repo', () => {
  const client = getClient()
  const userId = '01919662-885c-d39a-1749-5aaf18cf5d3b'
  let sessionId: string

  beforeAll(async () => {
    const session = await buildSessionRow({ studentId: userId }, client)
    const inserted = await insertSingleRow('sessions', session, client)
    sessionId = inserted.id
  })

  describe('insertSessionMeeting', () => {
    it('Returns the new meeting before it has a recording', async () => {
      const result = await SessionMeetingsRepo.insertSessionMeeting(
        sessionId,
        'chime-meeting-id',
        'chime',
        client
      )

      expect(result).toEqual(
        expect.objectContaining({
          sessionId,
          externalId: 'chime-meeting-id',
          provider: 'chime',
          recordingId: undefined,
        })
      )
    })
  })
})
