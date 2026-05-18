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
  getFilteredSessionHistoryTotalCount,
  getLatestSession,
  getMessagesForFrontend,
  getSessionTranscriptItems,
  getVolunteersInSessions,
  isEligibleForSessionRecap,
  isSessionFulfilled,
  updateSessionFlagsById,
  updateSessionReviewReasonsById,
  updateSessionToEnd,
} from '../../models/Session'
import { camelCaseKeys, insertSingleRow } from '../db-utils'
import { range } from 'lodash'
import moment from 'moment'
import { USER_SESSION_METRICS, UserSessionFlags } from '../../constants'
import { createTestUser, createTestVolunteer } from './seed-utils'

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
        for (const _ in range(0, 5)) {
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

  const getFlagId = (flag: UserSessionFlags | USER_SESSION_METRICS) => {
    switch (flag) {
      case UserSessionFlags.safetyConcern:
        return 30
      case UserSessionFlags.generalModerationIssue:
        return 29
      case UserSessionFlags.coachReportedStudentDm:
        return 17
      default:
        throw new Error(
          'getFlagId has no entry for this session flag - add one!'
        )
    }
  }

  describe('updateSessionFlagsById', () => {
    const getFlagsForSession = async (sessionId: string) => {
      return dbClient.query(
        'SELECT * FROM sessions_session_flags WHERE session_id = $1',
        [sessionId]
      )
    }

    it('Inserts the flags for session', async () => {
      const sessionObj = await buildSessionRow({ studentId }, dbClient)
      const session = await insertSingleRow('sessions', sessionObj, dbClient)
      const initialFlags = await getFlagsForSession(session.id)
      expect(initialFlags.rows.length).toEqual(0)
      const flags = [
        UserSessionFlags.generalModerationIssue,
        UserSessionFlags.safetyConcern,
      ]
      await updateSessionFlagsById(session.id, flags, dbClient)
      const updatedFlags = await getFlagsForSession(session.id)
      expect(updatedFlags.rows.length).toEqual(2)
      expect(updatedFlags.rows[0].session_flag_id).toEqual(getFlagId(flags[0]))
      expect(updatedFlags.rows[1].session_flag_id).toEqual(getFlagId(flags[1]))
    })

    it('Does not insert a flag if it already exists for the session', async () => {
      const sessionObj = await buildSessionRow({ studentId }, dbClient)
      const session = await insertSingleRow('sessions', sessionObj, dbClient)
      const flags = [
        UserSessionFlags.generalModerationIssue,
        UserSessionFlags.safetyConcern,
      ]
      await updateSessionFlagsById(session.id, flags, dbClient)
      const initialFlags = await getFlagsForSession(session.id)
      expect(initialFlags.rows.length).toEqual(2)
      expect(initialFlags.rows[0].session_flag_id).toEqual(getFlagId(flags[0]))
      expect(initialFlags.rows[1].session_flag_id).toEqual(getFlagId(flags[1]))

      // Now insert 2 more flags, 1 of them being a repeat
      const nextFlags = [
        UserSessionFlags.coachReportedStudentDm,
        UserSessionFlags.generalModerationIssue,
      ]
      await updateSessionFlagsById(session.id, nextFlags, dbClient)
      const updatedFlags = await getFlagsForSession(session.id)
      expect(updatedFlags.rows.length).toEqual(3)
      // existing flags
      expect(updatedFlags.rows[0].session_flag_id).toEqual(getFlagId(flags[0]))
      expect(updatedFlags.rows[1].session_flag_id).toEqual(getFlagId(flags[1]))
      // new flag
      expect(updatedFlags.rows[2].session_flag_id).toEqual(
        getFlagId(nextFlags[0])
      )
    })
  })

  describe('updateSessionReviewReasonsById', () => {
    const getReviewReasonsForSession = async (sessionId: string) => {
      return dbClient.query(
        'SELECT * FROM session_review_reasons WHERE session_id = $1',
        [sessionId]
      )
    }

    it('Inserts review reasons based on the flags', async () => {
      const sessionObj = await buildSessionRow({ studentId }, dbClient)
      const session = await insertSingleRow('sessions', sessionObj, dbClient)
      const reviewReasons = [
        UserSessionFlags.generalModerationIssue,
        UserSessionFlags.safetyConcern,
      ]
      await updateSessionReviewReasonsById(
        session.id,
        reviewReasons,
        false,
        dbClient
      )
      const actualReviewReasons = await getReviewReasonsForSession(session.id)
      expect(actualReviewReasons.rows.length).toEqual(2)
      expect(actualReviewReasons.rows[0].session_flag_id).toEqual(
        getFlagId(reviewReasons[0])
      )
      expect(actualReviewReasons.rows[1].session_flag_id).toEqual(
        getFlagId(reviewReasons[1])
      )
    })

    it('Does not insert duplicate review reason', async () => {
      const sessionObj = await buildSessionRow({ studentId }, dbClient)
      const session = await insertSingleRow('sessions', sessionObj, dbClient)
      const reviewReasons = [
        UserSessionFlags.generalModerationIssue,
        UserSessionFlags.safetyConcern,
      ]
      await updateSessionReviewReasonsById(
        session.id,
        reviewReasons,
        false,
        dbClient
      )
      const actualReviewReasons = await getReviewReasonsForSession(session.id)
      expect(actualReviewReasons.rows.length).toEqual(2)
      expect(actualReviewReasons.rows[0].session_flag_id).toEqual(
        getFlagId(reviewReasons[0])
      )
      expect(actualReviewReasons.rows[1].session_flag_id).toEqual(
        getFlagId(reviewReasons[1])
      )

      // Now insert 2 more review reasons, 1 of them being a duplicate
      const nextReviewReasons = [
        UserSessionFlags.generalModerationIssue,
        UserSessionFlags.coachReportedStudentDm,
      ]
      await updateSessionReviewReasonsById(
        session.id,
        nextReviewReasons,
        false,
        dbClient
      )
      const secondActualReviewReasons = await getReviewReasonsForSession(
        session.id
      )
      expect(secondActualReviewReasons.rows.length).toEqual(3)
      expect(secondActualReviewReasons.rows[0].session_flag_id).toEqual(
        getFlagId(reviewReasons[0])
      )
      expect(secondActualReviewReasons.rows[1].session_flag_id).toEqual(
        getFlagId(reviewReasons[1])
      )
      expect(secondActualReviewReasons.rows[2].session_flag_id).toEqual(
        getFlagId(nextReviewReasons[1])
      )
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

  describe('updateSessionReviewReasonsById', () => {
    let session: any

    beforeEach(async () => {
      const sessionObj = await buildSessionRow({ studentId }, dbClient)
      session = await insertSingleRow('sessions', sessionObj, dbClient)
    })

    it('Inserts a single review reason', async () => {
      const reviewReason = UserSessionFlags.absentVolunteer
      const reviewReasonId = 2
      await updateSessionReviewReasonsById(session.id, [reviewReason])
      const actualReviewReasons = await dbClient.query(
        'SELECT * FROM session_review_reasons WHERE session_id = $1',
        [session.id]
      )
      expect(actualReviewReasons.rows.length).toEqual(1)
      expect(actualReviewReasons.rows[0].session_flag_id).toEqual(
        reviewReasonId
      )
    })

    it('Inserts multiple review reasons', async () => {
      const reviewReasons = [
        UserSessionFlags.absentVolunteer,
        UserSessionFlags.pii,
      ]
      const reviewReasonIds = [2, 28]
      await updateSessionReviewReasonsById(session.id, reviewReasons)
      const actualReviewReasons = await dbClient.query(
        'SELECT * FROM session_review_reasons WHERE session_id = $1',
        [session.id]
      )
      expect(actualReviewReasons.rows.length).toEqual(2)
      const flagIds = actualReviewReasons.rows.map((row) => row.session_flag_id)
      expect(new Set(flagIds)).toEqual(new Set(reviewReasonIds))
    })

    it('If the review reason already exists, does not insert a new one', async () => {
      const initialFlag = UserSessionFlags.hateSpeech
      const initialFlagId = 25
      const nextFlagsToInsert = [
        UserSessionFlags.pii,
        UserSessionFlags.absentStudent,
      ]
      const nextFlagsToInsertIds = [1, 28]

      // Insert one flag
      await updateSessionReviewReasonsById(session.id, [initialFlag])
      const initialResult = await dbClient.query(
        'SELECT * FROM session_review_reasons WHERE session_id = $1',
        [session.id]
      )
      expect(initialResult.rows.length).toEqual(1)
      expect(initialResult.rows[0].session_flag_id).toEqual(initialFlagId)

      // Insert multiple flags including the existing
      await updateSessionReviewReasonsById(session.id, [
        ...nextFlagsToInsert,
        initialFlag,
      ])
      const nextResult = await dbClient.query(
        'SELECT * FROM session_review_reasons WHERE session_id = $1',
        [session.id]
      )
      expect(nextResult.rows.length).toEqual(3)
      const finalFlagIds = nextResult.rows.map((row) => row.session_flag_id)
      expect(new Set(finalFlagIds)).toEqual(
        new Set([initialFlagId, ...nextFlagsToInsertIds])
      )
    })
  })

  describe('updateSessionToEnd', () => {
    const getSessionRow = async (sessionId: string) => {
      const rows = (
        await dbClient.query('SELECT * FROM sessions WHERE id = $1', [
          sessionId,
        ])
      ).rows
      return camelCaseKeys(rows[0])
    }

    it('Sets endedBy to null when none is provided', async () => {
      const session = await insertSingleRow(
        'sessions',
        await buildSessionRow({
          studentId,
          volunteerId,
        }),
        dbClient
      )
      const initialRow = await getSessionRow(session.id)
      expect(initialRow.endedByUserId).toBeNull()

      const endedAt = new Date()
      await updateSessionToEnd(session.id, endedAt, null, dbClient)
      const updatedRow = await getSessionRow(session.id)
      expect(updatedRow.id).toEqual(session.id)
      expect(updatedRow.endedByUserId).toBeNull()
      expect(updatedRow.endedAt).toEqual(endedAt)
    })

    it('Sets endedBy to the provided value', async () => {
      const session = await insertSingleRow(
        'sessions',
        await buildSessionRow({
          studentId,
          volunteerId,
        }),
        dbClient
      )
      const initialRow = await getSessionRow(session.id)
      expect(initialRow.endedByUserId).toBeNull()

      const endedAt = new Date()
      await updateSessionToEnd(session.id, endedAt, volunteerId, dbClient)
      const updatedRow = await getSessionRow(session.id)
      expect(updatedRow.id).toEqual(session.id)
      expect(updatedRow.endedByUserId).toEqual(volunteerId)
      expect(updatedRow.endedAt).toEqual(endedAt)
    })
  })

  describe('getLatestSession', () => {
    it('Returns the correct session, or none if there is none', async () => {
      const session = await insertSingleRow(
        'sessions',
        await buildSessionRow({
          volunteerId,
          studentId,
          endedAt: new Date(),
          endedByUserId: volunteerId,
        }),
        dbClient
      )
      const asStudent = await getLatestSession(volunteerId, 'student')
      expect(asStudent).toBeUndefined()
      const asVolunteer = await getLatestSession(volunteerId, 'volunteer')
      expect(asVolunteer?.id).toEqual(session.id)
      expect(asVolunteer?.endedByUserId).toEqual(volunteerId)
    })
  })

  describe('isEligibleForSessionRecap', () => {
    it('Returns isEligible = true when the session meets all the criteria', async () => {
      const baseSession = await buildSessionRow(
        {
          studentId,
        },
        dbClient
      )

      const baseSessionFromDb = await insertSingleRow(
        'sessions',
        baseSession,
        dbClient
      )
      const sessionId = baseSessionFromDb.id

      const getResult = async () => {
        return isEligibleForSessionRecap(sessionId)
      }

      // Unmatched, ongoing session is not eligible
      expect(await getResult()).toEqual(false)

      // Matched, ongoing session is not eligible
      await dbClient.query(
        'UPDATE sessions SET volunteer_id = $1 WHERE id = $2',
        [volunteerId, sessionId]
      )
      expect(await getResult()).toEqual(false)

      // Matched, complete session is not eligible
      await dbClient.query(
        'UPDATE sessions SET ended_at = NOW() where id = $1',
        [sessionId]
      )
      expect(await getResult()).toEqual(false)

      // Session with at least 1 message from each user is eligible
      await insertSingleRow(
        'session_messages',
        buildSessionMessageRow(studentId, sessionId),
        dbClient
      )
      expect(await getResult()).toEqual(false)
      await insertSingleRow(
        'session_messages',
        buildSessionMessageRow(volunteerId, sessionId),
        dbClient
      )
      expect(await getResult()).toEqual(true)
    })
  })

  describe('isSessionFulfilled', () => {
    test('returns false if the session has not ended and has no volunteer', async () => {
      const session = await buildSessionRow({
        studentId,
        endedAt: undefined,
        volunteerJoinedAt: undefined,
      })
      await insertSingleRow('sessions', session, getClient())

      const result = await isSessionFulfilled(session.id)
      expect(result).toBe(false)
    })

    test('returns true if the session has ended', async () => {
      const session = await buildSessionRow({
        studentId,
        endedAt: new Date(),
        volunteerJoinedAt: undefined,
      })
      await insertSingleRow('sessions', session, getClient())

      const result = await isSessionFulfilled(session.id)
      expect(result).toBe(true)
    })

    test('returns true if a volunteer has joined', async () => {
      const session = await buildSessionRow({
        studentId,
        endedAt: undefined,
        volunteerJoinedAt: new Date(),
      })
      await insertSingleRow('sessions', session, getClient())

      const result = await isSessionFulfilled(session.id)
      expect(result).toBe(true)
    })

    test('returns true if session has ended and a volunteer has joined', async () => {
      const session = await buildSessionRow({
        studentId,
        endedAt: new Date(),
        volunteerJoinedAt: new Date(),
      })
      await insertSingleRow('sessions', session, getClient())

      const result = await isSessionFulfilled(session.id)
      expect(result).toBe(true)
    })
  })

  describe('getVolunteersInSessions', () => {
    test('returns the ids of volunteers in an active session', async () => {
      const id1 = (await createTestUser(getClient())).id
      await createTestVolunteer(getClient(), id1)
      const id2 = (await createTestUser(getClient())).id
      await createTestVolunteer(getClient(), id2)
      const id3 = (await createTestUser(getClient())).id
      await createTestVolunteer(getClient(), id3)
      const id4 = (await createTestUser(getClient())).id
      await createTestVolunteer(getClient(), id4)

      const activeSession1 = await buildSessionRow({
        studentId,
        volunteerId: id1,
        volunteerJoinedAt: new Date(),
      })
      await insertSingleRow('sessions', activeSession1, getClient())
      const endedSession = await buildSessionRow({
        studentId,
        endedAt: new Date(),
        volunteerId: id2,
        volunteerJoinedAt: new Date(),
      })
      await insertSingleRow('sessions', endedSession, getClient())
      const activeSession2 = await buildSessionRow({
        studentId,
        volunteerId: id3,
        volunteerJoinedAt: new Date(),
      })
      await insertSingleRow('sessions', activeSession2, getClient())

      const result = await getVolunteersInSessions()

      expect(result).toContain(id1)
      expect(result).toContain(id3)
      expect(result).not.toContain(id2)
      expect(result).not.toContain(id4)
    })
  })
})
