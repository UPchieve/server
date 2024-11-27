import {
  buildSessionAudioTranscriptMessageRow,
  buildSessionMessageRow,
  buildSessionRow,
  buildSessionVoiceMessage,
} from '../mocks/generate'
import { getClient } from '../../db'
import {
  getMessagesForFrontend,
  getSessionHistory,
  getTotalSessionHistory,
} from '../../models/Session'
import { insertSingleRow } from '../db-utils'
import { range } from 'lodash'
import moment from 'moment'

describe('Session repo', () => {
  const dbClient = getClient()
  const studentId = '01919662-885c-d39a-1749-5aaf18cf5d3b'
  const volunteerId = '01919662-8804-8772-ecf7-b08dfa28c6e4'

  describe('Session history', () => {
    describe('getTotalSessionHistory', () => {
      it('Reports the correct number of total sessions for the user', async () => {
        const timeTutored = 100000
        const endedAt = new Date()
        const createdAt = moment()
          .subtract(1, 'hours')
          .toDate()
        for (const i in range(0, 5)) {
          const sessionRow = await buildSessionRow({
            studentId,
            volunteerId,
            timeTutored,
            createdAt,
            endedAt,
          })
          await insertSingleRow('sessions', sessionRow, dbClient)
        }

        const total = await getTotalSessionHistory(studentId)
        expect(total).toEqual(5)

        const firstPage = await getSessionHistory(studentId, 4, 0)
        const secondPage = await getSessionHistory(studentId, 4, 4)
        expect(firstPage.length).toEqual(4)
        expect(secondPage.length).toEqual(1)
      })
    })
  })

  describe('getMessagesForFrontend', () => {
    let sessionId: string

    beforeAll(async () => {
      const sessionRow = await buildSessionRow(
        {
          studentId,
          volunteerId,
          volunteerJoinedAt: new Date(),
        },
        dbClient
      )
      sessionId = (await insertSingleRow('sessions', sessionRow, dbClient)).id
    })

    it('Returns all session messages', async () => {
      const t1 = moment()
        .subtract(5, 'minute')
        .toDate()
      const t2 = moment()
        .subtract(4, 'minutes')
        .toDate()
      const t3 = moment()
        .subtract(3, 'minutes')
        .toDate()
      const t4 = moment()
        .subtract(2, 'minutes')
        .toDate()

      // A regular chat/text message
      const firstMessage = buildSessionMessageRow(studentId, sessionId, {
        contents: '1',
        createdAt: t1,
      })
      // Audio transcript message
      const secondMessage = buildSessionAudioTranscriptMessageRow(
        studentId,
        sessionId,
        {
          message: '2',
          saidAt: t2,
        }
      )
      const thirdMessage = buildSessionMessageRow(volunteerId, sessionId, {
        contents: '3',
        createdAt: t3,
      })
      const fourthMessage = buildSessionVoiceMessage(volunteerId, sessionId, {
        transcript: '4',
        createdAt: t4,
      })

      await insertSingleRow('session_messages', firstMessage, dbClient)
      await insertSingleRow(
        'session_audio_transcript_messages',
        secondMessage,
        dbClient
      )
      await insertSingleRow('session_messages', thirdMessage, dbClient)
      const voiceMessageId = (
        await insertSingleRow('session_voice_messages', fourthMessage, dbClient)
      ).id

      const messagesInOrder = await getMessagesForFrontend(sessionId, dbClient)
      expect(messagesInOrder.length).toEqual(4)
      expect(messagesInOrder.map(message => message.createdAt)).toEqual([
        t1,
        t2,
        t3,
        t4,
      ])
      expect(messagesInOrder.map(message => message.contents)).toEqual([
        '1',
        '2',
        '3',
        voiceMessageId, // for voice messages, the id is returned as the message
      ])
    })
  })
})
