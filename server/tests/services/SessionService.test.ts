import { mocked } from 'ts-jest/utils'
import * as SessionService from '../../services/SessionService'
import {
  buildMessage,
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
  getUUID
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
  mockedGetPublicSession
} from '../mocks/repos/session-repo'
import {
  EVENTS,
  SESSION_FLAGS,
  SESSION_REPORT_REASON,
  SUBJECTS,
  SUBJECT_TYPES
} from '../../constants'
import * as WhiteboardService from '../../services/WhiteboardService'
import QueueService from '../../services/QueueService'
import { Jobs } from '../../worker/jobs'
import * as SessionRepo from '../../models/Session'
import * as AssistmentsDataRepo from '../../models/AssistmentsData'
import {
  EndSessionError,
  ReportSessionError,
  StartSessionError
} from '../../utils/session-utils'
import MailService from '../../services/MailService'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as UserActionCtrl from '../../controllers/UserActionCtrl'
import UserService from '../../services/UserService'
import * as QuillDocService from '../../services/QuillDocService'
import * as VolunteerService from '../../services/VolunteerService'
import * as AwsService from '../../services/AwsService'
import * as UserActionService from '../../services/UserActionService'
import * as FeedbackService from '../../services/FeedbackService'
import SocketService from '../../services/SocketService'
import * as PushTokenService from '../../services/PushTokenService'
import * as SessionUtils from '../../utils/session-utils'
import TwilioService from '../../services/twilio'
import { LookupError } from '../../utils/type-utils'
import { FeedbackVersionTwo } from '../../models/Feedback'
import * as cache from '../../cache'
import { NotAllowed } from '../../models/Errors'
jest.mock('../../models/Session')
jest.mock('../../models/AssistmentsData')
jest.mock('../../services/MailService')
jest.mock('../../services/FeedbackService')
jest.mock('../../services/twilio')
jest.mock('../../services/AnalyticsService')
jest.mock('../../controllers/UserActionCtrl')
jest.mock('../../services/UserActionService')
jest.mock('../../services/UserService')
jest.mock('../../services/WhiteboardService')
jest.mock('../../services/QuillDocService')
jest.mock('../../services/VolunteerService')
jest.mock('../../services/QueueService')
jest.mock('../../services/SocketService')
jest.mock('../../services/AwsService')
jest.mock('../../services/PushTokenService')
jest.mock('../../cache')

const mockedSessionRepo = mocked(SessionRepo, true)
const mockedUserActionService = mocked(UserActionService, true)
const mockedFeedbackService = mocked(FeedbackService, true)
const mockedAwsService = mocked(AwsService, true)
const mockedPushTokenService = mocked(PushTokenService, true)
const mockedCache = mocked(cache, true)

beforeEach(async () => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
})

describe('reviewSession', () => {
  test('Should not make any updates', async () => {
    const sessionId = getStringObjectId()
    const input = {
      sessionId,
      reviewedStudent: undefined,
      reviewedVolunteer: undefined
    }
    await SessionService.reviewSession(input)
    expect(SessionRepo.updateReviewedStudent).toHaveBeenCalledTimes(0)
    expect(SessionRepo.updateReviewedVolunteer).toHaveBeenCalledTimes(0)
  })

  test('Should update reviewedStudent', async () => {
    const sessionId = getStringObjectId()
    const input = {
      sessionId,
      reviewedStudent: true,
      reviewedVolunteer: undefined
    }
    await SessionService.reviewSession(input)
    expect(SessionRepo.updateReviewedStudent).toHaveBeenCalledTimes(1)
    expect(SessionRepo.updateReviewedVolunteer).toHaveBeenCalledTimes(0)
  })

  test('Should update reviewedVolunteer', async () => {
    const sessionId = getStringObjectId()
    const input = {
      sessionId,
      reviewedStudent: undefined,
      reviewedVolunteer: true
    }
    await SessionService.reviewSession(input)
    expect(SessionRepo.updateReviewedStudent).toHaveBeenCalledTimes(0)
    expect(SessionRepo.updateReviewedVolunteer).toHaveBeenCalledTimes(1)
  })
})

describe('sessionsToReview', () => {
  test('Should get sessions to review the student', async () => {
    const input = {
      users: 'students',
      page: '1'
    }
    const mockedSessions = [
      mockedGetSessionsToReview(),
      mockedGetSessionsToReview()
    ]
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage, sessions } = await SessionService.sessionsToReview(
      input
    )
    expect(isLastPage).toBeTruthy()
    expect(sessions).toEqual(mockedSessions)
    expect(mockedSessionRepo.getSessionsToReview).toHaveBeenCalledWith({
      limit: 15,
      query: { reviewedStudent: false },
      skip: 0
    })
  })

  test('Should get sessions to review the volunteer', async () => {
    const input = {
      users: 'volunteers',
      page: '1'
    }
    const mockedSessions = [
      mockedGetSessionsToReview(),
      mockedGetSessionsToReview()
    ]
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage, sessions } = await SessionService.sessionsToReview(
      input
    )
    expect(isLastPage).toBeTruthy()
    expect(sessions).toEqual(mockedSessions)
    expect(mockedSessionRepo.getSessionsToReview).toHaveBeenCalledWith({
      limit: 15,
      query: { reviewedVolunteer: false },
      skip: 0
    })
  })

  test('Should get sessions to review both the student and volunteer', async () => {
    const input = {
      users: '',
      page: '1'
    }
    const mockedSessions = [
      mockedGetSessionsToReview(),
      mockedGetSessionsToReview()
    ]
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage, sessions } = await SessionService.sessionsToReview(
      input
    )
    expect(isLastPage).toBeTruthy()
    expect(sessions).toEqual(mockedSessions)
    expect(mockedSessionRepo.getSessionsToReview).toHaveBeenCalledWith({
      limit: 15,
      query: {
        $or: [{ reviewedStudent: false }, { reviewedVolunteer: false }]
      },
      skip: 0
    })
  })

  test('Should not be the last page if the total number of sessions is greater than the limit', async () => {
    const input = {
      users: 'volunteers',
      page: '1'
    }
    const mockedSessions = []
    for (let i = 0; i < 20; i++) {
      mockedSessions.push(mockedGetSessionsToReview())
    }
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage } = await SessionService.sessionsToReview(input)
    expect(isLastPage).toBeFalsy()
  })
})

describe('sessionsToReview', () => {
  test('Should not make any updates', async () => {
    const input = {
      users: 'volunteers',
      page: '1'
    }
    const mockedSessions = [
      mockedGetSessionsToReview(),
      mockedGetSessionsToReview()
    ]
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage, sessions } = await SessionService.sessionsToReview(
      input
    )
    expect(isLastPage).toBeTruthy()
    expect(sessions).toEqual(mockedSessions)
    expect(mockedSessionRepo.getSessionsToReview).toHaveBeenCalledWith({
      limit: 15,
      query: { reviewedVolunteer: false },
      skip: 0
    })
  })

  test('Should not make any updates', async () => {
    const input = {
      users: 'students',
      page: '1'
    }
    const mockedSessions = [
      mockedGetSessionsToReview(),
      mockedGetSessionsToReview()
    ]
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage, sessions } = await SessionService.sessionsToReview(
      input
    )
    expect(isLastPage).toBeTruthy()
    expect(sessions).toEqual(mockedSessions)
    expect(mockedSessionRepo.getSessionsToReview).toHaveBeenCalledWith({
      limit: 15,
      query: { reviewedStudent: false },
      skip: 0
    })
  })

  test('Should not make any updates', async () => {
    const input = {
      users: '',
      page: '1'
    }
    const mockedSessions = [
      mockedGetSessionsToReview(),
      mockedGetSessionsToReview()
    ]
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage, sessions } = await SessionService.sessionsToReview(
      input
    )
    expect(isLastPage).toBeTruthy()
    expect(sessions).toEqual(mockedSessions)
    expect(mockedSessionRepo.getSessionsToReview).toHaveBeenCalledWith({
      limit: 15,
      query: {
        $or: [{ reviewedStudent: false }, { reviewedVolunteer: false }]
      },
      skip: 0
    })
  })

  test('Should not be last page', async () => {
    const input = {
      users: 'volunteer',
      page: '1'
    }
    const mockedSessions = []
    for (let i = 0; i < 20; i++) {
      mockedSessions.push(mockedGetSessionsToReview())
    }
    mockedSessionRepo.getSessionsToReview.mockImplementationOnce(
      async () => mockedSessions
    )
    const { isLastPage } = await SessionService.sessionsToReview(input)
    expect(isLastPage).toBeFalsy()
  })
})

describe('reportSession', () => {
  test('Should throw ReportSessionError if no volunteer on session', async () => {
    const input = {
      user: buildVolunteer(),
      sessionId: getStringObjectId(),
      reportReason: SESSION_REPORT_REASON.STUDENT_MISUSE,
      reportMessage: generateSentence()
    }
    const mockValue = mockedGetSessionById()
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    try {
      await SessionService.reportSession(input)
    } catch (error) {
      expect(error).toBeInstanceOf(ReportSessionError)
    }
  })

  test('Should throw ReportSessionError if the user reporting does not match the volunteer on the session', async () => {
    const input = {
      user: buildVolunteer(),
      sessionId: getStringObjectId(),
      reportReason: SESSION_REPORT_REASON.STUDENT_MISUSE,
      reportMessage: generateSentence()
    }
    const mockValue = mockedGetSessionById({ volunteer: getObjectId() })
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    try {
      await SessionService.reportSession(input)
    } catch (error) {
      expect(error).toBeInstanceOf(ReportSessionError)
    }
  })

  test('Should report session', async () => {
    const input = {
      user: buildVolunteer(),
      sessionId: getStringObjectId(),
      reportReason: SESSION_REPORT_REASON.STUDENT_MISUSE,
      reportMessage: generateSentence()
    }
    const mockValue = mockedGetSessionById({ volunteer: input.user._id })
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )
    await SessionService.reportSession(input)
    expect(SessionRepo.updateReportSession).toHaveBeenCalledTimes(1)
    expect(UserService.banUser).toHaveBeenCalledTimes(1)
    expect(MailService.sendBannedUserAlert).toHaveBeenCalledTimes(1)
    expect(UserActionCtrl.AccountActionCreator).toHaveBeenCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledTimes(1)
    expect(UserService.getUser).toHaveBeenCalledTimes(1)
    expect(MailService.createContact).toHaveBeenCalledTimes(1)
    expect(MailService.sendReportedSessionAlert).toHaveBeenCalledTimes(1)
  })
})

describe('endSession', () => {
  test('Should throw session has already ended', async () => {
    const mockedSession = mockedGetSessionToEnd({ endedAt: new Date() })
    const input = {
      sessionId: mockedSession._id.toString(),
      endedBy: null,
      isAdmin: false
    }
    mockedSessionRepo.getSessionToEnd.mockImplementationOnce(
      async () => mockedSession
    )
    try {
      await SessionService.endSession(input)
      fail('should throw error')
    } catch (error) {
      expect(error).toBeInstanceOf(EndSessionError)
      expect(error.message).toBe('Session has already ended')
    }
  })

  test('Should throw only session participants can end a session', async () => {
    const mockedSession = mockedGetSessionToEnd()
    const input = {
      sessionId: mockedSession._id.toString(),
      endedBy: getObjectId(),
      isAdmin: false
    }
    mockedSessionRepo.getSessionToEnd.mockImplementationOnce(
      async () => mockedSession
    )
    const spy = jest.spyOn(SessionUtils, 'isSessionParticipant')
    spy.mockImplementationOnce(() => false)
    try {
      await SessionService.endSession(input)
      fail('should throw error')
    } catch (error) {
      expect(error).toBeInstanceOf(EndSessionError)
      expect(error.message).toBe('Only session participants can end a session')
    }
  })

  describe('Should end session successfully', () => {
    let spyGetReviewFlags
    let spyHasReviewTriggerFlags
    let spyIsSessionParticipant
    let spyCalculateTimeTutored
    beforeEach(async () => {
      spyGetReviewFlags = jest.spyOn(SessionUtils, 'getReviewFlags')
      spyHasReviewTriggerFlags = jest.spyOn(
        SessionUtils,
        'hasReviewTriggerFlags'
      )
      spyIsSessionParticipant = jest.spyOn(SessionUtils, 'isSessionParticipant')
      spyCalculateTimeTutored = jest.spyOn(SessionUtils, 'calculateTimeTutored')
    })
    test('Should end session and send first session congrats to any user who had their first session', async () => {
      const mockedSession = mockedGetSessionToEnd()
      const input = {
        sessionId: mockedSession._id.toString(),
        endedBy: mockedSession.student,
        isAdmin: false
      }
      mockedSessionRepo.getSessionToEnd.mockImplementationOnce(
        async () => mockedSession
      )
      spyGetReviewFlags.mockImplementationOnce(() => [
        SESSION_FLAGS.FIRST_TIME_VOLUNTEER
      ])
      spyHasReviewTriggerFlags.mockImplementationOnce(() => true)
      spyIsSessionParticipant.mockImplementationOnce(() => true)
      spyCalculateTimeTutored.mockImplementationOnce(() => 1000 * 60 * 20)
      await SessionService.endSession(input)
      expect(UserService.addPastSession).toHaveBeenCalledTimes(1)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentFirstSessionCongrats,
        {
          sessionId: mockedSession._id
        },
        expect.anything()
      )
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailVolunteerFirstSessionCongrats,
        {
          sessionId: mockedSession._id
        },
        expect.anything()
      )
      expect(
        VolunteerService.updatePastSessionsAndTimeTutored
      ).toHaveBeenCalledTimes(1)
      expect(WhiteboardService.getDoc).toHaveBeenCalledTimes(1)
      expect(WhiteboardService.deleteDoc).toHaveBeenCalledTimes(1)
      expect(QuillDocService.deleteDoc).toHaveBeenCalledTimes(1)
      expect(SessionRepo.updateSessionToEnd).toHaveBeenCalledTimes(1)
    })

    test('Should end college counseling subject', async () => {
      const mockedSession = mockedGetSessionToEnd({
        type: SUBJECT_TYPES.COLLEGE
      })
      const input = {
        sessionId: mockedSession._id.toString(),
        endedBy: mockedSession.student,
        isAdmin: false
      }
      mockedSessionRepo.getSessionToEnd.mockImplementationOnce(
        async () => mockedSession
      )
      spyGetReviewFlags.mockImplementationOnce(() => [
        SESSION_FLAGS.FIRST_TIME_VOLUNTEER
      ])
      spyHasReviewTriggerFlags.mockImplementationOnce(() => true)
      spyIsSessionParticipant.mockImplementationOnce(() => true)
      spyCalculateTimeTutored.mockImplementationOnce(() => 1000 * 60 * 20)
      await SessionService.endSession(input)
      expect(UserService.addPastSession).toHaveBeenCalledTimes(1)
      expect(
        VolunteerService.updatePastSessionsAndTimeTutored
      ).toHaveBeenCalledTimes(1)
      expect(QuillDocService.getDoc).toHaveBeenCalledTimes(1)
      expect(QuillDocService.deleteDoc).toHaveBeenCalledTimes(1)
      expect(SessionRepo.updateSessionToEnd).toHaveBeenCalledTimes(1)
    })

    test('Should add a job to queue on the 5th session for the volunteer', async () => {
      const volunteer = buildVolunteer({
        pastSessions: [
          getObjectId(),
          getObjectId(),
          getObjectId(),
          getObjectId()
        ],
        volunteerPartnerOrg: 'example'
      })
      const mockedSession = mockedGetSessionToEnd({
        volunteer
      })

      const input = {
        sessionId: mockedSession._id.toString(),
        endedBy: mockedSession.student,
        isAdmin: false
      }
      mockedSessionRepo.getSessionToEnd.mockImplementationOnce(
        async () => mockedSession
      )
      spyGetReviewFlags.mockImplementationOnce(() => [
        SESSION_FLAGS.FIRST_TIME_VOLUNTEER
      ])
      spyHasReviewTriggerFlags.mockImplementationOnce(() => true)
      spyIsSessionParticipant.mockImplementationOnce(() => true)
      spyCalculateTimeTutored.mockImplementationOnce(() => 1000 * 60 * 20)
      await SessionService.endSession(input)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailPartnerVolunteerReferACoworker,
        {
          volunteerId: mockedSession.volunteer._id,
          firstName: mockedSession.volunteer.firstname,
          email: mockedSession.volunteer.email,
          partnerOrg: mockedSession.volunteer.volunteerPartnerOrg
        },
        expect.anything()
      )
      expect(SessionRepo.updateSessionToEnd).toHaveBeenCalledTimes(1)
    })

    test('Should add a job to queue on the 10th session for the volunteer', async () => {
      const volunteer = buildVolunteer({
        pastSessions: [
          getObjectId(),
          getObjectId(),
          getObjectId(),
          getObjectId(),
          getObjectId(),
          getObjectId(),
          getObjectId(),
          getObjectId(),
          getObjectId()
        ],
        volunteerPartnerOrg: 'example'
      })
      const mockedSession = mockedGetSessionToEnd({
        volunteer
      })

      const input = {
        sessionId: mockedSession._id.toString(),
        endedBy: mockedSession.student,
        isAdmin: false
      }
      mockedSessionRepo.getSessionToEnd.mockImplementationOnce(
        async () => mockedSession
      )
      spyGetReviewFlags.mockImplementationOnce(() => [
        SESSION_FLAGS.FIRST_TIME_VOLUNTEER
      ])
      spyHasReviewTriggerFlags.mockImplementationOnce(() => true)
      spyIsSessionParticipant.mockImplementationOnce(() => true)
      spyCalculateTimeTutored.mockImplementationOnce(() => 1000 * 60 * 20)
      await SessionService.endSession(input)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailPartnerVolunteerTenSessionMilestone,
        {
          volunteerId: mockedSession.volunteer._id,
          firstName: mockedSession.volunteer.firstname,
          email: mockedSession.volunteer.email
        },
        expect.anything()
      )
      expect(SessionRepo.updateSessionToEnd).toHaveBeenCalledTimes(1)
    })
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
    const sessionId = getStringObjectId()
    await SessionService.getSessionPhotoUploadUrl(sessionId)
    expect(SessionRepo.addSessionPhotoKey).toHaveBeenCalledTimes(1)
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
      page: '1'
    }
    const mockValue = [
      mockedGetAdminFilteredSessions(),
      mockedGetAdminFilteredSessions(),
      mockedGetAdminFilteredSessions()
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
      page: '1'
    }
    const mockValue = []
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
      type: 'college'
    })
    const mockUserAgent = buildUserAgent()
    const mockFeedback = [buildFeedback() as FeedbackVersionTwo]
    const mockSessionPhotos = ['12345', '54321']
    mockedSessionRepo.getSessionByIdWithStudentAndVolunteer.mockImplementationOnce(
      // @todo: fix
      // @ts-expect-error
      async () => mockSession
    )
    mockedUserActionService.getSessionRequestedUserAgentFromSessionId.mockImplementationOnce(
      async () => mockUserAgent
    )
    mockedFeedbackService.getFeedbackForSession.mockImplementationOnce(
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
      photos: mockSessionPhotos
    })
  })
})

describe('startSession', () => {
  test('Should throw an error that volunteers cannot create sessions', async () => {
    const input = {
      ip: getIpAddress(),
      user: buildVolunteer(),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      userAgent: getUserAgent()
    }
    try {
      await SessionService.startSession(input)
    } catch (error) {
      expect(error).toBeInstanceOf(StartSessionError)
      expect(error.message).toBe('Volunteers cannot create new sessions')
    }
  })

  test('Should throw an error if student is already in a session', async () => {
    const input = {
      ip: getIpAddress(),
      user: buildStudent(),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      userAgent: getUserAgent()
    }
    const mockValue = mockedGetCurrentSession()
    mockedSessionRepo.getCurrentSession.mockImplementationOnce(
      async () => mockValue
    )
    try {
      await SessionService.startSession(input)
    } catch (error) {
      expect(error).toBeInstanceOf(StartSessionError)
      expect(error.message).toBe('Student already has an active session')
    }
  })

  test('Should not notify volunteers if the student is banned', async () => {
    const input = {
      ip: getIpAddress(),
      user: buildStudent({ isBanned: true }),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      userAgent: getUserAgent()
    }
    const mockValue = mockedCreateSession()
    mockedSessionRepo.getCurrentSession.mockImplementationOnce(async () => null)
    mockedSessionRepo.createSession.mockImplementationOnce(
      async () => mockValue
    )
    await SessionService.startSession(input)
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.EndUnmatchedSession,
      {
        sessionId: mockValue._id
      },
      expect.anything()
    )
    expect(UserActionCtrl.SessionActionCreator).toHaveBeenCalledTimes(1)
    expect(TwilioService.beginRegularNotifications).toHaveBeenCalledTimes(0)
    expect(TwilioService.beginFailsafeNotifications).toHaveBeenCalledTimes(0)
  })

  test('Should create a new session', async () => {
    const input = {
      ip: getIpAddress(),
      user: buildStudent(),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      userAgent: getUserAgent()
    }
    const mockValue = mockedCreateSession()
    mockedSessionRepo.getCurrentSession.mockImplementationOnce(async () => null)
    mockedSessionRepo.createSession.mockImplementationOnce(
      async () => mockValue
    )
    await SessionService.startSession(input)
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.EndUnmatchedSession,
      {
        sessionId: mockValue._id
      },
      expect.anything()
    )
    expect(AssistmentsDataRepo.createBySession).not.toHaveBeenCalled()
    expect(UserActionCtrl.SessionActionCreator).toHaveBeenCalledTimes(1)
    expect(TwilioService.beginRegularNotifications).toHaveBeenCalledWith(
      mockValue
    )
    expect(TwilioService.beginFailsafeNotifications).toHaveBeenCalledWith(
      mockValue
    )
  })

  test('Should create a new session and create an ASSISTments data record', async () => {
    const input = {
      ip: getIpAddress(),
      user: buildStudent(),
      sessionSubTopic: SUBJECTS.PREALGREBA,
      sessionType: SUBJECT_TYPES.MATH,
      problemId: '12345',
      assignmentId: getUUID(),
      studentId: getUUID(),
      userAgent: getUserAgent()
    }
    const mockValue = mockedCreateSession()
    mockedSessionRepo.getCurrentSession.mockImplementationOnce(async () => null)
    mockedSessionRepo.createSession.mockImplementationOnce(
      async () => mockValue
    )
    await SessionService.startSession(input)
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.EndUnmatchedSession,
      {
        sessionId: mockValue._id
      },
      expect.anything()
    )
    expect(UserActionCtrl.SessionActionCreator).toHaveBeenCalledTimes(1)
    expect(AssistmentsDataRepo.createBySession).toHaveBeenCalled()
    expect(TwilioService.beginRegularNotifications).toHaveBeenCalledWith(
      mockValue
    )
    expect(TwilioService.beginFailsafeNotifications).toHaveBeenCalledWith(
      mockValue
    )
  })
})

describe('finishSession', () => {
  test.todo('endSession should be mocked')
  test('Should finish a session', async () => {
    const input = {
      ip: getIpAddress(),
      user: buildVolunteer(),
      sessionId: getStringObjectId(),
      userAgent: getUserAgent()
    }

    const socketService = new SocketService({})

    // @todo: call a mocked version or spy of SessionService.endSession
    const mockedSessionToEnd = mockedGetSessionToEnd({
      volunteer: input.user,
      endedBy: input.user._id
    })
    mockedSessionRepo.getSessionToEnd.mockImplementationOnce(
      async () => mockedSessionToEnd
    )

    await SessionService.finishSession(input, socketService)
    expect(socketService.emitSessionChange).toHaveBeenCalledTimes(1)
    expect(UserActionCtrl.SessionActionCreator).toHaveBeenCalledTimes(1)
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
    mockedSessionRepo.getCurrentSession.mockImplementationOnce(
      async () => mockValue
    )
    const actual = await SessionService.currentSession(user)
    expect(SessionRepo.getCurrentSession).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(mockValue)
  })
})

describe('studentLatestSession', () => {
  test('Should get latest session', async () => {
    const userId = getStringObjectId()
    const mockValue = mockedGetStudentLatestSession()
    mockedSessionRepo.getStudentLatestSession.mockImplementationOnce(
      async () => mockValue
    )
    const actual = await SessionService.studentLatestSession(userId)
    expect(SessionRepo.getStudentLatestSession).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(mockValue)
  })
})

describe('sessionTimedOut', () => {
  test('Should get latest session', async () => {
    const input = {
      ip: getIpAddress(),
      user: buildVolunteer(),
      sessionId: getStringObjectId(),
      userAgent: getUserAgent(),
      timeout: 15
    }

    await SessionService.sessionTimedOut(input)
    expect(UserActionCtrl.SessionActionCreator).toHaveBeenCalledTimes(1)
  })
})

describe('publicSession', () => {
  test('Should get session', async () => {
    const sessionId = getStringObjectId()
    const mockValue = mockedGetPublicSession()
    mockedSessionRepo.getPublicSession.mockImplementationOnce(async () => [
      mockValue
    ])
    const [actual] = await SessionService.publicSession(sessionId)
    expect(SessionRepo.getPublicSession).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(mockValue)
  })
})

describe('getSessionNotifications', () => {
  test('Should get session', async () => {
    const sessionId = getStringObjectId()
    const mockValue = mockedGetPublicSession()
    mockedSessionRepo.getPublicSession.mockImplementationOnce(async () => [
      mockValue
    ])
    const [actual] = await SessionService.publicSession(sessionId)
    expect(SessionRepo.getPublicSession).toHaveBeenCalledTimes(1)
    expect(actual).toEqual(mockValue)
  })
})

describe('joinSession', () => {
  test('Should throw error that session has ended', async () => {
    const input = {
      socket: buildSocket(),
      session: buildSession({ student: getObjectId(), endedAt: new Date() }),
      user: buildVolunteer(),
      joinedFrom: ''
    }
    try {
      await SessionService.joinSession(input)
      fail('should throw error')
    } catch (error) {
      expect(SessionRepo.updateFailedJoins).toBeCalledTimes(1)
      expect(SessionRepo.updateFailedJoins).toHaveBeenCalledWith(
        input.session._id.toString(),
        input.user._id
      )
      expect(error.message).toBe('Session has ended')
    }
  })

  // eslint-disable-next-line quotes
  test("Should throw error that astudent cannot join another student's session", async () => {
    const input = {
      socket: buildSocket(),
      session: buildSession({
        student: getObjectId()
      }),
      user: buildStudent(),
      joinedFrom: ''
    }
    try {
      await SessionService.joinSession(input)
      fail('should throw error')
    } catch (error) {
      expect(SessionRepo.updateFailedJoins).toBeCalledTimes(1)
      expect(SessionRepo.updateFailedJoins).toHaveBeenCalledWith(
        input.session._id.toString(),
        input.user._id
      )
      expect(error.message).toBe(
        // eslint-disable-next-line quotes
        "A student cannot join another student's session"
      )
    }
  })

  test('Should throw error that a volunteer has already joined the session', async () => {
    const input = {
      socket: buildSocket(),
      session: buildSession({
        student: getObjectId(),
        volunteer: getObjectId()
      }),
      user: buildVolunteer(),
      joinedFrom: ''
    }
    try {
      await SessionService.joinSession(input)
      fail('should throw error')
    } catch (error) {
      expect(SessionRepo.updateFailedJoins).toBeCalledTimes(1)
      expect(SessionRepo.updateFailedJoins).toHaveBeenCalledWith(
        input.session._id.toString(),
        input.user._id
      )
      expect(error.message).toBe('A volunteer has already joined the session')
    }
  })

  test('Volunteer should join session on initial join', async () => {
    const input = {
      socket: buildSocket(),
      session: buildSession({
        student: getObjectId()
      }),
      user: buildVolunteer(),
      joinedFrom: ''
    }

    mockedPushTokenService.getAllPushTokensByUserId.mockImplementationOnce(
      async () => [buildPushToken(), buildPushToken()]
    )

    await SessionService.joinSession(input)
    expect(SessionRepo.addVolunteerToSession).toBeCalledTimes(1)
    expect(SessionRepo.addVolunteerToSession).toHaveBeenCalledWith(
      input.session._id,
      input.user._id
    )
    expect(UserActionCtrl.SessionActionCreator).toBeCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      input.user._id,
      EVENTS.SESSION_JOINED,
      {
        event: EVENTS.SESSION_JOINED,
        sessionId: input.session._id.toString(),
        joinedFrom: input.joinedFrom
      }
    )
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      input.session.student.toString(),
      EVENTS.SESSION_MATCHED,
      {
        event: EVENTS.SESSION_MATCHED,
        sessionId: input.session._id.toString()
      }
    )
    expect(PushTokenService.getAllPushTokensByUserId).toBeCalledTimes(1)
    expect(PushTokenService.sendVolunteerJoined).toBeCalledTimes(1)
  })

  test('Should fire off a session rejoined action/event if user is rejoining the session', async () => {
    const volunteer = buildVolunteer()
    const input = {
      socket: buildSocket(),
      session: buildSession({
        student: getObjectId(),
        volunteer: volunteer._id,
        createdAt: new Date(new Date().getTime() - 1000 * 60 * 10)
      }),
      user: volunteer,
      joinedFrom: ''
    }

    mockedPushTokenService.getAllPushTokensByUserId.mockImplementationOnce(
      async () => [buildPushToken(), buildPushToken()]
    )

    await SessionService.joinSession(input)
    expect(SessionRepo.addVolunteerToSession).not.toHaveBeenCalled()
    expect(UserActionCtrl.SessionActionCreator).toBeCalledTimes(1)
    expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
      input.user._id,
      EVENTS.SESSION_REJOINED,
      {
        event: EVENTS.SESSION_REJOINED,
        sessionId: input.session._id.toString()
      }
    )
  })
})

describe('saveMessage', () => {
  test('Should throw error if no session is found', async () => {
    const user = buildStudent({
      _id: getStringObjectId(),
      createdAt: new Date().toISOString()
    })
    const input = {
      sessionId: getStringObjectId(),
      user,
      message: buildMessage({ user: user._id })
    }
    const errorMessage = 'No session found'
    mockedSessionRepo.getSessionById.mockImplementationOnce(async () => {
      throw new LookupError(errorMessage)
    })
    try {
      await SessionService.saveMessage(input)
    } catch (error) {
      expect(error).toBeInstanceOf(LookupError)
      expect(error.message).toBe(errorMessage)
    }
  })

  test('Should add new message to the session', async () => {
    const user = buildStudent({
      _id: getStringObjectId(),
      createdAt: new Date().toISOString()
    })
    const input = {
      sessionId: getStringObjectId(),
      user,
      message: buildMessage({ user: user._id })
    }
    const mockValue = mockedGetSessionById({ student: user._id })
    mockedSessionRepo.getSessionById.mockImplementationOnce(
      async () => mockValue
    )

    await SessionService.saveMessage(input)
    expect(SessionRepo.addMessage).toHaveBeenCalledTimes(1)
  })
})

describe('getTimeTutoredForDateRange', () => {
  test('Should return 0 if no timeTutored for the date range', async () => {
    const mockValue = null
    mockedSessionRepo.getTotalTimeTutoredForDateRange.mockImplementationOnce(
      async () => [mockValue]
    )
    const fromDate = new Date('12/13/2020')
    const toDate = new Date('12/25/2020')
    const timeTutored = await SessionService.getTimeTutoredForDateRange(
      getStringObjectId(),
      fromDate,
      toDate
    )
    expect(timeTutored).toBe(0)
  })

  test('Should get total timeTutored over a date range', async () => {
    const mockValue = {
      _id: null,
      timeTutored: 1000 * 60 * 10
    }
    mockedSessionRepo.getTotalTimeTutoredForDateRange.mockImplementationOnce(
      async () => [mockValue]
    )
    const fromDate = new Date('12/13/2020')
    const toDate = new Date('12/25/2020')
    const timeTutored = await SessionService.getTimeTutoredForDateRange(
      getStringObjectId(),
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
      { _id: '4-18', averageWaitTime: 50000, day: 4, hour: 18 }
    ]
    mockedSessionRepo.getSessionsWithAvgWaitTimePerDayAndHour.mockImplementationOnce(
      // @todo: return type Aggregate of mockedSessions
      // @ts-expect-error
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
      { _id: '1-12', averageWaitTime: 10000, day: 1, hour: 12 }
    ]
    mockedSessionRepo.getSessionsWithAvgWaitTimePerDayAndHour.mockImplementationOnce(
      // @todo: return type Aggregate of mockedSessions
      // @ts-expect-error
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
      expect(error).toBeInstanceOf(NotAllowed)
      expect(error.message).toBe(expectedErrorMessage)
    }
  })

  test('Should get the wait time heat map from the cache if the user is a volunteer', async () => {
    mockedCache.get.mockImplementationOnce(async () => mockedHeatMap)
    const result = await SessionService.getWaitTimeHeatMap(buildVolunteer())
    expect(JSON.parse(mockedHeatMap)).toEqual(result)
    expect(cache.get).toHaveBeenCalledTimes(1)
  })
})
