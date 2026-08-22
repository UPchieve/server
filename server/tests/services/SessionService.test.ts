import * as SessionService from '../../services/SessionService'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as SessionRepo from '../../models/Session/queries'
import * as SessionAudioRepo from '../../models/SessionAudio'
import * as StudentRepo from '../../models/Student'
import * as UserRepo from '../../models/User'
import {
  SESSION_REPORT_REASON,
  USER_BAN_TYPES,
  USER_BAN_REASONS,
} from '../../constants'
import { mocked } from 'jest-mock'
import {
  buildSession,
  buildUserContactInfo,
  buildVolunteer,
} from '../mocks/generate'
import { LookupError } from '../../models/Errors'
import { getDbUlid } from '../../models/pgUtils'
import { GetSessionByIdResult } from '../../models/Session'
import {
  DmIneligibilityReason,
  ensureCanJoinSession,
  isEligibleForSessionRecap,
  isRecapDmsAvailable,
} from '../../services/SessionService'
import { CurrentSession } from '../../types/session'
import { RoleContext } from '../../services/UserRolesService'
import * as cache from '../../cache'
import QueueService from '../../services/QueueService'
import { Jobs } from '../../worker/jobs'

jest.mock('../../models/Session/queries')
jest.mock('../../models/User/queries')
jest.mock('../../models/UserAction/queries')
jest.mock('../../models/SessionAudio')
jest.mock('../../models/Student/queries')
jest.mock('../../services/FeatureFlagService')
jest.mock('../../services/UserService')
jest.mock('../../services/SessionFlagsService')
jest.mock('../../services/QueueService')
jest.mock('../../cache')

describe('SessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  const mockSessionRepo = mocked(SessionRepo)
  const mockedSessionAudioRepo = mocked(SessionAudioRepo)
  const mockFeatureFlagService = mocked(FeatureFlagService)
  const mockStudentRepo = mocked(StudentRepo)
  const mockedUserRepo = mocked(UserRepo)
  const mockedCache = mocked(cache)
  const mockedQueueService = mocked(QueueService)

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
        ).rejects.toThrow('Cannot join a session with a complete-banned user')
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
        ).rejects.toThrow('Cannot join a session with a complete-banned user')
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
        ).rejects.toThrow('Shadow-banned volunteers may not join sessions')
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
        ).rejects.toThrow("Cannot join shadow-banned student's session")
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
      mockFeatureFlagService.getAllowDmsToPartnerStudentsFeatureFlag.mockResolvedValue(
        true
      )
      mockStudentRepo.getStudentPartnerInfoById.mockResolvedValue({
        id: session.studentId,
      })
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

    it('Is not available to partner students unless the FF is on', async () => {
      mockStudentRepo.getStudentPartnerInfoById.mockResolvedValue({
        id: session.studentId,
        studentPartnerOrg: 'some-partner-school',
        approvedHighschool: 'HS',
      })
      mockFeatureFlagService.getAllowDmsToPartnerStudentsFeatureFlag.mockResolvedValue(
        false
      )
      expect(await getActual()).toEqual({
        eligible: false,
        ineligibleReason: DmIneligibilityReason.PartnerStudentFeatureFlag,
      })
      mockFeatureFlagService.getAllowDmsToPartnerStudentsFeatureFlag.mockResolvedValue(
        true
      )
      expect(await getActual()).toEqual({ eligible: true })
    })

    it('Is only true for students if the volunteer has already sent some DMs', async () => {
      const actualForVolunteer = await isRecapDmsAvailable(
        session.id,
        session.volunteerId!
      )
      expect(actualForVolunteer).toEqual({ eligible: true })
      const actualForStudent = await isRecapDmsAvailable(
        session.id,
        session.studentId
      )
      expect(actualForStudent).toEqual({
        eligible: false,
        ineligibleReason: DmIneligibilityReason.VolunteerHasNotInitiatedDmsYet,
      })
      mockSessionRepo.volunteerSentMessageAfterSessionEnded.mockResolvedValue(
        true
      )
      const actualForStudentWhenThereAreDms = await isRecapDmsAvailable(
        session.id,
        session.studentId
      )
      expect(actualForStudentWhenThereAreDms).toEqual({ eligible: true })
    })

    it('Is also true for students if the student-initiate-dms feature flag is on', async () => {
      mockFeatureFlagService.getStudentsInitiateDmsFeatureFlag.mockResolvedValue(
        true
      )
      const actualForStudent = await isRecapDmsAvailable(
        session.id,
        session.studentId
      )
      expect(actualForStudent).toEqual({
        eligible: true,
      })
    })
  })

  describe('isEligibleForSessionRecap', () => {
    const sessionId = getDbUlid()
    const studentId = getDbUlid()
    const volunteerId = getDbUlid()

    it('If the FF is off, the user is only eligible if they are not a partner student', async () => {
      mockFeatureFlagService.getAllowDmsToPartnerStudentsFeatureFlag.mockResolvedValue(
        false
      )
      mockSessionRepo.isEligibleForSessionRecap.mockResolvedValue(true)

      mockStudentRepo.getStudentPartnerInfoById.mockResolvedValue({
        id: studentId,
      })
      expect(
        await isEligibleForSessionRecap(sessionId, studentId, volunteerId)
      ).toEqual(true)

      mockStudentRepo.getStudentPartnerInfoById.mockResolvedValue({
        id: studentId,
        studentPartnerOrg: 'some-partner',
      })
      expect(
        await isEligibleForSessionRecap(sessionId, studentId, volunteerId)
      ).toEqual(false)
    })

    it('If the FF is on, the user is eligible even if they are a partner student', async () => {
      mockFeatureFlagService.getAllowDmsToPartnerStudentsFeatureFlag.mockResolvedValue(
        true
      )
      mockSessionRepo.isEligibleForSessionRecap.mockResolvedValue(true)

      mockStudentRepo.getStudentPartnerInfoById.mockResolvedValue({
        id: studentId,
      })
      expect(
        await isEligibleForSessionRecap(sessionId, studentId, volunteerId)
      ).toEqual(true)

      mockStudentRepo.getStudentPartnerInfoById.mockResolvedValue({
        id: studentId,
        studentPartnerOrg: 'some-partner',
      })
      expect(
        await isEligibleForSessionRecap(sessionId, studentId, volunteerId)
      ).toEqual(true)
    })

    it('If the FF is on, the user is still ineligible if their session does not meet the criteria', async () => {
      mockFeatureFlagService.getAllowDmsToPartnerStudentsFeatureFlag.mockResolvedValue(
        true
      )
      mockSessionRepo.isEligibleForSessionRecap.mockResolvedValue(false)

      expect(
        await isEligibleForSessionRecap(sessionId, studentId, volunteerId)
      ).toEqual(false)
    })
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
        Jobs.EmailSessionReported,
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
      expect(data.userId).toEqual(jobData.userId)
      expect(data.sessionId).toEqual(sessionId)
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
})
