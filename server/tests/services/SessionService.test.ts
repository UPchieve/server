test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import Delta from 'quill-delta'
import * as SessionService from '../../services/SessionService'
import { Session } from '../../models/Session'
import { Student } from '../../models/Student'
import { Volunteer } from '../../models/Volunteer'
import {
  buildStudent,
  buildVolunteer,
  getObjectId,
  getStringObjectId,
  generateSentence,
  buildFeedback,
  buildUserAgent,
  getIpAddress,
  getUserAgent,
  buildSession,
  buildSocket,
  buildPushToken,
  getUUID,
  buildUSM,
} from '../generate'
import {
  mockedGetSessionsToReview,
  mockedGetSessionById,
  mockedGetSessionToEnd,
  mockedGetAdminFilteredSessions,
  mockedGetSessionByIdWithStudentAndVolunteer,
  mockedGetCurrentSession,
  mockedCreateSession,
  mockedGetStudentLatestSession,
  mockedGetPublicSession,
} from '../mocks/repos/session-repo'
import {
  EVENTS,
  FEEDBACK_VERSIONS,
  USER_SESSION_METRICS,
  SESSION_REPORT_REASON,
  SUBJECTS,
  SUBJECT_TYPES,
} from '../../constants'
import * as WhiteboardService from '../../services/WhiteboardService'
import QueueService from '../../services/QueueService'
import { Jobs } from '../../worker/jobs'
import * as SessionRepo from '../../models/Session/queries'
import { AssistmentsData } from '../../models/AssistmentsData'
import * as AssistmentsDataRepo from '../../models/AssistmentsData/queries'
import {
  EndSessionError,
  ReportSessionError,
  StartSessionError,
} from '../../utils/session-utils'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as UserActionCtrl from '../../controllers/UserActionCtrl'
import * as UserActionRepo from '../../models/UserAction/queries'
import * as QuillDocService from '../../services/QuillDocService'
import * as VolunteerRepo from '../../models/Volunteer/queries'
import * as AwsService from '../../services/AwsService'
import * as FeedbackRepo from '../../models/Feedback/queries'
import * as PushTokenRepo from '../../models/PushToken/queries'
import * as PushTokenService from '../../services/PushTokenService'
import * as SessionUtils from '../../utils/session-utils'
import * as TwilioService from '../../services/TwilioService'
import { FeedbackVersionTwo } from '../../models/Feedback'
import * as cache from '../../cache'
import { NotAllowedError, LookupError } from '../../models/Errors'
import { SESSION_EVENTS } from '../../constants/events'
import { emitter } from '../../services/EventsService'
import * as USMRepo from '../../models/UserSessionMetrics/queries'
import * as UserRepo from '../../models/User/queries'
import { LockError } from 'redlock'
import logger from '../../logger'
jest.mock('../../models/Session/queries')
jest.mock('../../models/AssistmentsData/queries')
jest.mock('../../services/MailService')
jest.mock('../../services/FeedbackService')
jest.mock('../../models/Feedback/queries')
jest.mock('../../services/TwilioService')
jest.mock('../../services/AnalyticsService')
jest.mock('../../controllers/UserActionCtrl')
jest.mock('../../models/UserAction/queries')
jest.mock('../../services/UserService')
jest.mock('../../services/WhiteboardService')
jest.mock('../../services/QuillDocService')
jest.mock('../../services/VolunteerService')
jest.mock('../../models/Volunteer/queries')
jest.mock('../../services/QueueService')
jest.mock('../../services/SocketService')
jest.mock('../../services/AwsService')
jest.mock('../../models/PushToken/queries')
jest.mock('../../services/PushTokenService')
jest.mock('../../services/EventsService')
jest.mock('../../cache')
jest.mock('../../models/UserSessionMetrics/queries')
jest.mock('../../models/User/queries')

const mockedSessionRepo = mocked(SessionRepo, true)
const mockedAssistmentsDataRepo = mocked(AssistmentsDataRepo, true)
const mockedFeedbackRepo = mocked(FeedbackRepo, true)
const mockedAwsService = mocked(AwsService, true)
const mockedPushTokenRepo = mocked(PushTokenRepo, true)
const mockedCache = mocked(cache, true)
const mockedQuillDocService = mocked(QuillDocService, true)
const mockedWhiteboardService = mocked(WhiteboardService, true)
const mockedUSMRepo = mocked(USMRepo, true)
const mockedVolunteerRepo = mocked(VolunteerRepo, true)
const mockedUserActionRepo = mocked(UserActionRepo, true)
const mockedUserRepo = mocked(UserRepo, true)
const mockedTwilioService = mocked(TwilioService, true)

beforeEach(async () => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
  jest.resetAllMocks()
})

describe('reviewSession', () => {
  test('Should update the review status for a session', async () => {
    const sessionId = getStringObjectId()
    const input = {
      sessionId,
      reviewed: true,
      toReview: false,
    }
    await SessionService.reviewSession(input)
    expect(SessionRepo.updateSessionReviewedStatusById).toHaveBeenCalledTimes(1)
  })
})

describe('sessionsToReview', () => {
  test('Should get sessions to review', async () => {
    const page = '1'
    const mockedSessions = [
      mockedGetSessionsToReview(),
      mockedGetSessionsToReview(),
    ]
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage, sessions } = await SessionService.sessionsToReview(page)
    expect(isLastPage).toBeTruthy()
    expect(sessions).toEqual(mockedSessions)
    expect(mockedSessionRepo.getSessionsToReview).toHaveBeenCalledWith({
      limit: 15,
      query: { toReview: true, reviewed: false },
      skip: 0,
    })
  })

  test('Should not be the last page if the total number of sessions is greater than the limit', async () => {
    const page = '1'
    const mockedSessions: any[] = []
    for (let i = 0; i < 20; i++) {
      mockedSessions.push(mockedGetSessionsToReview())
    }
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage } = await SessionService.sessionsToReview(page)
    expect(isLastPage).toBeFalsy()
  })
})

describe('reportSession', () => {
  test('Should throw ReportSessionError if no volunteer on session', async () => {
    const user = buildVolunteer()
    const input = {
      sessionId: getStringObjectId(),
      reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
      reportMessage: generateSentence(),
    }
    const mockValue = mockedGetSessionById()
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    try {
      await SessionService.reportSession(user, input)
    } catch (error) {
      expect(error).toBeInstanceOf(ReportSessionError)
    }
  })

  test('Should throw ReportSessionError if the user reporting does not match the volunteer on the session', async () => {
    const user = buildVolunteer()
    const input = {
      sessionId: getStringObjectId(),
      reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
      reportMessage: generateSentence(),
    }
    const mockValue = mockedGetSessionById({ volunteer: getObjectId() })
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    try {
      await SessionService.reportSession(user, input)
    } catch (error) {
      expect(error).toBeInstanceOf(ReportSessionError)
    }
  })

  test('Should report ongoing session and cache email job', async () => {
    const user = buildVolunteer()
    const input = {
      sessionId: getStringObjectId(),
      reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
      reportMessage: generateSentence(),
    }
    const mockValue = mockedGetSessionById({
      volunteer: user._id,
      student: getStringObjectId(),
    })
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    mockedUSMRepo.getUSMByUserId.mockResolvedValueOnce(
      buildUSM((mockValue.student as Student)._id)
    )
    mockedUSMRepo.getUSMByUserId.mockResolvedValueOnce(
      buildUSM((mockValue.volunteer! as Volunteer)._id)
    )
    await SessionService.reportSession(user, input)
    expect(SessionRepo.updateSessionReported).toHaveBeenCalledTimes(1)
    expect(UserRepo.banUserById).toHaveBeenCalledTimes(1)
    expect(UserActionCtrl.AccountActionCreator).toHaveBeenCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledTimes(1)
    expect(cache.saveWithExpiration).toHaveBeenCalledWith(
      `${input.sessionId}-reported`,
      JSON.stringify({
        studentId: mockValue.student,
        reportedBy: user.email,
        reportReason: input.reportReason,
        reportMessage: input.reportMessage,
        isBanReason: true,
        sessionId: input.sessionId,
      })
    )
  })

  test('Should report ended session and queue email job', async () => {
    const user = buildVolunteer()
    const input = {
      sessionId: getStringObjectId(),
      reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
      reportMessage: generateSentence(),
    }
    const mockValue = mockedGetSessionById({
      volunteer: user._id,
      student: getStringObjectId(),
      endedAt: new Date(),
    })
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    mockedUSMRepo.getUSMByUserId.mockResolvedValueOnce(
      buildUSM((mockValue.student as Student)._id)
    )
    mockedUSMRepo.getUSMByUserId.mockResolvedValueOnce(
      buildUSM((mockValue.volunteer as Volunteer)._id)
    )
    await SessionService.reportSession(user, input)
    expect(SessionRepo.updateSessionReported).toHaveBeenCalledTimes(1)
    expect(UserRepo.banUserById).toHaveBeenCalledTimes(1)
    expect(UserActionCtrl.AccountActionCreator).toHaveBeenCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledTimes(1)

    expect(QueueService.add).toHaveBeenCalledWith(Jobs.EmailSessionReported, {
      studentId: mockValue.student,
      reportedBy: user.email,
      reportReason: input.reportReason,
      reportMessage: input.reportMessage,
      isBanReason: true,
      sessionId: input.sessionId,
    })
  })
})

describe('endSession', () => {
  test('Should throw session has already ended', async () => {
    const mockedSession = mockedGetSessionToEnd({ endedAt: new Date() })
    mockedSessionRepo.getSessionToEndById.mockImplementationOnce(
      async () => mockedSession
    )
    try {
      await SessionService.endSession(mockedSession._id, null, false)
      fail('should throw error')
    } catch (error) {
      expect(error).toBeInstanceOf(EndSessionError)
      expect((error as EndSessionError).message).toBe(
        'Session has already ended'
      )
    }
  })

  test('Should throw only session participants can end a session', async () => {
    const mockedSession = mockedGetSessionToEnd()
    mockedSessionRepo.getSessionToEndById.mockImplementationOnce(
      async () => mockedSession
    )
    const spy = jest.spyOn(SessionUtils, 'isSessionParticipant')
    spy.mockImplementationOnce(() => false)
    try {
      await SessionService.endSession(
        mockedSession._id,
        buildStudent()._id,
        false
      )
      fail('should throw error')
    } catch (error) {
      expect(error).toBeInstanceOf(EndSessionError)
      expect((error as EndSessionError).message).toBe(
        'Only session participants can end a session'
      )
    }
  })
})

describe('addPastSession', () => {
  test('Should add past session to student', async () => {
    const mockValue = mockedGetSessionById({ student: getObjectId() })
    const sessionId = mockValue._id
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )

    await SessionService.addPastSession(sessionId)
    expect(mockedUserRepo.addUserPastSessionById).toHaveBeenCalledTimes(1)
  })

  test('Should add past session to both student and volunteer', async () => {
    const mockValue = mockedGetSessionById({
      student: getObjectId(),
      volunteer: getObjectId(),
    })
    const sessionId = mockValue._id
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(mockValue)

    await SessionService.addPastSession(sessionId)
    expect(mockedUserRepo.addUserPastSessionById).toHaveBeenCalledTimes(2)
  })
})

describe('processAssistmentsSession', () => {
  test('Should queue job to send assistments data for assistments session if session was matched', async () => {
    const mockValue = mockedGetSessionById({
      student: getObjectId(),
      volunteer: getObjectId(),
    })
    const sessionId = mockValue._id
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    const mockedAd = {
      studentId: 'student',
      assignmentId: 'assignment',
      problemId: 12345,
    } as AssistmentsData
    mockedAssistmentsDataRepo.getAssistmentsDataBySession.mockResolvedValueOnce(
      mockedAd
    )

    await SessionService.processAssistmentsSession(sessionId)

    expect(QueueService.add).toHaveBeenCalledWith(Jobs.SendAssistmentsData, {
      sessionId,
    })
  })

  test('Should do nothing for an unmatched session', async () => {
    const mockValue = mockedGetSessionById({
      student: getObjectId(),
      volunteer: null,
    })
    const sessionId = mockValue._id
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    const mockedAd = {
      studentId: 'student',
      assignmentId: 'assignment',
      problemId: 12345,
    } as AssistmentsData
    mockedAssistmentsDataRepo.getAssistmentsDataBySession.mockResolvedValueOnce(
      mockedAd
    )

    await SessionService.processAssistmentsSession(sessionId)

    expect(QueueService.add).toHaveBeenCalledTimes(0)
  })

  test('Should do nothing when no session is found', async () => {
    const mockValue = mockedGetSessionById({
      student: getObjectId(),
      volunteer: null,
    })
    const sessionId = mockValue._id
    mockedSessionRepo.getSessionById.mockImplementationOnce(async () =>
      buildSession()
    )
    const mockedAd = {
      studentId: 'student',
      assignmentId: 'assignment',
      problemId: 12345,
    } as AssistmentsData
    mockedAssistmentsDataRepo.getAssistmentsDataBySession.mockResolvedValueOnce(
      mockedAd
    )

    await SessionService.processAssistmentsSession(sessionId)

    expect(QueueService.add).toHaveBeenCalledTimes(0)
  })
})

describe('processSessionReported', () => {
  test('Should queue job to send emails for reported session from cache', async () => {
    const sessionId = getObjectId()
    const jobData = {
      studentId: getStringObjectId(),
      reportedBy: 'volunteer1@upchieve.org',
      reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
      reportMessage: 'Student made a your mom joke',
      isBanReason: true,
      sessionId: sessionId.toString(),
    }
    mockedCache.get.mockImplementationOnce(async () => {
      return JSON.stringify(jobData)
    })

    await SessionService.processSessionReported(sessionId)

    expect(QueueService.add).toHaveBeenLastCalledWith(
      Jobs.EmailSessionReported,
      jobData
    )
    expect(cache.remove).toHaveBeenCalledWith(`${sessionId}-reported`)
  })

  test('Should throw error if error is not an instance of cache.KeyNotFound', async () => {
    const sessionId = getObjectId()

    mockedCache.get.mockImplementationOnce(async () => {
      throw new Error('test error')
    })

    await expect(
      SessionService.processSessionReported(sessionId)
    ).rejects.toThrow()
  })
})

describe('processCalculateMetrics', () => {
  let spyCalculateTimeTutored: jest.SpyInstance<number, any>
  beforeEach(async () => {
    spyCalculateTimeTutored = jest.spyOn(SessionUtils, 'calculateTimeTutored')
  })

  test('Should calculate time tutored if there was no absent user in the session', async () => {
    const timeTutored = 1000 * 60 * 20
    const mockValue = mockedGetSessionById({
      flags: [USER_SESSION_METRICS.commentFromVolunteer],
    })
    const sessionId = mockValue._id
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    spyCalculateTimeTutored.mockImplementationOnce(() => timeTutored)

    await SessionService.processCalculateMetrics(sessionId)
    expect(SessionRepo.updateSessionTimeTutored).toHaveBeenCalledWith(
      sessionId,
      timeTutored
    )
    expect(emitter.emit).toHaveBeenCalledWith(
      SESSION_EVENTS.SESSION_METRICS_CALCULATED,
      sessionId
    )
  })

  test('Should not calculate time tutored if there was an absent user in the session', async () => {
    const timeTutored = 0
    const mockValue = mockedGetSessionById({
      flags: [USER_SESSION_METRICS.absentStudent],
    })
    const sessionId = mockValue._id
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    spyCalculateTimeTutored.mockImplementationOnce(() => timeTutored)

    await SessionService.processCalculateMetrics(sessionId)
    expect(spyCalculateTimeTutored).not.toHaveBeenCalled()
    expect(SessionRepo.updateSessionTimeTutored).toHaveBeenCalledWith(
      sessionId,
      timeTutored
    )
    expect(emitter.emit).toHaveBeenCalledWith(
      SESSION_EVENTS.SESSION_METRICS_CALCULATED,
      sessionId
    )
  })
})

describe('processFirstSessionCongratsEmail', () => {
  test('Should add send first session congrats email to student', async () => {
    const timeTutored = 1000 * 60 * 20
    const mockedSession = mockedGetSessionByIdWithStudentAndVolunteer({
      timeTutored,
      student: {
        pastSessions: [getObjectId()],
      },
      volunteer: null,
    })
    const sessionId = mockedSession._id
    mockedSessionRepo.getSessionByIdWithStudentAndVolunteer.mockImplementationOnce(
      // @todo: fix
      // @ts-expect-error
      async () => mockedSession
    )
    await SessionService.processFirstSessionCongratsEmail(sessionId)
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.EmailStudentFirstSessionCongrats,
      {
        sessionId: mockedSession._id,
      },
      expect.anything()
    )
    expect(QueueService.add).not.toHaveBeenCalledWith(
      Jobs.EmailVolunteerFirstSessionCongrats,
      {
        sessionId: mockedSession._id,
      },
      expect.anything()
    )
  })

  test('Should add send first session congrats email to student and volunteer', async () => {
    const timeTutored = 1000 * 60 * 20
    const mockedSession = mockedGetSessionByIdWithStudentAndVolunteer({
      timeTutored,
      student: {
        pastSessions: [getObjectId()],
      },
      volunteer: {
        pastSessions: [getObjectId()],
      },
    })
    const sessionId = mockedSession._id
    mockedSessionRepo.getSessionByIdWithStudentAndVolunteer.mockImplementationOnce(
      // @todo: fix
      // @ts-expect-error
      async () => mockedSession
    )
    await SessionService.processFirstSessionCongratsEmail(sessionId)
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.EmailStudentFirstSessionCongrats,
      {
        sessionId: mockedSession._id,
      },
      expect.anything()
    )
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.EmailVolunteerFirstSessionCongrats,
      {
        sessionId: mockedSession._id,
      },
      expect.anything()
    )
  })
})

describe('storeAndDeleteQuillDoc', () => {
  test('Should store and delete the quill doc', async () => {
    const sessionId = getObjectId()
    const delta = { ops: [] }
    const quillState = {
      doc: new Delta(delta),
      lastDeltaStored: undefined,
    }
    mockedQuillDocService.lockAndGetDocCacheState.mockImplementationOnce(
      async () => quillState
    )
    await SessionService.storeAndDeleteQuillDoc(sessionId)
    expect(QuillDocService.lockAndGetDocCacheState).toHaveBeenCalledTimes(1)
    expect(SessionRepo.updateSessionQuillDoc).toHaveBeenCalledWith(
      sessionId,
      JSON.stringify(quillState.doc)
    )
    expect(QuillDocService.deleteDoc).toHaveBeenCalledTimes(1)
  })

  test('Should retry getting and updating the document on lock error', async () => {
    const sessionId = getObjectId()
    const errorMessage = 'locked'
    const expectedError = `LockError: ${errorMessage}`
    mockedQuillDocService.lockAndGetDocCacheState.mockRejectedValue(
      new LockError(errorMessage)
    )
    await SessionService.storeAndDeleteQuillDoc(sessionId)
    expect(QuillDocService.lockAndGetDocCacheState).toHaveBeenCalledTimes(11)
    expect(logger.error).toHaveBeenCalledWith(
      `Failed to update and get document in the cache for session ${sessionId} - ${expectedError}`
    )
    expect(SessionRepo.updateSessionQuillDoc).toHaveBeenCalledTimes(0)
    expect(QuillDocService.deleteDoc).toHaveBeenCalledTimes(0)
  })
})

describe('storeAndDeleteWhiteboardDoc', () => {
  test('Should store and delete the whiteboard doc', async () => {
    const sessionId = getObjectId()
    const whiteboardDoc = 'longwhiteboarddoc'
    const hasWhiteboardDoc = true
    mockedWhiteboardService.getDoc.mockImplementationOnce(
      async () => whiteboardDoc
    )
    mockedWhiteboardService.uploadedToStorage.mockImplementationOnce(
      async () => hasWhiteboardDoc
    )
    await SessionService.storeAndDeleteWhiteboardDoc(sessionId)
    expect(WhiteboardService.getDoc).toHaveBeenCalledTimes(1)
    expect(WhiteboardService.uploadedToStorage).toHaveBeenCalledWith(
      sessionId,
      whiteboardDoc
    )
    expect(SessionRepo.updateSessionHasWhiteboardDoc).toHaveBeenCalledWith(
      sessionId,
      hasWhiteboardDoc
    )
    expect(WhiteboardService.deleteDoc).toHaveBeenCalledTimes(1)
  })
})

describe('processSessionEditors', () => {
  test('Should store and delete the quill doc if session that uses the quill doc', async () => {
    // @todo: storeAndDeleteQuillDoc should be mocked
    const mockedSession = mockedGetSessionToEnd({
      subTopic: SUBJECTS.ESSAYS,
    })
    const sessionId = mockedSession._id
    const delta = { ops: [] }
    const quillState = {
      doc: new Delta(delta),
      lastDeltaStored: undefined,
    }
    mockedSessionRepo.getSessionToEndById.mockImplementationOnce(
      async () => mockedSession
    )
    mockedQuillDocService.lockAndGetDocCacheState.mockImplementationOnce(
      async () => quillState
    )
    await SessionService.storeAndDeleteQuillDoc(sessionId)
    expect(QuillDocService.lockAndGetDocCacheState).toHaveBeenCalledTimes(1)
    expect(SessionRepo.updateSessionQuillDoc).toHaveBeenCalledWith(
      sessionId,
      JSON.stringify(quillState.doc)
    )
    expect(QuillDocService.deleteDoc).toHaveBeenCalledTimes(1)
    expect(WhiteboardService.getDoc).toHaveBeenCalledTimes(0)
  })

  test('Should store and delete the whiteboard doc if session that uses the whiteboard doc', async () => {
    // @todo: storeAndDeleteWhiteboardDoc should be mocked
    const mockedSession = mockedGetSessionToEnd({
      subTopic: SUBJECTS.ALGEBRA_ONE,
    })
    const sessionId = mockedSession._id
    mockedSessionRepo.getSessionToEndById.mockImplementationOnce(
      async () => mockedSession
    )
    const whiteboardDoc = 'longwhiteboarddoc'
    const hasWhiteboardDoc = true
    mockedWhiteboardService.getDoc.mockImplementationOnce(
      async () => whiteboardDoc
    )
    mockedWhiteboardService.uploadedToStorage.mockImplementationOnce(
      async () => hasWhiteboardDoc
    )
    await SessionService.storeAndDeleteWhiteboardDoc(sessionId)
    expect(WhiteboardService.getDoc).toHaveBeenCalledTimes(1)
    expect(WhiteboardService.uploadedToStorage).toHaveBeenCalledWith(
      sessionId,
      whiteboardDoc
    )
    expect(SessionRepo.updateSessionHasWhiteboardDoc).toHaveBeenCalledWith(
      sessionId,
      hasWhiteboardDoc
    )
    expect(WhiteboardService.deleteDoc).toHaveBeenCalledTimes(1)
    expect(QuillDocService.getDoc).toHaveBeenCalledTimes(0)
  })
})

describe('processEmailPartnerVolunteer', () => {
  test('Should do nothing if a volunteer did not join the session', async () => {
    const mockedSession = mockedGetSessionToEnd({
      volunteer: null,
    })
    const sessionId = mockedSession._id
    mockedSessionRepo.getSessionToEndById.mockImplementationOnce(
      async () => mockedSession
    )
    await SessionService.processEmailPartnerVolunteer(sessionId)
    expect(QueueService.add).toHaveBeenCalledTimes(0)
  })

  test('Should do nothing if the volunteer does not have a partner org', async () => {
    const mockedSession = mockedGetSessionToEnd()
    const sessionId = mockedSession._id
    mockedSessionRepo.getSessionToEndById.mockImplementationOnce(
      async () => mockedSession
    )
    await SessionService.processEmailPartnerVolunteer(sessionId)
    expect(QueueService.add).toHaveBeenCalledTimes(0)
  })

  test('Should queue email if partner volunteer has completed 10 sessions', async () => {
    const pastSessions = []
    for (let i = 0; i < 10; i++) {
      pastSessions.push(getObjectId())
    }
    const volunteer = buildVolunteer({
      volunteerPartnerOrg: 'example',
      pastSessions,
    })
    const mockedSession = mockedGetSessionToEnd({
      volunteer: {
        _id: volunteer._id,
        firstname: volunteer.firstname,
        email: volunteer.email,
        pastSessions: volunteer.pastSessions,
        volunteerPartnerOrg: volunteer.volunteerPartnerOrg,
      },
    })
    const sessionId = mockedSession._id
    mockedSessionRepo.getSessionToEndById.mockImplementationOnce(
      async () => mockedSession
    )
    await SessionService.processEmailPartnerVolunteer(sessionId)
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.EmailPartnerVolunteerTenSessionMilestone,
      {
        volunteerId: volunteer._id,
        firstName: volunteer.firstname,
        email: volunteer.email,
      },
      expect.anything()
    )
  })
})

describe('processVolunteerTimeTutored', () => {
  test('Should do nothing if the session does not have a volunteer', async () => {
    const mockValue = mockedGetSessionById({ volunteer: null })
    const sessionId = mockValue._id
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    await SessionService.processVolunteerTimeTutored(sessionId)
    expect(VolunteerRepo.updateTimeTutored).toHaveBeenCalledTimes(0)
  })

  test('Should update timeTutored for the volunteer', async () => {
    const timeTutored = 1000 * 60
    const volunteer = getObjectId()
    const mockValue = mockedGetSessionById({ volunteer, timeTutored })
    const sessionId = mockValue._id
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    await SessionService.processVolunteerTimeTutored(sessionId)
    expect(VolunteerRepo.updateTimeTutored).toHaveBeenCalledWith(
      volunteer,
      timeTutored
    )
  })
})

describe('getStaleSessions', () => {
  test('Should get all long running sessions', async () => {
    await SessionService.getStaleSessions()
    expect(SessionRepo.getLongRunningSessions).toHaveBeenCalledTimes(1)
  })
})

describe('getSessionPhotoUploadUrl', () => {
  test('Should get all long running sessions', async () => {
    const sessionId = getObjectId()
    await SessionService.getSessionPhotoUploadUrl(sessionId)
    expect(SessionRepo.updateSessionPhotoKey).toHaveBeenCalledTimes(1)
  })
})

describe('getImageAndUploadUrl', () => {
  test('Should get an imageUrl and uploadUrl', async () => {
    const sessionId = getStringObjectId()
    const mockUploadUrl = 'https://upload.com/example'
    mockedAwsService.getSessionPhotoUploadUrl.mockImplementationOnce(
      async () => mockUploadUrl
    )
    const { uploadUrl, imageUrl } = await SessionService.getImageAndUploadUrl(
      sessionId
    )
    const expectedImageUrl = new RegExp(
      'https://session-photo-bucket.s3.amazonaws.com'
    )
    expect(uploadUrl).toBe(mockUploadUrl)
    // @todo: spyOn SessionService's getSessionPhotoUploadUrl to return value we want instead of a regex match
    expect(imageUrl).toMatch(expectedImageUrl)
  })
})

describe('adminFilteredSessions', () => {
  test('Should get sessions and isLastPage true', async () => {
    const input = {
      showBannedUsers: '1',
      showTestUsers: '',
      minSessionLength: '',
      sessionActivityFrom: '',
      sessionActivityTo: '',
      minMessagesSent: '10',
      studentRating: '2',
      volunteerRating: '2',
      firstTimeStudent: '1',
      firstTimeVolunteer: '',
      isReported: '',
      page: '1',
    }
    const mockValue = [
      mockedGetAdminFilteredSessions(),
      mockedGetAdminFilteredSessions(),
      mockedGetAdminFilteredSessions(),
    ]
    mockedSessionRepo.getAdminFilteredSessions.mockImplementationOnce(
      async () => mockValue
    )
    const { sessions, isLastPage } = await SessionService.adminFilteredSessions(
      input
    )
    expect(isLastPage).toBeTruthy()
    expect(sessions).toEqual(mockValue)
  })

  test('Should get sessions and isLastPage false', async () => {
    const input = {
      showBannedUsers: '1',
      showTestUsers: '',
      minSessionLength: '',
      sessionActivityFrom: '',
      sessionActivityTo: '',
      minMessagesSent: '10',
      studentRating: '2',
      volunteerRating: '2',
      firstTimeStudent: '1',
      firstTimeVolunteer: '',
      isReported: '',
      page: '1',
    }
    const mockValue: any[] = []
    for (let i = 0; i < 20; i++) {
      mockValue.push(mockedGetAdminFilteredSessions())
    }
    mockedSessionRepo.getAdminFilteredSessions.mockImplementationOnce(
      async () => mockValue
    )
    const { sessions, isLastPage } = await SessionService.adminFilteredSessions(
      input
    )
    expect(isLastPage).toBeFalsy()
    expect(sessions).toEqual(mockValue)
  })
})

describe('adminSessionView', () => {
  test('Should get data for admin session view', async () => {
    const sessionId = getStringObjectId()
    const mockSession = mockedGetSessionByIdWithStudentAndVolunteer({
      type: SUBJECT_TYPES.COLLEGE,
      subTopic: SUBJECTS.ESSAYS,
    })
    const mockUserAgent = buildUserAgent()
    const mockFeedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO,
    }) as FeedbackVersionTwo
    const mockSessionPhotos = ['12345', '54321']
    mockedSessionRepo.getSessionByIdWithStudentAndVolunteer.mockImplementationOnce(
      // @todo: fix
      // @ts-expect-error
      async () => mockSession
    )
    mockedUserActionRepo.getSessionRequestedUserAgentFromSessionId.mockImplementationOnce(
      async () => mockUserAgent
    )
    mockedFeedbackRepo.getFeedbackV2BySessionId.mockImplementationOnce(
      async () => mockFeedback
    )
    mockedAwsService.getObjects.mockImplementationOnce(
      async () => mockSessionPhotos
    )
    const result = await SessionService.adminSessionView(sessionId)
    expect(QuillDocService.getDoc).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      ...mockSession,
      userAgent: mockUserAgent,
      feedbacks: mockFeedback,
      photos: mockSessionPhotos,
    })
  })
})

describe('startSession', () => {
  test('Should throw an error that volunteers cannot create sessions', async () => {
    const user = buildVolunteer()
    const input = {
      ip: getIpAddress(),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      userAgent: getUserAgent(),
    }
    try {
      await SessionService.startSession(user, input)
    } catch (error) {
      expect(error).toBeInstanceOf(StartSessionError)
      expect((error as StartSessionError).message).toBe(
        'Volunteers cannot create new sessions'
      )
    }
  })

  test('Should throw an error that banned students cannot request sessions', async () => {
    const user = buildStudent({ isBanned: true })
    const input = {
      ip: getIpAddress(),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      userAgent: getUserAgent(),
    }
    try {
      await SessionService.startSession(user, input)
    } catch (error) {
      expect(error).toBeInstanceOf(StartSessionError)
      expect((error as StartSessionError).message).toBe(
        'Banned students cannot request a new session'
      )
    }
  })

  test('Should throw an error if student is already in a session', async () => {
    const user = buildStudent()
    const input = {
      ip: getIpAddress(),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      userAgent: getUserAgent(),
    }
    const mockValue = mockedGetCurrentSession()
    mockedSessionRepo.getCurrentSessionById.mockImplementationOnce(
      async () => mockValue
    )
    try {
      await SessionService.startSession(user, input)
    } catch (error) {
      expect(error).toBeInstanceOf(StartSessionError)
      expect((error as StartSessionError).message).toBe(
        'Student already has an active session'
      )
    }
  })

  test('Should create a new session', async () => {
    const user = buildStudent()
    const input = {
      ip: getIpAddress(),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      userAgent: getUserAgent(),
    }
    const mockValue = mockedCreateSession()
    mockedSessionRepo.getCurrentSessionById.mockImplementationOnce(
      async () => undefined
    )
    mockedSessionRepo.createSession.mockImplementationOnce(
      async () => mockValue
    )
    await SessionService.startSession(user, input)
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.EndUnmatchedSession,
      {
        sessionId: mockValue._id,
      },
      expect.anything()
    )
    expect(
      AssistmentsDataRepo.createAssistmentsDataBySession
    ).not.toHaveBeenCalled()
    expect(UserActionCtrl.SessionActionCreator).toHaveBeenCalledTimes(1)
    expect(TwilioService.beginRegularNotifications).toHaveBeenCalledWith(
      mockValue
    )
    expect(TwilioService.beginFailsafeNotifications).toHaveBeenCalledWith(
      mockValue
    )
  })

  test('Should create a new session and create an ASSISTments data record', async () => {
    const user = buildStudent()
    const input = {
      ip: getIpAddress(),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      problemId: '12345',
      assignmentId: getUUID(),
      studentId: getUUID(),
      userAgent: getUserAgent(),
    }
    const mockValue = mockedCreateSession()
    mockedSessionRepo.getCurrentSessionById.mockImplementationOnce(
      async () => undefined
    )
    mockedSessionRepo.createSession.mockImplementationOnce(
      async () => mockValue
    )
    await SessionService.startSession(user, input)
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.EndUnmatchedSession,
      {
        sessionId: mockValue._id,
      },
      expect.anything()
    )
    expect(UserActionCtrl.SessionActionCreator).toHaveBeenCalledTimes(1)
    expect(
      AssistmentsDataRepo.createAssistmentsDataBySession
    ).toHaveBeenCalled()
    expect(TwilioService.beginRegularNotifications).toHaveBeenCalledWith(
      mockValue
    )
    expect(TwilioService.beginFailsafeNotifications).toHaveBeenCalledWith(
      mockValue
    )
  })
})

describe('checkSession', () => {
  test('Should get session', async () => {
    const mockValue = mockedGetSessionById()
    const sessionId = mockValue._id.toString()
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    const actual = await SessionService.checkSession(sessionId)
    expect(SessionRepo.getSessionById).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(sessionId.toString())
  })
})

describe('currentSession', () => {
  test('Should get session', async () => {
    const user = buildStudent()
    const mockValue = mockedGetCurrentSession()
    mockedSessionRepo.getCurrentSessionById.mockImplementationOnce(
      async () => mockValue
    )
    const actual = await SessionService.currentSession(user._id)
    expect(SessionRepo.getCurrentSessionById).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(mockValue)
  })
})

describe('studentLatestSession', () => {
  test('Should get latest session', async () => {
    const userId = getStringObjectId()
    const mockValue = mockedGetStudentLatestSession()
    mockedSessionRepo.getLatestSessionByStudentId.mockImplementationOnce(
      async () => mockValue
    )
    const actual = await SessionService.studentLatestSession(userId)
    expect(SessionRepo.getLatestSessionByStudentId).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(mockValue)
  })
})

describe('sessionTimedOut', () => {
  test('Should get latest session', async () => {
    const user = buildVolunteer()
    const input = {
      ip: getIpAddress(),
      sessionId: getStringObjectId(),
      userAgent: getUserAgent(),
      timeout: 15,
    }

    await SessionService.sessionTimedOut(user, input)
    expect(UserActionCtrl.SessionActionCreator).toHaveBeenCalledTimes(1)
  })
})

describe('publicSession', () => {
  test('Should get session', async () => {
    const sessionId = getStringObjectId()
    const mockValue = mockedGetPublicSession()
    mockedSessionRepo.getPublicSessionById.mockImplementationOnce(
      async () => mockValue
    )
    const actual = await SessionService.publicSession(sessionId)
    expect(SessionRepo.getPublicSessionById).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(mockValue)
  })
})

describe('getSessionNotifications', () => {
  test('Should get session', async () => {
    const sessionId = getStringObjectId()
    const mockValue = mockedGetPublicSession()
    mockedSessionRepo.getPublicSessionById.mockImplementationOnce(
      async () => mockValue
    )
    const actual = await SessionService.publicSession(sessionId)
    expect(SessionRepo.getPublicSessionById).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(mockValue)
  })
})

describe('joinSession', () => {
  test('Should throw error that session has ended', async () => {
    const user = buildVolunteer()
    const input = {
      socket: buildSocket(),
      session: buildSession({ student: getObjectId(), endedAt: new Date() }),
      joinedFrom: '',
    }
    try {
      await SessionService.joinSession(user, input)
      fail('should throw error')
    } catch (error) {
      expect(SessionRepo.updateSessionFailedJoinsById).toBeCalledTimes(1)
      expect(SessionRepo.updateSessionFailedJoinsById).toHaveBeenCalledWith(
        input.session._id,
        user._id
      )
      expect((error as Error).message).toBe('Session has ended')
    }
  })

  // eslint-disable-next-line quotes
  test("Should throw error that astudent cannot join another student's session", async () => {
    const user = buildStudent()
    const input = {
      socket: buildSocket(),
      session: buildSession({
        student: getObjectId(),
      }),
      joinedFrom: '',
    }
    try {
      await SessionService.joinSession(user, input)
      fail('should throw error')
    } catch (error) {
      expect(SessionRepo.updateSessionFailedJoinsById).toBeCalledTimes(1)
      expect(SessionRepo.updateSessionFailedJoinsById).toHaveBeenCalledWith(
        input.session._id,
        user._id
      )
      expect((error as Error).message).toBe(
        // eslint-disable-next-line quotes
        "A student cannot join another student's session"
      )
    }
  })

  test('Should throw error that a volunteer has already joined the session', async () => {
    const user = buildVolunteer()
    const input = {
      socket: buildSocket(),
      session: buildSession({
        student: getObjectId(),
        volunteer: getObjectId(),
      }),
      joinedFrom: '',
    }
    try {
      await SessionService.joinSession(user, input)
      fail('should throw error')
    } catch (error) {
      expect(SessionRepo.updateSessionFailedJoinsById).toBeCalledTimes(1)
      expect(SessionRepo.updateSessionFailedJoinsById).toHaveBeenCalledWith(
        input.session._id,
        user._id
      )
      expect((error as Error).message).toBe(
        'A volunteer has already joined the session'
      )
    }
  })

  test('Volunteer should join session on initial join', async () => {
    const user = buildVolunteer()
    const input = {
      socket: buildSocket(),
      session: buildSession({
        student: getObjectId(),
      }),
      joinedFrom: '',
    }

    mockedPushTokenRepo.getPushTokensByUserId.mockImplementationOnce(
      async () => [buildPushToken(), buildPushToken()]
    )

    await SessionService.joinSession(user, input)
    expect(SessionRepo.updateSessionVolunteerById).toBeCalledTimes(1)
    expect(SessionRepo.updateSessionVolunteerById).toHaveBeenCalledWith(
      input.session._id,
      user._id
    )
    expect(UserActionCtrl.SessionActionCreator).toBeCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenNthCalledWith(
      1,
      user._id,
      EVENTS.SESSION_JOINED,
      {
        event: EVENTS.SESSION_JOINED,
        sessionId: input.session._id.toString(),
        joinedFrom: input.joinedFrom,
      }
    )
    expect(AnalyticsService.captureEvent).toHaveBeenNthCalledWith(
      2,
      input.session.student,
      EVENTS.SESSION_MATCHED,
      {
        event: EVENTS.SESSION_MATCHED,
        sessionId: input.session._id.toString(),
      }
    )
    expect(PushTokenRepo.getPushTokensByUserId).toBeCalledTimes(1)
    expect(PushTokenService.sendVolunteerJoined).toBeCalledTimes(1)
  })

  test('Should fire off a session rejoined action/event if user is rejoining the session', async () => {
    const volunteer = buildVolunteer()
    const input = {
      socket: buildSocket(),
      session: buildSession({
        student: getObjectId(),
        volunteer: volunteer._id,
        createdAt: new Date(new Date().getTime() - 1000 * 60 * 10),
      }),
      user: volunteer,
      joinedFrom: '',
    }

    mockedPushTokenRepo.getPushTokensByUserId.mockImplementationOnce(
      async () => [buildPushToken(), buildPushToken()]
    )

    await SessionService.joinSession(volunteer, input)
    expect(SessionRepo.updateSessionVolunteerById).not.toHaveBeenCalled()
    expect(UserActionCtrl.SessionActionCreator).toBeCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      input.user._id,
      EVENTS.SESSION_REJOINED,
      {
        event: EVENTS.SESSION_REJOINED,
        sessionId: input.session._id.toString(),
      }
    )
  })
})

describe('saveMessage', () => {
  test('Should throw error if no session is found', async () => {
    const user = buildStudent({
      _id: getObjectId(),
      createdAt: new Date(),
    })
    const input = {
      sessionId: getObjectId(),
      message: 'test message',
    }
    const errorMessage = 'No session found'
    mockedSessionRepo.getSessionById.mockImplementationOnce(async () => {
      throw new LookupError(errorMessage)
    })
    try {
      await SessionService.saveMessage(user._id, new Date(), input)
    } catch (error) {
      expect(error).toBeInstanceOf(LookupError)
      expect((error as LookupError).message).toBe(errorMessage)
    }
  })

  test('Should add new message to the session', async () => {
    const user = buildStudent()
    const input = {
      sessionId: getObjectId(),
      message: 'test message',
    }
    const mockValue = mockedGetSessionById({ student: user._id })
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )

    await SessionService.saveMessage(user._id, new Date(), input)
    expect(SessionRepo.addMessageToSessionById).toHaveBeenCalledTimes(1)
  })
})

describe('getTimeTutoredForDateRange', () => {
  test('Should return 0 if no timeTutored for the date range', async () => {
    const mockValue: Pick<Session, 'timeTutored'>[] = []
    mockedSessionRepo.getTotalTimeTutoredForDateRange.mockImplementationOnce(
      async () => mockValue
    )
    const fromDate = new Date('12/13/2020')
    const toDate = new Date('12/25/2020')
    const timeTutored = await SessionService.getTimeTutoredForDateRange(
      getObjectId(),
      fromDate,
      toDate
    )
    expect(timeTutored).toBe(0)
  })

  test('Should get total timeTutored over a date range', async () => {
    const mockValue = {
      _id: null,
      timeTutored: 1000 * 60 * 10,
    }
    mockedSessionRepo.getTotalTimeTutoredForDateRange.mockImplementationOnce(
      async () => [mockValue]
    )
    const fromDate = new Date('12/13/2020')
    const toDate = new Date('12/25/2020')
    const timeTutored = await SessionService.getTimeTutoredForDateRange(
      getObjectId(),
      fromDate,
      toDate
    )
    expect(timeTutored).toBe(mockValue.timeTutored)
  })
})

describe('generateWaitTimeHeatMap', () => {
  test('Should create and return a heat map for session wait times', async () => {
    const mockedSessions = [
      { _id: '1-12', averageWaitTime: 10000, day: 1, hour: 12 },
      { _id: '4-18', averageWaitTime: 50000, day: 4, hour: 18 },
    ]
    mockedSessionRepo.getSessionsWithAvgWaitTimePerDayAndHour.mockImplementationOnce(
      // @todo: return type Aggregate of mockedSessions
      async () => mockedSessions
    )
    const heatMap = await SessionService.generateWaitTimeHeatMap(
      new Date(),
      new Date()
    )
    expect(heatMap.Monday['12p']).toBe(10000)
    expect(heatMap.Thursday['6p']).toBe(50000)
  })
})

describe('generateAndStoreWaitTimeHeatMap', () => {
  test('Should save the generated wait time heat map', async () => {
    const mockedSessions = [
      { _id: '1-12', averageWaitTime: 10000, day: 1, hour: 12 },
    ]
    mockedSessionRepo.getSessionsWithAvgWaitTimePerDayAndHour.mockImplementationOnce(
      // @todo: return type Aggregate of mockedSessions
      async () => mockedSessions
    )
    await SessionService.generateAndStoreWaitTimeHeatMap(new Date(), new Date())
    expect(cache.save).toHaveBeenCalledTimes(1)
  })
})

describe('getWaitTimeHeatMap', () => {
  const mockedHeatMap =
    '{"Sunday":{"12a":80000000,"1a":0,"2a":0,"3a":0,"4a":0,"5a":0,"6a":0,"7a":0,"8a":0,"9a":0,"10a":0,"11a":0,"12p":0,"1p":0,"2p":0,"3p":0,"4p":0,"5p":0,"6p":0,"7p":0,"8p":0,"9p":0,"10p":0,"11p":0},"Monday":{"12a":200000,"1a":0,"2a":0,"3a":0,"4a":0,"5a":0,"6a":0,"7a":0,"8a":0,"9a":0,"10a":0,"11a":0,"12p":0,"1p":0,"2p":0,"3p":0,"4p":0,"5p":0,"6p":0,"7p":0,"8p":0,"9p":0,"10p":0,"11p":0},"Tuesday":{"12a":0,"1a":0,"2a":0,"3a":0,"4a":0,"5a":0,"6a":0,"7a":0,"8a":0,"9a":0,"10a":0,"11a":0,"12p":0,"1p":0,"2p":0,"3p":0,"4p":0,"5p":0,"6p":0,"7p":0,"8p":0,"9p":0,"10p":0,"11p":0},"Wednesday":{"12a":0,"1a":0,"2a":0,"3a":0,"4a":0,"5a":0,"6a":0,"7a":0,"8a":0,"9a":0,"10a":0,"11a":0,"12p":0,"1p":0,"2p":0,"3p":0,"4p":0,"5p":0,"6p":0,"7p":0,"8p":0,"9p":0,"10p":0,"11p":0},"Thursday":{"12a":0,"1a":0,"2a":0,"3a":0,"4a":0,"5a":0,"6a":0,"7a":0,"8a":0,"9a":0,"10a":0,"11a":0,"12p":0,"1p":0,"2p":0,"3p":0,"4p":0,"5p":0,"6p":0,"7p":0,"8p":0,"9p":0,"10p":0,"11p":0},"Friday":{"12a":0,"1a":0,"2a":0,"3a":0,"4a":0,"5a":0,"6a":0,"7a":0,"8a":0,"9a":0,"10a":0,"11a":0,"12p":0,"1p":0,"2p":0,"3p":0,"4p":0,"5p":0,"6p":0,"7p":0,"8p":0,"9p":0,"10p":0,"11p":0},"Saturday":{"12a":0,"1a":0,"2a":0,"3a":0,"4a":0,"5a":0,"6a":0,"7a":0,"8a":0,"9a":0,"10a":0,"11a":0,"12p":0,"1p":0,"2p":0,"3p":0,"4p":0,"5p":0,"6p":0,"7p":0,"8p":0,"9p":0,"10p":0,"11p":0}}'

  test('Should throw error that only volunteers may be able to view the heat map if the user is a student', async () => {
    const expectedErrorMessage = 'Only volunteers may view the heat map'
    mockedCache.get.mockImplementationOnce(async () => mockedHeatMap)
    try {
      await SessionService.getWaitTimeHeatMap(buildStudent())
    } catch (error) {
      expect(error).toBeInstanceOf(NotAllowedError)
      expect((error as NotAllowedError).message).toBe(expectedErrorMessage)
    }
  })

  test('Should get the wait time heat map from the cache if the user is a volunteer', async () => {
    mockedCache.get.mockImplementationOnce(async () => mockedHeatMap)
    const result = await SessionService.getWaitTimeHeatMap(buildVolunteer())
    expect(JSON.parse(mockedHeatMap)).toEqual(result)
    expect(cache.get).toHaveBeenCalledTimes(1)
  })
})

describe('volunteersAvailableForSession', () => {
  const sessionId = getObjectId()
  const subject = SUBJECTS.PREALGREBA
  const notifiedAlready = [getObjectId()]
  const notifiedLastFifteenMins = [getObjectId(), getObjectId()]
  const volunteersInActiveSessions = [getObjectId()]
  const availabilityPath = 'availability.Monday.12p'
  const volunteersToExclude = [
    ...volunteersInActiveSessions,
    ...notifiedAlready,
    ...notifiedLastFifteenMins,
  ]

  test('Should return true if there are more volunteers available to notify', async () => {
    const volunteersOnDeck = [buildVolunteer(), buildVolunteer()]

    mockedTwilioService.getCurrentAvailabilityPath.mockReturnValue(
      availabilityPath
    )
    mockedTwilioService.getActiveSessionVolunteers.mockResolvedValueOnce(
      volunteersInActiveSessions
    )
    mockedVolunteerRepo.getVolunteersNotifiedBySessionId.mockResolvedValueOnce(
      notifiedAlready
    )
    mockedVolunteerRepo.getVolunteersNotifiedSinceDate.mockResolvedValueOnce(
      notifiedLastFifteenMins
    )
    mockedVolunteerRepo.getVolunteersOnDeck.mockResolvedValueOnce(
      volunteersOnDeck
    )
    const result = await SessionService.volunteersAvailableForSession(
      sessionId,
      subject
    )
    expect(result).toBeTruthy()
    expect(mockedVolunteerRepo.getVolunteersOnDeck).toHaveBeenCalledWith(
      subject,
      volunteersToExclude,
      availabilityPath
    )
  })

  test('Should return false if there are no more volunteers available to notify', async () => {
    const volunteersOnDeck: Volunteer[] = []

    mockedTwilioService.getCurrentAvailabilityPath.mockReturnValue(
      availabilityPath
    )
    mockedTwilioService.getActiveSessionVolunteers.mockResolvedValueOnce(
      volunteersInActiveSessions
    )
    mockedVolunteerRepo.getVolunteersNotifiedBySessionId.mockResolvedValueOnce(
      notifiedAlready
    )
    mockedVolunteerRepo.getVolunteersNotifiedSinceDate.mockResolvedValueOnce(
      notifiedLastFifteenMins
    )
    mockedVolunteerRepo.getVolunteersOnDeck.mockResolvedValueOnce(
      volunteersOnDeck
    )

    const result = await SessionService.volunteersAvailableForSession(
      sessionId,
      subject
    )
    expect(result).toBeFalsy()
    expect(mockedVolunteerRepo.getVolunteersOnDeck).toHaveBeenCalledWith(
      subject,
      volunteersToExclude,
      availabilityPath
    )
  })
})
*/
