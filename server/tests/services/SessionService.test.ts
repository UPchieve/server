import * as SessionService from '../../services/SessionService'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as SessionRepo from '../../models/Session/queries'
import * as SessionAudioRepo from '../../models/SessionAudio'
import * as SubjectsRepo from '../../models/Subjects'
import * as TeacherRepo from '../../models/Teacher'
import * as UserRepo from '../../models/User'
import {
  SESSION_REPORT_REASON,
  USER_BAN_TYPES,
  USER_BAN_REASONS,
  UserSessionFlags,
} from '../../constants'
import { mocked } from 'jest-mock'
import {
  buildCurrentSession,
  buildRecapSession,
  buildSession,
  buildStudent,
  buildUserContactInfo,
  buildVolunteer,
} from '../mocks/generate'
import {
  LookupError,
  NotAllowedError,
  UnauthorizedFeature,
} from '../../models/Errors'
import { getDbUlid } from '../../models/pgUtils'
import { GetSessionByIdResult, SessionActivity } from '../../models/Session'
import {
  DmIneligibilityReason,
  ensureCanJoinSession,
} from '../../services/SessionService'
import { CurrentSession } from '../../types/session'
import { InputError } from '../../models/Errors'
import { ReportSessionError } from '../../utils/session-utils'
import { RoleContext } from '../../services/UserRolesService'
import * as cache from '../../cache'
import QueueService from '../../services/QueueService'
import * as PhotoDnaService from '../../services/PhotoDnaService'
import * as NotifyVolunteerService from '../../services/NotifyVolunteerService'
import SocketService from '../../services/SocketService'
import * as SessionFlagsService from '../../services/SessionFlagsService'
import { minutesInMs } from '../../utils/time-utils'

jest.mock('../../models/Session/queries')
jest.mock('../../models/User/queries')
jest.mock('../../models/UserAction/queries')
jest.mock('../../models/SessionAudio')
jest.mock('../../models/Subjects')
jest.mock('../../models/Teacher')
jest.mock('../../services/UserService')
jest.mock('../../services/SessionFlagsService')
jest.mock('../../services/QueueService')
jest.mock('../../services/PhotoDnaService')
jest.mock('../../services/NotifyVolunteerService')
jest.mock('../../services/SocketService')
jest.mock('../../cache')

describe('SessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  const mockSessionRepo = mocked(SessionRepo)
  const mockedSessionAudioRepo = mocked(SessionAudioRepo)
  const mockFeatureFlagService = mocked(FeatureFlagService)
  const mockedTeacherRepo = mocked(TeacherRepo)
  const mockedUserRepo = mocked(UserRepo)
  const mockedCache = mocked(cache)
  const mockedQueueService = mocked(QueueService)
  const mockedPhotoDnaService = mocked(PhotoDnaService)
  const mockedNotifyVolunteerService = mocked(NotifyVolunteerService)
  const mockedSubjectsRepo = mocked(SubjectsRepo)
  const mockedAnalyticsService = mocked(AnalyticsService)
  const mockedSessionFlagsService = mocked(SessionFlagsService)

  describe('reportSession', () => {
    test('should ban the user with ban_type of COMPLETE when reported for STUDENT_RUDE', async () => {
      const reportReason = SESSION_REPORT_REASON.STUDENT_RUDE
      const reportMessage = 'User was rude'
      const source = 'recap'
      const user = buildVolunteer()
      const session = buildSession({
        studentId: 'studentId',
        volunteerId: user.id,
      })

      mockSessionRepo.getSessionById.mockImplementation(async () => session)
      const sessionId = session.id
      mockSessionRepo.updateSessionReported.mockResolvedValue()

      const data = {
        sessionId,
        reportReason,
        reportMessage,
        source,
      }

      await SessionService.reportSession(user, data)

      //Verify that the user was banned with the COMPLETE type
      expect(UserRepo.banUserById).toHaveBeenCalledWith(
        'studentId',
        USER_BAN_TYPES.COMPLETE,
        USER_BAN_REASONS.SESSION_REPORTED
      )
    })

    test.each([
      { source: 'recap' }, // DMs
      { source: 'session' },
    ])(
      'should not ban the user if the ban reason is STUDENT_SAFETY',
      async (args) => {
        const reportReason = SESSION_REPORT_REASON.STUDENT_SAFETY
        const reportMessage = 'Abc123'
        const source = args.source
        const user = buildVolunteer()
        const session = buildSession({
          studentId: 'studentId',
          volunteerId: user.id,
        })

        mockSessionRepo.getSessionById.mockImplementation(async () => session)
        const sessionId = session.id
        mockSessionRepo.updateSessionReported.mockResolvedValue()

        await SessionService.reportSession(user, {
          sessionId,
          reportReason,
          reportMessage,
          source,
        })

        // Student was NOT banned
        expect(UserRepo.banUserById).not.toHaveBeenCalled()
        expect(mockSessionRepo.updateSessionReported).toHaveBeenCalledTimes(1)
      }
    )

    test.each([
      {
        filer: 'coach',
        reporterIsCoach: true,
        reason: SESSION_REPORT_REASON.STUDENT_RUDE,
        dmFlag: UserSessionFlags.coachReportedStudentDm,
      },
      {
        filer: 'student',
        reporterIsCoach: false,
        reason:
          SESSION_REPORT_REASON.COACH_DM_TO_STUDENT_INAPPROPRIATE_LANGUAGE,
        dmFlag: UserSessionFlags.studentReportedCoachDm,
      },
    ])(
      'stores, flags and alerts with the $filer as reporter and the other participant as reported',
      async ({ reporterIsCoach, reason, dmFlag }) => {
        const coach = buildVolunteer()
        const student = buildStudent()
        const session = buildSession({
          studentId: student.id,
          volunteerId: coach.id,
        })
        const reportedUserId = reporterIsCoach ? student.id : coach.id
        mockSessionRepo.getSessionById.mockResolvedValue(session)
        mockSessionRepo.updateSessionReported.mockResolvedValue()

        await SessionService.reportSession(reporterIsCoach ? coach : student, {
          sessionId: session.id,
          reportReason: reason,
          reportMessage: 'message',
          source: 'recap',
        })

        expect(mockSessionRepo.updateSessionReported).toHaveBeenCalledWith(
          session.id,
          reason,
          'message',
          reporterIsCoach ? coach.id : student.id,
          reportedUserId
        )
        expect(mockSessionRepo.updateSessionFlagsById).toHaveBeenCalledWith(
          session.id,
          [dmFlag],
          expect.anything()
        )
        const [cacheKey, emailData] = mockedCache.save.mock.calls[0]
        expect(cacheKey).toBe(`${session.id}-reported`)
        expect(JSON.parse(emailData as string).userId).toBe(reportedUserId)
      }
    )

    test('rejects an unknown reportReason before writing a report or banning', async () => {
      const user = buildVolunteer()

      await expect(
        SessionService.reportSession(user, {
          sessionId: 'sessionId',
          reportReason: 'reason',
          reportMessage: 'message',
          source: 'recap',
        })
      ).rejects.toThrow(InputError)

      expect(mockSessionRepo.updateSessionReported).not.toHaveBeenCalled()
      expect(UserRepo.banUserById).not.toHaveBeenCalled()
    })

    test('rejects a report from someone outside the session', async () => {
      const session = buildSession({
        studentId: buildStudent().id,
        volunteerId: buildVolunteer().id,
      })
      mockSessionRepo.getSessionById.mockResolvedValue(session)

      await expect(
        SessionService.reportSession(buildVolunteer(), {
          sessionId: session.id,
          reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
          reportMessage: 'message',
          source: 'recap',
        })
      ).rejects.toThrow(ReportSessionError)

      expect(mockSessionRepo.updateSessionReported).not.toHaveBeenCalled()
      expect(UserRepo.banUserById).not.toHaveBeenCalled()
    })
  })

  describe('Session audio', () => {
    describe('updateSessionAudio', () => {
      it('Throws a LookupError if the session audio does not exist', async () => {
        mockedSessionAudioRepo.updateSessionAudio.mockResolvedValue(undefined)
        await expect(() =>
          SessionService.updateSessionAudio('123', {})
        ).rejects.toThrow(LookupError)
      })

      it('Returns the updated SessionAudio', async () => {
        const sessionId = '123'
        const volunteerJoinedAt = new Date()
        const sessionAudio = {
          id: '123',
          sessionId,
          studentJoinedAt: new Date(),
          volunteerJoinedAt,
          resourceUri: 'resource-uri',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockedSessionAudioRepo.updateSessionAudio.mockResolvedValue(
          sessionAudio
        )
        const result = await SessionService.updateSessionAudio(sessionId, {
          volunteerJoinedAt,
        })
        expect(result).toEqual(sessionAudio)
      })
    })
  })

  describe('ensureCanJoinSession', () => {
    describe('Complete bans', () => {
      it('Throws an error if a volunteer is joining while the student is complete-banned', async () => {
        const student = buildUserContactInfo()
        const session = buildSession({
          volunteerId: undefined,
          studentId: student.id,
        })
        mockSessionRepo.getCurrentSessionBySessionId.mockResolvedValue(
          session as CurrentSession
        )
        const joiningUser = buildUserContactInfo({
          banType: null,
          roleContext: new RoleContext(['volunteer', 'admin'], 'volunteer'),
        })
        mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
          { id: joiningUser.id, banType: null },
          { id: student.id, banType: 'complete' },
        ])

        await expect(() =>
          ensureCanJoinSession(joiningUser, session.id)
        ).rejects.toThrow(
          'Attempting to join session with complete-banned user'
        )
      })

      it('Throws an error if the volunteer joining the session is complete-banned', async () => {
        const student = buildUserContactInfo()
        const session = buildSession({
          volunteerId: undefined,
          studentId: student.id,
        })
        mockSessionRepo.getCurrentSessionBySessionId.mockResolvedValue(
          session as CurrentSession
        )
        const joiningUser = buildUserContactInfo({
          banType: 'complete',
          roleContext: new RoleContext(['volunteer'], 'volunteer'),
        })
        mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
          { id: joiningUser.id, banType: 'complete' },
          { id: student.id, banType: null },
        ])

        await expect(() =>
          ensureCanJoinSession(joiningUser, session.id)
        ).rejects.toThrow(
          'Attempting to join session with complete-banned user'
        )
      })
    })

    describe('Shadow bans', () => {
      it('Throws an error if the volunteer is shadow-banned', async () => {
        const student = buildUserContactInfo()
        const session = buildSession({
          volunteerId: undefined,
          studentId: student.id,
        })
        mockSessionRepo.getCurrentSessionBySessionId.mockResolvedValue(
          session as CurrentSession
        )
        const joiningUser = buildUserContactInfo({
          banType: 'shadow',
          roleContext: new RoleContext(['volunteer'], 'volunteer'),
        })
        mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
          { id: joiningUser.id, banType: 'shadow' },
          { id: student.id, banType: null },
        ])

        await expect(() =>
          ensureCanJoinSession(joiningUser, session.id)
        ).rejects.toThrow('Shadow-banned volunteer attempting to join session')
      })

      it('Throws an error if the student is shadow-banned and the volunteer is NOT an admin', async () => {
        const student = buildUserContactInfo()
        const session = buildSession({
          volunteerId: undefined,
          studentId: student.id,
        })
        mockSessionRepo.getCurrentSessionBySessionId.mockResolvedValue(
          session as CurrentSession
        )
        const joiningUser = buildUserContactInfo({
          banType: null,
          roleContext: new RoleContext(['volunteer'], 'volunteer'),
        })
        mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
          { id: joiningUser.id, banType: null },
          { id: student.id, banType: 'shadow' },
        ])

        await expect(() =>
          ensureCanJoinSession(joiningUser, session.id)
        ).rejects.toThrow(
          'Volunteer attempting to join session of shadow-banned student'
        )
      })

      it('Allows an admin volunteer to join even if the student is shadow-banned', async () => {
        const student = buildUserContactInfo()
        const session = buildSession({
          volunteerId: undefined,
          studentId: student.id,
        })
        mockSessionRepo.getCurrentSessionBySessionId.mockResolvedValue(
          session as CurrentSession
        )
        const joiningUser = buildUserContactInfo({
          approved: true,
          banType: null,
          roleContext: new RoleContext(['volunteer', 'admin'], 'volunteer'),
        })
        mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
          { id: joiningUser.id, banType: null },
          { id: student.id, banType: 'shadow' },
        ])

        const actual = await ensureCanJoinSession(joiningUser, session.id)
        expect(actual).toEqual(session)
      })
    })

    describe('Ended sessions', () => {
      const studentId = getDbUlid()
      const volunteerId = getDbUlid()

      it.each([
        ['student', studentId, 'student', 'SESSION_ENDED'],
        ['volunteer', volunteerId, 'volunteer', 'SESSION_ENDED'],
        ['another student', getDbUlid(), 'student', undefined],
        ['another volunteer', getDbUlid(), 'volunteer', undefined],
      ] as const)(
        'Refuses the %s with code %s',
        async (_, joiningUserId, role, code) => {
          const session = buildSession({
            studentId,
            volunteerId,
            endedAt: new Date(),
          })
          mockSessionRepo.getCurrentSessionBySessionId.mockResolvedValue(
            session as CurrentSession
          )
          mockedUserRepo.getUsersBanStatuses.mockResolvedValue([])
          const joiningUser = buildUserContactInfo({
            id: joiningUserId,
            roleContext: new RoleContext([role], role),
          })

          const error = await ensureCanJoinSession(
            joiningUser,
            session.id
          ).catch((e) => e)
          expect(error.message).toBe('Attempting to join ended session')
          expect(error.code).toBe(code)
        }
      )
    })
  })

  describe('isRecapDmsAvailable', () => {
    let session: GetSessionByIdResult

    beforeEach(() => {
      session = buildSession({
        studentId: getDbUlid(),
        volunteerId: getDbUlid(),
      })
      mockSessionRepo.getSessionById.mockResolvedValue(session)
      mockSessionRepo.sessionHasBannedParticipant.mockResolvedValue(false)
    })

    const getActual = async () =>
      await SessionService.isRecapDmsAvailable(session.id, session.volunteerId!)

    it('Is available while neither user is complete-banned', async () => {
      mockSessionRepo.sessionHasBannedParticipant.mockResolvedValue(false)
      expect(await getActual()).toEqual({ eligible: true })
      // Now if one of them is banned, DMs shouldn't be available
      mockSessionRepo.sessionHasBannedParticipant.mockResolvedValue(true)
      expect(await getActual()).toEqual({
        eligible: false,
        ineligibleReason: DmIneligibilityReason.SessionHasBannedParticipant,
      })
    })

    it.each([
      ['the volunteer', { eligible: true }, () => session.volunteerId!],
      ['the student', { eligible: true }, () => session.studentId],
      [
        'an outsider',
        {
          eligible: false,
          ineligibleReason: DmIneligibilityReason.NotSessionParticipant,
        },
        () => getDbUlid(),
      ],
    ])('For %s, answers %j', async (_who, expected, getUserId) => {
      expect(
        await SessionService.isRecapDmsAvailable(session.id, getUserId())
      ).toEqual(expected)
    })
  })

  describe('isEligibleForSessionRecap', () => {
    const tutoredMs = minutesInMs(2)
    let session: GetSessionByIdResult

    beforeEach(() => {
      const volunteerJoinedAt = new Date(Date.now() - minutesInMs(5))
      session = buildSession({
        studentId: getDbUlid(),
        volunteerId: getDbUlid(),
        volunteerJoinedAt,
        endedAt: new Date(volunteerJoinedAt.getTime() + minutesInMs(3)),
      })
      mockSessionRepo.getSessionById.mockResolvedValue(session)
      mockSessionRepo.sessionHasBannedParticipant.mockResolvedValue(false)
      mockSessionRepo.getSessionActivity.mockResolvedValue([
        {
          user: session.studentId,
          createdAt: new Date(volunteerJoinedAt.getTime() + tutoredMs),
        } as SessionActivity,
      ])
      mockedSessionFlagsService.computeSessionFlags.mockResolvedValue([])
      mockSessionRepo.isInSessionHistory.mockResolvedValue(true)
    })

    it('Is not eligible when a participant is banned', async () => {
      mockSessionRepo.sessionHasBannedParticipant.mockResolvedValue(true)

      expect(await SessionService.isEligibleForSessionRecap(session.id)).toBe(
        false
      )
      expect(mockSessionRepo.isInSessionHistory).not.toHaveBeenCalled()
    })

    it.each([true, false])(
      'Checks Session History with the stored time tutored, answering %s',
      async (inSessionHistory) => {
        session.timeTutored = tutoredMs
        mockSessionRepo.isInSessionHistory.mockResolvedValue(inSessionHistory)

        expect(await SessionService.isEligibleForSessionRecap(session.id)).toBe(
          inSessionHistory
        )
        expect(mockSessionRepo.isInSessionHistory).toHaveBeenCalledWith(
          session.id,
          session.studentId,
          undefined
        )
        expect(
          mockedSessionFlagsService.computeSessionFlags
        ).not.toHaveBeenCalled()
        expect(mockSessionRepo.getSessionActivity).not.toHaveBeenCalled()
      }
    )

    it.each([
      ['no absence', [], [], tutoredMs],
      ['a computed absence', [], [UserSessionFlags.absentStudent], 0],
      ['a stored absence', [UserSessionFlags.absentVolunteer], [], 0],
    ])(
      'Before time tutored is stored, checks Session History with the time the job will store given %s',
      async (_, storedFlags, computedFlags, expected) => {
        session.flags = storedFlags
        mockedSessionFlagsService.computeSessionFlags.mockResolvedValue(
          computedFlags
        )

        await SessionService.isEligibleForSessionRecap(session.id)
        expect(mockSessionRepo.isInSessionHistory).toHaveBeenCalledWith(
          session.id,
          session.studentId,
          expected
        )

        session.flags = [...storedFlags, ...computedFlags]
        await SessionService.processCalculateMetrics(session.id)
        expect(mockSessionRepo.updateSessionTimeTutored).toHaveBeenCalledWith(
          session.id,
          expected
        )
      }
    )
  })

  describe('processSessionReported', () => {
    function buildCachedReport(sessionId: string) {
      return {
        userId: getDbUlid(),
        reportedBy: 'volunteer1@upchieve.org',
        reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
        reportMessage: 'Student made a your mom joke',
        isBanReason: true,
        sessionId,
      }
    }

    test('should queue job to send emails for reported session from cache', async () => {
      const sessionId = getDbUlid()
      const jobData = buildCachedReport(sessionId)
      mockedCache.get.mockResolvedValueOnce(JSON.stringify(jobData))

      await SessionService.processSessionReported(sessionId)

      expect(mockedQueueService.add).toHaveBeenLastCalledWith(
        'EmailSessionReported',
        { delay: 0 },
        jobData
      )
      expect(mockedCache.remove).toHaveBeenCalledWith(`${sessionId}-reported`)
    })

    test('should queue the job with userId and sessionId in the job data', async () => {
      const sessionId = getDbUlid()
      const jobData = buildCachedReport(sessionId)
      mockedCache.get.mockResolvedValueOnce(JSON.stringify(jobData))

      await SessionService.processSessionReported(sessionId)

      const [, , data] = mockedQueueService.add.mock.calls[0]
      expect(data).toMatchObject({ userId: jobData.userId, sessionId })
    })

    test('should not queue a job when the session was never reported', async () => {
      const sessionId = getDbUlid()
      mockedCache.get.mockRejectedValueOnce(
        new cache.KeyNotFoundError(`${sessionId}-reported`)
      )

      await expect(
        SessionService.processSessionReported(sessionId)
      ).resolves.toBeUndefined()

      expect(mockedQueueService.add).not.toHaveBeenCalled()
      expect(mockedCache.remove).not.toHaveBeenCalled()
    })

    test('should throw error if error is not an instance of cache.KeyNotFound', async () => {
      const sessionId = getDbUlid()
      mockedCache.get.mockRejectedValueOnce(new Error('test error'))

      await expect(
        SessionService.processSessionReported(sessionId)
      ).rejects.toThrow('test error')
    })
  })

  describe('saveSessionImage', () => {
    test('does not save a session image rejected by PhotoDNA', async () => {
      const sessionId = getDbUlid()
      const userId = getDbUlid()
      const image = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/png',
      } as Express.Multer.File
      mockedPhotoDnaService.checkAgainstPhotoDNA.mockRejectedValueOnce(
        new Error('PhotoDNA match')
      )

      await expect(
        SessionService.saveSessionImage({
          sessionId,
          userId,
          isVolunteer: false,
          image,
        })
      ).rejects.toThrow('PhotoDNA match')
      expect(mockedPhotoDnaService.checkAgainstPhotoDNA).toHaveBeenCalledWith(
        image,
        userId,
        sessionId
      )
      expect(mockSessionRepo.updateSessionPhotoKey).not.toHaveBeenCalled()
    })

    test('should reject the upload when the blockSessionImageUpload flag is enabled', async () => {
      const sessionId = getDbUlid()
      const userId = getDbUlid()
      mockFeatureFlagService.blockSessionImageUpload.mockResolvedValue(true)

      await expect(
        SessionService.saveSessionImage({
          sessionId,
          image: {
            originalname: 'test.png',
            buffer: Buffer.from('fake-image-data'),
          } as unknown as Express.Multer.File,
          userId,
          isVolunteer: false,
        })
      ).rejects.toThrow(UnauthorizedFeature)

      expect(
        mockFeatureFlagService.blockSessionImageUpload
      ).toHaveBeenCalledWith(userId)
      expect(mockSessionRepo.getSessionById).not.toHaveBeenCalled()
      expect(mockSessionRepo.updateSessionPhotoKey).not.toHaveBeenCalled()
    })
  })

  describe('startSession', () => {
    test('begins regular notifications for a new session with no requested coach', async () => {
      const student = buildUserContactInfo()
      const newSession = buildCurrentSession({ studentId: student.id })
      mockedSubjectsRepo.getSubjectAndTopic.mockResolvedValue({
        subjectName: 'algebraOne',
        subjectId: 1,
        subjectDisplayName: 'Algebra 1',
        topicName: 'math',
        topicId: 1,
        topicDisplayName: 'Math',
        toolType: 'whiteboard',
      })
      mockSessionRepo.createSession.mockResolvedValue(newSession)

      await SessionService.startSession(student, {
        subject: 'algebraOne',
        topic: 'math',
        sessionSubTopic: 'linearEquations',
        sessionType: 'math',
        userAgent: 'jest',
      })

      expect(
        mockedNotifyVolunteerService.beginRegularNotifications
      ).toHaveBeenCalledWith(newSession)
    })
  })

  describe('handleSessionBreakout', () => {
    test('begins regular notifications when the exclusive request was cleared', async () => {
      const student = buildUserContactInfo()
      const session = buildSession({ studentId: student.id })
      const currentSession = buildCurrentSession({ studentId: student.id })
      mockSessionRepo.getSessionById.mockResolvedValue(session)
      mockedNotifyVolunteerService.clearExclusiveRequest.mockResolvedValue(true)
      mockSessionRepo.getCurrentSessionBySessionId.mockResolvedValue(
        currentSession
      )
      jest.mocked(SocketService.getInstance).mockReturnValue({
        emitSessionChange: jest.fn(),
      } as unknown as SocketService)

      await SessionService.handleSessionBreakout(session.id, student)

      expect(
        mockedNotifyVolunteerService.beginRegularNotifications
      ).toHaveBeenCalledWith(currentSession)
    })
  })

  describe('session recap access', () => {
    const studentId = getDbUlid()
    const volunteerId = getDbUlid()
    const otherId = getDbUlid()

    const cases = [
      {
        who: 'a participant',
        userId: studentId,
        isTeacher: false,
        classStudents: [],
        allowed: true,
      },
      {
        who: 'the volunteer participant',
        userId: volunteerId,
        isTeacher: false,
        classStudents: [],
        allowed: true,
      },
      {
        who: 'a non-participant',
        userId: otherId,
        isTeacher: false,
        classStudents: [],
        allowed: false,
      },
      {
        who: 'a teacher of the student',
        userId: otherId,
        isTeacher: true,
        classStudents: [studentId],
        allowed: true,
      },
      {
        who: 'a teacher of another student',
        userId: otherId,
        isTeacher: true,
        classStudents: [getDbUlid()],
        allowed: false,
      },
    ]

    test.each(cases)(
      'getSessionRecap for $who, allowed is $allowed',
      async ({ userId, isTeacher, classStudents, allowed }) => {
        mockedTeacherRepo.getAllStudentsForTeacher.mockResolvedValue(
          classStudents
        )
        mockSessionRepo.getSessionRecap.mockResolvedValue(
          buildRecapSession({ studentId, volunteerId })
        )
        const result = SessionService.getSessionRecap(
          getDbUlid(),
          userId,
          isTeacher
        )
        if (allowed) await expect(result).resolves.toBeDefined()
        else await expect(result).rejects.toThrow(NotAllowedError)
      }
    )

    test.each([
      {
        who: 'a participant',
        userId: studentId,
        isTeacher: false,
        allowed: true,
      },
      {
        who: 'a non-participant',
        userId: otherId,
        isTeacher: false,
        allowed: false,
      },
      {
        who: 'a teacher of the student',
        userId: otherId,
        isTeacher: true,
        allowed: true,
      },
    ])(
      'getRecapSessionForDms for $who, allowed is $allowed',
      async ({ userId, isTeacher, allowed }) => {
        mockedTeacherRepo.getAllStudentsForTeacher.mockResolvedValue([
          studentId,
        ])
        mockSessionRepo.getCurrentSessionBySessionId.mockResolvedValue(
          buildCurrentSession({ studentId, volunteerId })
        )
        const result = SessionService.getRecapSessionForDms(
          getDbUlid(),
          userId,
          isTeacher
        )
        if (allowed) await expect(result).resolves.toBeDefined()
        else await expect(result).rejects.toThrow(NotAllowedError)
      }
    )
  })

  describe('processSessionEndedAnalytics', () => {
    test('sends SESSION_CLOSED for both the student and the volunteer', async () => {
      const studentId = getDbUlid()
      const volunteerId = getDbUlid()
      const session = buildSession({
        studentId,
        volunteerId,
        timeTutored: 1200000,
      })
      mockSessionRepo.getSessionById.mockResolvedValue(session)

      await SessionService.processSessionEndedAnalytics(session.id)

      const expectedProperties = {
        sessionId: session.id,
        studentId,
        volunteerId,
        subject: session.subject,
        topic: session.topic,
        timeTutoredMs: 1200000,
      }
      expect(mockedAnalyticsService.captureEvent).toHaveBeenCalledTimes(2)
      expect(mockedAnalyticsService.captureEvent).toHaveBeenCalledWith(
        studentId,
        'SESSION_CLOSED',
        {
          ...expectedProperties,
          role: 'student',
        }
      )
      expect(mockedAnalyticsService.captureEvent).toHaveBeenCalledWith(
        volunteerId,
        'SESSION_CLOSED',
        { ...expectedProperties, role: 'volunteer' }
      )
    })

    test('sends only the student event for an unmatched session', async () => {
      const studentId = getDbUlid()
      const session = buildSession({ studentId })
      mockSessionRepo.getSessionById.mockResolvedValue(session)

      await SessionService.processSessionEndedAnalytics(session.id)

      expect(mockedAnalyticsService.captureEvent).toHaveBeenCalledTimes(1)
      expect(mockedAnalyticsService.captureEvent).toHaveBeenCalledWith(
        studentId,
        'SESSION_CLOSED',
        expect.objectContaining({
          volunteerId: null,
          timeTutoredMs: 0,
          role: 'student',
        })
      )
    })
  })
})
