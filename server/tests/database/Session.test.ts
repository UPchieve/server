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
  getFilteredSessionHistory,
  getFilteredSessionHistoryTotalCount,
  getMessagesForFrontend,
  updateSessionFlagsById,
} from '../../models/Session'
import { insertSingleRow } from '../db-utils'
import { range } from 'lodash'
import moment from 'moment'
import { UserSessionFlags } from '../../constants'

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

  describe('updateSessionFlagsById', () => {
    let session: any

    beforeEach(async () => {
      const sessionObj = await buildSessionRow({ studentId }, dbClient)
      session = await insertSingleRow('sessions', sessionObj, dbClient)
    })

    const getSessionFlagNameById = (id: number): UserSessionFlags => {
      let flag: UserSessionFlags | null = null
      switch (id) {
        case 17:
          flag = UserSessionFlags.coachReportedStudentDm
          break
        case 18:
          flag = UserSessionFlags.studentReportedCoachDm
          break
        case 25:
          flag = UserSessionFlags.hateSpeech
          break
        case 26:
          flag = UserSessionFlags.inappropriateConversation
          break
        case 27:
          flag = UserSessionFlags.platformCircumvention
          break
        case 28:
          flag = UserSessionFlags.pii
          break
        case 29:
          flag = UserSessionFlags.safetyConcern
          break
        case 30:
          flag = UserSessionFlags.generalModerationIssue
          break
      }
      if (!flag) throw new Error(`Unknown flag with id ${id}`)
      return flag
    }

    it('Inserts a single flag', async () => {
      const flagsToInsert = [UserSessionFlags.pii]
      await updateSessionFlagsById(session.id, flagsToInsert)
      const actualFlags = await dbClient.query(
        'SELECT * FROM sessions_session_flags WHERE session_id = $1',
        [session.id]
      )
      expect(actualFlags.rows.length).toEqual(1)
      expect(
        getSessionFlagNameById(actualFlags.rows[0].session_flag_id)
      ).toEqual(flagsToInsert[0])
    })

    it('Inserts multiple flags', async () => {
      const flagsToInsert = [
        UserSessionFlags.pii,
        UserSessionFlags.safetyConcern,
        UserSessionFlags.coachReportedStudentDm,
      ]
      await updateSessionFlagsById(session.id, flagsToInsert)
      const actualFlags = await dbClient.query(
        'SELECT * FROM sessions_session_flags WHERE session_id = $1',
        [session.id]
      )
      expect(actualFlags.rows.length).toEqual(3)
      const actualFlagNames = actualFlags.rows.map((flagRow) =>
        getSessionFlagNameById(flagRow.session_flag_id)
      )
      expect(new Set(actualFlagNames)).toEqual(new Set(flagsToInsert))
    })

    it('If the flag already exists, does not insert a new one', async () => {
      const flag = UserSessionFlags.pii
      await updateSessionFlagsById(session.id, [flag])
      const firstResult = await dbClient.query(
        'SELECT * FROM sessions_session_flags WHERE session_id = $1',
        [session.id]
      )
      expect(firstResult.rows.length).toEqual(1)
      expect(
        getSessionFlagNameById(firstResult.rows[0].session_flag_id)
      ).toEqual(flag)

      const nextFlagsToInsert = [
        UserSessionFlags.safetyConcern,
        UserSessionFlags.pii,
        UserSessionFlags.generalModerationIssue,
      ]
      await updateSessionFlagsById(session.id, nextFlagsToInsert)
      const secondResult = await dbClient.query(
        'SELECT * FROM sessions_session_flags WHERE session_id = $1',
        [session.id]
      )
      expect(secondResult.rows.length).toEqual(3)
      const insertedFlagNames = secondResult.rows.map((row) =>
        getSessionFlagNameById(row.session_flag_id)
      )
      expect(new Set(insertedFlagNames)).toEqual(new Set(nextFlagsToInsert))
    })
  })
})
