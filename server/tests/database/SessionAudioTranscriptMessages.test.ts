import { getClient } from '../../db'
import * as SessionAudioTranscriptMessagesRepo from '../../models/SessionAudioTranscriptMessages/queries'
import { buildSessionRow } from '../mocks/generate'
import { insertSingleRow } from '../db-utils'
describe('SessionAudioTranscriptMessages repo', () => {
  const client = getClient()
  const userId = '01919662-885c-d39a-1749-5aaf18cf5d3b'
  let sessionId: string

  beforeAll(async () => {
    const session = await buildSessionRow(
      {
        studentId: userId,
      },
      client
    )
    const inserted = await insertSingleRow('sessions', session, client)
    sessionId = inserted.id
  })

  describe('insertSessionAudioTranscriptMessage', () => {
    it('Inserts the message', async () => {
      const saidAt = new Date()
      const message = 'this is a test'
      const result = await SessionAudioTranscriptMessagesRepo.insertSessionAudioTranscriptMessage(
        {
          userId,
          sessionId,
          message,
          saidAt,
        },
        client
      )
      expect(typeof result).toEqual('string')
    })
  })
})
