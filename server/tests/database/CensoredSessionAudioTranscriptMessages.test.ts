import { getClient } from '../../db'
import * as CensoredTranscriptMessagesRepo from '../../models/CensoredSessionAudioTranscriptMessages/queries'
import * as TranscriptMessagesRepo from '../../models/SessionAudioTranscriptMessages/queries'
import { buildSessionRow } from '../mocks/generate'
import { camelCaseKeys, insertSingleRow } from '../db-utils'
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
      const message = 'this is a ***** test'
      const transcriptMessageRow = await TranscriptMessagesRepo.insertSessionAudioTranscriptMessage(
        {
          userId,
          sessionId,
          message,
          saidAt,
        },
        client
      )
      const censoredRow = await CensoredTranscriptMessagesRepo.insertCensoredSessionAudioTranscriptMessages(
        transcriptMessageRow.id,
        'this is a silly test',
        client
      )
      expect(camelCaseKeys(censoredRow)).toEqual(
        expect.objectContaining({
          message: 'this is a silly test',
          sessionAudioTranscriptMessageId: transcriptMessageRow.id,
        })
      )
    })
  })
})
