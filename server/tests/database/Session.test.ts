/**
 * @group database/parallel
 */

import {
  buildSessionAudioTranscriptMessageRow,
  buildSessionMessageRow,
  buildSessionRow,
  buildSessionVoiceMessage,
} from '../mocks/generate'
import { getClient } from '../../db'
import {
  getMessagesForFrontend,
  getFilteredSessionHistory,
  getFilteredSessionHistoryTotalCount,
  getSessionTranscriptItems,
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
        const createdAt = moment().subtract(1, 'hours').toDate()
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

        const total = await getFilteredSessionHistoryTotalCount(studentId)
        expect(total).toEqual(5)

        const firstPage = await getFilteredSessionHistory(studentId, 4, 0)
        const secondPage = await getFilteredSessionHistory(studentId, 4, 4)
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
      const t1 = moment().subtract(5, 'minute').toDate()
      const t2 = moment().subtract(4, 'minutes').toDate()
      const t3 = moment().subtract(3, 'minutes').toDate()
      const t4 = moment().subtract(2, 'minutes').toDate()

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
      expect(messagesInOrder.map((message) => message.createdAt)).toEqual([
        t1,
        t2,
        t3,
        t4,
      ])
      expect(messagesInOrder.map((message) => message.contents)).toEqual([
        '1',
        '2',
        '3',
        voiceMessageId, // for voice messages, the id is returned as the message
      ])
    })
  })

  describe('getSessionTranscript', () => {
    it('Returns the correct message type for each type of message', async () => {
      const endedAt = moment().add(5, 'hours')
      const sessionObject = await buildSessionRow({
        studentId,
        volunteerId,
        endedAt: endedAt.toDate(),
      })
      const session = await insertSingleRow('sessions', sessionObject, dbClient)
      // Student text message
      const studentTextMessage = 'Hi, can you help me with homework?'
      await insertSingleRow(
        'session_messages',
        buildSessionMessageRow(studentId, session.id, {
          senderId: studentId,
          contents: studentTextMessage,
          createdAt: moment().subtract(6, 'minutes').toDate(),
        }),
        dbClient
      )

      // Volunteer text message
      const volunteerTextMessage = 'Sure, what are you working on?'
      await insertSingleRow(
        'session_messages',
        buildSessionMessageRow(volunteerId, session.id, {
          senderId: volunteerId,
          contents: volunteerTextMessage,
          createdAt: moment().subtract(5, 'minutes').toDate(),
        }),
        dbClient
      )

      // Volunteer voice transcription
      const volunteerVoiceTranscription = 'Can you hear me on the mic?'
      await insertSingleRow(
        'session_audio_transcript_messages',
        buildSessionAudioTranscriptMessageRow(volunteerId, session.id, {
          message: volunteerVoiceTranscription,
          saidAt: moment().subtract(4, 'minutes').toDate(),
        }),
        dbClient
      )

      // Student voice transcription
      const studentVoiceTranscription = 'Yup'
      await insertSingleRow(
        'session_audio_transcript_messages',
        buildSessionAudioTranscriptMessageRow(studentId, session.id, {
          message: studentVoiceTranscription,
          saidAt: moment().subtract(3, 'minutes').toDate(),
        }),
        dbClient
      )

      // Volunteer DM
      const volunteerDm = 'Do you still need help with this?'
      await insertSingleRow(
        'session_messages',
        buildSessionMessageRow(volunteerId, session.id, {
          contents: volunteerDm,
          createdAt: endedAt.add(1, 'minute').toDate(),
        }),
        dbClient
      )

      // Student DM
      const studentDm = 'No thanks'
      await insertSingleRow(
        'session_messages',
        buildSessionMessageRow(studentId, session.id, {
          contents: studentDm,
          createdAt: endedAt.add(2, 'minutes').toDate(),
        }),
        dbClient
      )

      const actualTranscript = await getSessionTranscriptItems(session.id) // DMs happen after the session is over
      const expectedTranscript = [
        {
          messageType: 'session_message',
          message: studentTextMessage,
          userId: studentId,
          role: 'student',
        },
        {
          messageType: 'session_message',
          message: volunteerTextMessage,
          userId: volunteerId,
          role: 'volunteer',
        },
        {
          messageType: 'transcription',
          message: volunteerVoiceTranscription,
          userId: volunteerId,
          role: 'volunteer',
        },
        {
          messageType: 'transcription',
          message: studentVoiceTranscription,
          userId: studentId,
          role: 'student',
        },
        {
          messageType: 'direct_message',
          message: volunteerDm,
          userId: volunteerId,
          role: 'volunteer',
        },
        {
          messageType: 'direct_message',
          message: studentDm,
          userId: studentId,
          role: 'student',
        },
      ]

      expect(actualTranscript.length).toEqual(6)
      expect(
        actualTranscript.map((item) => ({
          messageType: item.messageType,
          message: item.message,
          userId: item.userId,
          role: item.role,
        }))
      ).toEqual(expectedTranscript)
    })
  })
})
