import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import {
  buildAdminFilteredSession,
  buildAdminSessionView,
  buildCurrentSession,
  buildCurrentSessionPublic,
  buildLatestSession,
  buildPresessionSurveyResponses,
  buildPublicSession,
  buildRecapSession,
  buildSessionDetail,
  buildSessionHistorySession,
  buildSessionNotification,
  buildSessionSummary,
  buildSessionToReview,
  buildStudentAssignment,
  buildTutorBotTranscript,
  buildUser,
} from '../../mocks/generate'
import { routeSession } from '../../../router/api/session'
import * as AssignmentsService from '../../../services/AssignmentsService'
import * as SessionMeetingService from '../../../services/SessionMeetingService'
import * as SessionService from '../../../services/SessionService'
import * as SessionSummariesService from '../../../services/SessionSummariesService'
import * as SocketServiceModule from '../../../services/SocketService'
import * as SurveyService from '../../../services/SurveyService'
import * as TutorBotService from '../../../services/TutorBotService'
import { ReportSessionError } from '../../../utils/session-utils'
import { getUuid } from '../../../models/pgUtils'
import { RoleContext } from '../../../services/UserRolesService'
import { USER_ROLES } from '../../../constants'

function isAdmin(
  req: ExpressRequest<string, unknown>,
  res: ExpressResponse,
  next: () => void
): void {
  next()
}

const socketService = {
  emitSessionChange: jest.fn(),
  emitSessionPresence: jest.fn(),
}

jest.mock('../../../services/AssignmentsService')
jest.mock('../../../services/SessionMeetingService')
jest.mock('../../../services/SessionService')
jest.mock('../../../services/SessionSummariesService')
jest.mock('../../../services/SocketService', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => socketService),
  },
}))
jest.mock('../../../services/SurveyService')
jest.mock('../../../services/TutorBotService')
jest.mock('../../../utils/auth-utils', () => ({
  authPassport: {
    isAdmin,
  },
}))

const mockedAssignmentsService = mocked(AssignmentsService)
const mockedSessionMeetingService = mocked(SessionMeetingService)
const mockedSessionService = mocked(SessionService)
const mockedSocketServiceModule = mocked(SocketServiceModule)
const mockedSessionSummariesService = mocked(SessionSummariesService)
const mockedSurveyService = mocked(SurveyService)
const mockedTutorBotService = mocked(TutorBotService)

let mockUser = buildUser()
const userAgent = 'test-user-agent'

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeSession(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent
    .post(path)
    .set('Accept', 'application/json')
    .set('User-Agent', userAgent)
    .send(payload)
}

function sendPut(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.put(path).set('Accept', 'application/json').send(payload)
}

describe('routeSession', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUser()
    mockedSocketServiceModule.default.getInstance.mockReturnValue(
      socketService as never
    )
  })

  describe('POST /api/session/new', () => {
    test('starts a new session', async () => {
      const session = buildCurrentSession({
        volunteer: undefined,
        volunteerJoinedAt: undefined,
      })
      const currentSessionPublic = buildCurrentSessionPublic(session)
      const presessionSurvey = buildPresessionSurveyResponses()
      mockedSessionService.startSession.mockResolvedValueOnce(session)
      mockedSessionService.isZwibserveSession.mockResolvedValueOnce(true)
      mockedSessionService.toCurrentSessionPublic.mockReturnValue(
        currentSessionPublic
      )
      mockedSurveyService.asSaveUserSurveyAndSubmissions.mockReturnValue(
        presessionSurvey
      )

      const response = await sendPost('/api/session/new', {
        sessionSubTopic: session.subject,
        sessionType: session.topic,
        presessionSurvey,
      })
      expect(response.status).toBe(200)
      expect(mockedSessionService.startSession).toHaveBeenCalledWith(
        mockUser,
        expect.objectContaining({
          sessionSubTopic: session.subject,
          sessionType: session.topic,
          subject: session.subject,
          topic: session.topic,
          assignmentId: undefined,
          docEditorVersion: undefined,
          userAgent,
          ip: expect.any(String),
          presessionSurvey,
        })
      )
      expect(mockedSessionService.isZwibserveSession).toHaveBeenCalledWith(
        session.id
      )
      expect(response.body).toEqual({
        sessionId: session.id,
        session: currentSessionPublic,
        isZwibserveSession: true,
      })
    })
  })

  describe('POST /api/session/join', () => {
    test('joins a session', async () => {
      const session = buildCurrentSession()
      const currentSessionPublic = buildCurrentSessionPublic(session)
      mockedSessionService.joinSession.mockResolvedValueOnce(session)
      mockedSessionService.isZwibserveSession.mockResolvedValueOnce(false)
      mockedSessionService.toCurrentSessionPublic.mockReturnValue(
        currentSessionPublic
      )

      const response = await sendPost('/api/session/join', {
        sessionId: session.id,
        joinedFrom: 'dashboard',
      })
      expect(response.status).toBe(200)
      expect(mockedSessionService.joinSession).toHaveBeenCalledWith(
        mockUser,
        session.id,
        {
          ipAddress: expect.any(String),
          userAgent,
          joinedFrom: 'dashboard',
        }
      )
      expect(mockedSessionService.isZwibserveSession).toHaveBeenCalledWith(
        session.id
      )
      expect(response.body).toEqual({
        session: currentSessionPublic,
        isZwibserveSession: false,
      })
    })
  })

  describe('POST /api/session/end', () => {
    test('ends a session', async () => {
      const endedSession = buildCurrentSession({
        endedAt: new Date(),
      })
      const currentSessionPublic = buildCurrentSessionPublic(endedSession)
      mockedSessionService.endSession.mockResolvedValueOnce(endedSession)
      mockedSessionService.toCurrentSessionPublic.mockReturnValue(
        currentSessionPublic
      )

      const response = await sendPost('/api/session/end', {
        sessionId: endedSession.id,
      })
      expect(response.status).toBe(200)
      expect(mockedSessionService.endSession).toHaveBeenCalledWith(
        endedSession.id,
        mockUser.id,
        false,
        socketService,
        {
          userAgent,
          ip: expect.any(String),
        }
      )
      expect(response.body).toEqual({
        sessionId: endedSession.id,
        session: currentSessionPublic,
      })
    })
  })

  describe('POST /api/session/check', () => {
    test('checks a session', async () => {
      const sessionId = getUuid()
      mockedSessionService.checkSession.mockResolvedValueOnce(sessionId)

      const response = await sendPost('/api/session/check', {
        sessionId,
      })
      expect(response.status).toBe(200)
      expect(mockedSessionService.checkSession).toHaveBeenCalledWith(sessionId)
      expect(response.body).toEqual({
        sessionId,
      })
    })
  })

  describe('POST /api/session/current', () => {
    test('returns null when there is no current session', async () => {
      mockedSessionService.currentSession.mockResolvedValueOnce(undefined)

      const response = await sendPost('/api/session/current')
      expect(response.status).toBe(200)
      expect(mockedSessionService.currentSession).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(response.body).toBeNull()
    })

    test('returns the current session', async () => {
      const currentSession = buildCurrentSession()
      const currentSessionPublic = buildCurrentSessionPublic(currentSession)
      mockedSessionService.currentSession.mockResolvedValueOnce(currentSession)
      mockedSessionService.toCurrentSessionPublic.mockReturnValueOnce(
        currentSessionPublic
      )

      const response = await sendPost('/api/session/current')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        sessionId: currentSession.id,
        data: currentSessionPublic,
      })
    })
  })

  describe('POST /api/session/recap-dms', () => {
    test('returns recap session dms session', async () => {
      const currentSession = buildCurrentSession()
      const currentSessionPublic = buildCurrentSessionPublic(currentSession)
      mockedSessionService.getRecapSessionForDms.mockResolvedValueOnce(
        currentSession
      )
      mockedSessionService.toCurrentSessionPublic.mockReturnValueOnce(
        currentSessionPublic
      )

      const response = await sendPost('/api/session/recap-dms', {
        sessionId: currentSession.id,
      })
      expect(response.status).toBe(200)
      expect(mockedSessionService.getRecapSessionForDms).toHaveBeenCalledWith(
        currentSession.id
      )
      expect(response.body).toEqual({
        sessionId: currentSession.id,
        data: currentSessionPublic,
      })
    })
  })

  describe('POST /api/session/latest', () => {
    test('returns null when there is no latest session', async () => {
      mockedSessionService.getLatestSession.mockResolvedValueOnce(undefined)

      const response = await sendPost('/api/session/latest')
      expect(response.status).toBe(200)
      expect(mockedSessionService.getLatestSession).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.roleContext.activeRole
      )
      expect(response.body).toBeNull()
    })

    test('returns the latest session', async () => {
      const latestSession = buildLatestSession()
      mockedSessionService.getLatestSession.mockResolvedValueOnce(latestSession)

      const response = await sendPost('/api/session/latest')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        sessionId: latestSession.id,
        data: {
          ...latestSession,
          createdAt: latestSession.createdAt.toISOString(),
          endedAt: latestSession.endedAt?.toISOString(),
        },
      })
    })

    test('returns 500 when activeRole is teacher', async () => {
      mockUser = buildUser({
        roleContext: new RoleContext(['teacher'], 'teacher', 'teacher'),
      })

      const response = await sendPost('/api/session/latest', {})
      expect(response.status).toBe(500)
      expect(mockedSessionService.getLatestSession).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/session/review', () => {
    test('returns sessions to review', async () => {
      const session = buildSessionToReview()
      const page = 1
      mockedSessionService.sessionsToReview.mockResolvedValueOnce({
        sessions: [session],
        isLastPage: true,
      })

      const response = await sendGet(
        `/api/session/review?page=${page}&studentFirstName=${session.studentFirstName}`
      )
      expect(response.status).toBe(200)
      expect(mockedSessionService.sessionsToReview).toHaveBeenCalledWith(
        String(page),
        {
          studentFirstName: session.studentFirstName,
        }
      )
      expect(response.body).toEqual({
        sessions: [
          {
            ...session,
            createdAt: session.createdAt.toISOString(),
            endedAt: session.endedAt?.toISOString(),
          },
        ],
        isLastPage: true,
      })
    })
  })

  describe('PUT /api/session/:sessionId', () => {
    test('reviews a session', async () => {
      const sessionId = getUuid()
      mockedSessionService.reviewSession.mockResolvedValueOnce()

      const response = await sendPut(`/api/session/${sessionId}`, {
        reviewed: true,
        toReview: false,
      })
      expect(response.status).toBe(200)
      expect(mockedSessionService.reviewSession).toHaveBeenCalledWith({
        reviewed: true,
        toReview: false,
        sessionId,
      })
    })
  })

  describe('GET /api/session/:sessionId/photo-url', () => {
    test('returns upload and image urls', async () => {
      const sessionId = getUuid()
      const uploadUrl = 'https://example.com/upload'
      const imageUrl = 'https://example.com/image'
      mockedSessionService.getImageAndUploadUrl.mockResolvedValueOnce({
        uploadUrl,
        imageUrl,
      })

      const response = await sendGet(`/api/session/${sessionId}/photo-url`)
      expect(response.status).toBe(200)
      expect(mockedSessionService.getImageAndUploadUrl).toHaveBeenCalledWith(
        sessionId
      )
      expect(response.body).toEqual({
        uploadUrl,
        imageUrl,
      })
    })
  })

  describe('POST /api/session/:sessionId/report', () => {
    test('reports a session', async () => {
      const sessionId = getUuid()
      const reportReason = 'reason'
      const reportMessage = 'message'
      mockedSessionService.reportSession.mockResolvedValueOnce()

      const response = await sendPost(`/api/session/${sessionId}/report`, {
        reportReason,
        reportMessage,
      })
      expect(response.status).toBe(200)
      expect(mockedSessionService.reportSession).toHaveBeenCalledWith(
        mockUser,
        {
          sessionId,
          reportReason,
          reportMessage,
        }
      )
      expect(response.body).toEqual({ msg: 'Success' })
    })

    test('returns 422 for ReportSessionError', async () => {
      const sessionId = getUuid()
      mockedSessionService.reportSession.mockRejectedValueOnce(
        new ReportSessionError()
      )

      const response = await sendPost(`/api/session/${sessionId}/report`, {
        reportReason: 'reason',
      })
      expect(response.status).toBe(422)
    })
  })

  describe('POST /api/session/:sessionId/timed-out', () => {
    test('marks a session as timed out', async () => {
      const sessionId = getUuid()
      mockedSessionService.sessionTimedOut.mockResolvedValueOnce()

      const response = await sendPost(`/api/session/${sessionId}/timed-out`, {
        timeout: 45,
      })
      expect(response.status).toBe(200)
      expect(mockedSessionService.sessionTimedOut).toHaveBeenCalledWith(
        mockUser,
        expect.objectContaining({
          sessionId,
          timeout: 45,
          userAgent: expect.any(String),
        })
      )
    })
  })

  // below
  describe('GET /api/sessions', () => {
    test('returns filtered admin sessions', async () => {
      const session = buildAdminFilteredSession()
      const page = 1
      mockedSessionService.adminFilteredSessions.mockResolvedValueOnce({
        sessions: [session],
        isLastPage: false,
      })

      const response = await sendGet(`/api/sessions?page=${page}`)
      expect(response.status).toBe(200)
      expect(mockedSessionService.adminFilteredSessions).toHaveBeenCalledWith({
        page: String(page),
      })
      expect(response.body).toEqual({
        sessions: [
          {
            ...session,
            createdAt: session.createdAt.toISOString(),
            endedAt: session.endedAt?.toISOString(),
          },
        ],
        isLastPage: false,
      })
    })
  })

  describe('GET /api/session/:sessionId/admin', () => {
    test('returns admin session view', async () => {
      const session = buildAdminSessionView()
      mockedSessionService.adminSessionView.mockResolvedValueOnce(session)

      const response = await sendGet(`/api/session/${session.id}/admin`)
      expect(response.status).toBe(200)
      expect(mockedSessionService.adminSessionView).toHaveBeenCalledWith(
        session.id
      )
      expect(response.body).toEqual({
        session: {
          ...session,
          createdAt: session.createdAt.toISOString(),
          endedAt: session.endedAt?.toISOString(),
          volunteerjoinedAt: session.volunteerjoinedAt?.toISOString(),
          messages: session.messages.map((message) => {
            return {
              ...message,
              createdAt: message.createdAt.toISOString(),
            }
          }),
          student: {
            ...session.student,
            createdAt: session.student?.createdAt.toISOString(),
          },
          volunteer: {
            ...session.volunteer,
            createdAt: session.volunteer?.createdAt.toISOString(),
          },
        },
      })
    })
  })

  describe('PUT /api/session/:sessionId/tutor-bot-conversation', () => {
    test('gets or creates tutor bot conversation by session id', async () => {
      const sessionId = getUuid()
      const transcript = buildTutorBotTranscript()
      mockedTutorBotService.getOrCreateConversationBySessionId.mockResolvedValueOnce(
        transcript
      )

      const response = await sendPut(
        `/api/session/${sessionId}/tutor-bot-conversation`
      )
      expect(response.status).toBe(200)
      expect(
        mockedTutorBotService.getOrCreateConversationBySessionId
      ).toHaveBeenCalledWith({
        sessionId,
      })
      expect(response.body).toEqual({
        ...transcript,
        messages: transcript.messages.map((message) => {
          return {
            ...message,
            createdAt: message.createdAt.toISOString(),
          }
        }),
      })
    })
  })

  describe('GET /api/session/:sessionId', () => {
    test('returns a public session', async () => {
      const session = buildPublicSession()
      mockedSessionService.publicSession.mockResolvedValueOnce(session as never)

      const response = await sendGet(`/api/session/${session._id}`)
      expect(response.status).toBe(200)
      expect(mockedSessionService.publicSession).toHaveBeenCalledWith(
        session._id
      )
      expect(response.body).toEqual({
        session: {
          ...session,
          createdAt: session.createdAt.toISOString(),
          endedAt: session.endedAt.toISOString(),
        },
      })
    })
  })

  describe('GET /api/session/:sessionId/notifications', () => {
    test('returns session notifications', async () => {
      const sessionId = getUuid()
      const notifications = [
        buildSessionNotification(),
        buildSessionNotification(),
      ]
      mockedSessionService.getSessionNotifications.mockResolvedValueOnce(
        notifications as never
      )

      const response = await sendGet(`/api/session/${sessionId}/notifications`)
      expect(response.status).toBe(200)
      expect(mockedSessionService.getSessionNotifications).toHaveBeenCalledWith(
        sessionId
      )
      expect(response.body).toEqual({ notifications })
    })
  })

  describe('GET /api/session/:sessionId/assignment', () => {
    test('returns student assignment for session', async () => {
      const sessionId = getUuid()
      const assignment = buildStudentAssignment()
      mockedAssignmentsService.getStudentAssignmentForSession.mockResolvedValueOnce(
        assignment
      )

      const response = await sendGet(`/api/session/${sessionId}/assignment`)
      expect(response.status).toBe(200)
      expect(
        mockedAssignmentsService.getStudentAssignmentForSession
      ).toHaveBeenCalledWith(sessionId)
      expect(response.body).toEqual({
        assignment: {
          ...assignment,
          assignedAt: assignment.assignedAt.toISOString(),
          dueDate: assignment.dueDate?.toISOString(),
          submittedAt: assignment.submittedAt?.toISOString(),
          startDate: assignment.startDate?.toISOString(),
        },
      })
    })
  })

  describe('GET /api/sessions/history', () => {
    test('returns session history', async () => {
      const filter = { subjectName: 'algebraOne' }
      const pastSessions = [buildSessionHistorySession()]
      mockedSessionService.asSessionHistoryFilter.mockReturnValueOnce(filter)
      mockedSessionService.getSessionHistory.mockResolvedValueOnce(pastSessions)

      const response = await sendGet(
        `/api/sessions/history?subject=${filter.subjectName}`
      )
      expect(response.status).toBe(200)
      expect(mockedSessionService.asSessionHistoryFilter).toHaveBeenCalledWith({
        subject: filter.subjectName,
      })
      expect(mockedSessionService.getSessionHistory).toHaveBeenCalledWith(
        mockUser.id,
        filter
      )
      expect(response.body).toEqual({
        pastSessions: pastSessions.map((session) => {
          return {
            ...session,
            createdAt: session.createdAt.toISOString(),
          }
        }),
      })
    })
  })

  describe('GET /api/sessions/history/total', () => {
    test('returns total session history with filters', async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const totalHistory = 10
      mockedSessionService.getTotalSessionHistory.mockResolvedValueOnce(
        totalHistory
      )

      const response = await sendGet(
        `/api/sessions/history/total?studentId=${studentId}&volunteerId=${volunteerId}`
      )
      expect(response.status).toBe(200)
      expect(mockedSessionService.getTotalSessionHistory).toHaveBeenCalledWith(
        mockUser.id,
        {
          studentId,
          volunteerId,
        }
      )
      expect(response.body).toEqual({ total: totalHistory })
    })
  })

  describe('POST /api/sessions/history/:sessionId/eligible', () => {
    test('returns session recap eligibility', async () => {
      const sessionId = getUuid()
      const studentId = getUuid()
      const volunteerId = getUuid()
      const isEligible = true
      mockedSessionService.isEligibleForSessionRecap.mockResolvedValueOnce(
        isEligible
      )

      const response = await sendPost(
        `/api/sessions/history/${sessionId}/eligible`,
        {
          studentId,
          volunteerId,
        }
      )
      expect(response.status).toBe(200)
      expect(
        mockedSessionService.isEligibleForSessionRecap
      ).toHaveBeenCalledWith(sessionId, studentId, volunteerId)
      expect(response.body).toEqual({ isEligible })
    })
  })

  describe('GET /api/sessions/:sessionId/recap', () => {
    test('returns recap for volunteer and strips feedback response on positive feedback', async () => {
      const session = buildRecapSession()
      const studentFeedback = {
        sessionId: session.id,
        response: 'great',
        howSupportiveWasYourCoachToday:
          session.feedbackFromStudent?.howSupportiveWasYourCoachToday,
        howMuchDidYourCoachPushYouToDoYourBestWorkToday:
          session.feedbackFromStudent
            ?.howMuchDidYourCoachPushYouToDoYourBestWorkToday,
      }

      mockedSessionService.getSessionRecap.mockResolvedValueOnce(session)
      mockedSurveyService.getStudentFeedbackForSession.mockResolvedValueOnce(
        studentFeedback
      )
      mockedSurveyService.classifyFeedback.mockReturnValueOnce({
        isPositive: true,
        feedback: studentFeedback,
      })
      mockedSessionService.isRecapDmsAvailable.mockResolvedValueOnce({
        eligible: true,
      })

      const response = await sendGet(`/api/sessions/${session.id}/recap`)
      expect(response.status).toBe(200)
      expect(mockedSessionService.getSessionRecap).toHaveBeenCalledWith(
        session.id,
        mockUser.id,
        false
      )
      expect(mockedSessionService.isRecapDmsAvailable).toHaveBeenCalledWith(
        session.id,
        mockUser.id
      )
      expect(response.body).toEqual({
        session: {
          ...session,
          messages: session.messages?.map((message) => {
            return {
              ...message,
              createdAt: message.createdAt.toISOString(),
            }
          }),
          createdAt: session.createdAt.toISOString(),
          endedAt: session.endedAt.toISOString(),
        },
        isRecapDmsAvailable: true,
        summary: '',
      })
      expect(
        mockedSessionSummariesService.getSessionSummaryByUserType
      ).not.toHaveBeenCalled()
    })

    test('returns recap for student and includes student summary', async () => {
      const session = buildRecapSession()
      mockUser = buildUser({
        id: session.studentId,
        roleContext: new RoleContext(['student'], 'student', 'student'),
      })
      const studentFeedback = {
        sessionId: session.id,
        response: 'super helpful',
        howSupportiveWasYourCoachToday:
          session.feedbackFromStudent?.howSupportiveWasYourCoachToday,
        howMuchDidYourCoachPushYouToDoYourBestWorkToday:
          session.feedbackFromStudent
            ?.howMuchDidYourCoachPushYouToDoYourBestWorkToday,
      }
      const sessionSummary = buildSessionSummary()

      mockedSessionService.getSessionRecap.mockResolvedValueOnce(session)
      mockedSurveyService.getStudentFeedbackForSession.mockResolvedValueOnce(
        studentFeedback
      )
      mockedSurveyService.classifyFeedback.mockReturnValueOnce({
        isPositive: false,
        feedback: studentFeedback,
      })
      mockedSessionService.isRecapDmsAvailable.mockResolvedValueOnce({
        eligible: false,
      })
      mockedSessionSummariesService.getSessionSummaryByUserType.mockResolvedValueOnce(
        sessionSummary
      )

      const response = await sendGet(`/api/sessions/${session.id}/recap`)
      expect(response.status).toBe(200)
      expect(
        mockedSessionSummariesService.getSessionSummaryByUserType
      ).toHaveBeenCalledWith(session.id, USER_ROLES.STUDENT)
      expect(response.body).toEqual({
        session: {
          ...session,
          createdAt: session.createdAt.toISOString(),
          endedAt: session.endedAt.toISOString(),
          messages: session.messages?.map((message) => {
            return {
              ...message,
              createdAt: message.createdAt.toISOString(),
            }
          }),
        },
        isRecapDmsAvailable: false,
        summary: sessionSummary.summary,
      })
    })
  })

  describe('GET /api/sessions/student/:studentId', () => {
    test('returns student session details', async () => {
      const studentId = getUuid()
      const sessionDetails = [buildSessionDetail()]
      mockedSessionService.getStudentSessionDetails.mockResolvedValueOnce(
        sessionDetails
      )

      const response = await sendGet(`/api/sessions/student/${studentId}`)
      expect(response.status).toBe(200)
      expect(
        mockedSessionService.getStudentSessionDetails
      ).toHaveBeenCalledWith(studentId, mockUser.id)
      expect(response.body).toEqual({
        sessionDetails: sessionDetails.map((session) => {
          return {
            ...session,
            createdAt: session.createdAt.toISOString(),
            endedAt: session.endedAt?.toISOString(),
          }
        }),
      })
    })
  })

  describe('POST /api/sessions/:sessionId/meeting', () => {
    test('gets or creates a session meeting', async () => {
      const sessionId = getUuid()
      const result = {
        meeting: { MeetingId: getUuid() },
        attendee: { AttendeeId: getUuid() },
        partnerAttendee: { AttendeeId: getUuid() },
      }
      mockedSessionMeetingService.getOrCreateSessionMeeting.mockResolvedValueOnce(
        result
      )

      const response = await sendPost(`/api/sessions/${sessionId}/meeting`)
      expect(response.status).toBe(200)
      expect(
        mockedSessionMeetingService.getOrCreateSessionMeeting
      ).toHaveBeenCalledWith(sessionId, mockUser.id)
      expect(response.body).toEqual(result)
    })
  })

  describe('PUT /api/sessions/:sessionId/meeting', () => {
    test('ends a session meeting', async () => {
      const sessionId = getUuid()
      mockedSessionMeetingService.endMeeting.mockResolvedValueOnce()

      const response = await sendPut(`/api/sessions/${sessionId}/meeting`)
      expect(response.status).toBe(204)
      expect(mockedSessionMeetingService.endMeeting).toHaveBeenCalledWith(
        sessionId
      )
    })
  })

  describe('POST /api/sessions/:sessionId/meeting/start-transcription', () => {
    test('starts transcription', async () => {
      const sessionId = getUuid()
      mockedSessionMeetingService.startTranscription.mockResolvedValueOnce(true)

      const response = await sendPost(
        `/api/sessions/${sessionId}/meeting/start-transcription`
      )
      expect(response.status).toBe(200)
      expect(
        mockedSessionMeetingService.startTranscription
      ).toHaveBeenCalledWith(sessionId)
      expect(response.body).toEqual({ transcriptionStarted: true })
    })
  })

  describe('POST /api/sessions/:sessionId/meeting/start-recording', () => {
    test('starts recording', async () => {
      const sessionId = getUuid()
      const recordingId = 'recording-id'
      mockedSessionMeetingService.startRecording.mockResolvedValueOnce(
        recordingId
      )

      const response = await sendPost(
        `/api/sessions/${sessionId}/meeting/start-recording`
      )
      expect(response.status).toBe(200)
      expect(mockedSessionMeetingService.startRecording).toHaveBeenCalledWith(
        sessionId
      )
      expect(response.body).toEqual({ recordingId })
    })
  })

  describe('GET /api/sessions/:sessionId/images/:fileName', () => {
    test('redirects to image url when found', async () => {
      const sessionId = getUuid()
      const imageUrl = 'https://example.com/image.png'
      mockedSessionService.getDocEditorSessionImageUrl.mockReturnValue(imageUrl)

      const response = await sendGet(
        `/api/sessions/${sessionId}/images/test.png`
      )

      expect(response.status).toBe(302)
      expect(
        mockedSessionService.getDocEditorSessionImageUrl
      ).toHaveBeenCalledWith(sessionId, 'test.png')
      expect(response.header.location).toBe(imageUrl)
      expect(response.header['cache-control']).toBe('private, max-age=300')
    })

    test('returns 404 when image url is not found', async () => {
      const sessionId = getUuid()
      mockedSessionService.getDocEditorSessionImageUrl.mockReturnValue('')

      const response = await sendGet(
        `/api/sessions/${sessionId}/images/test.png`
      )
      expect(response.status).toBe(404)
    })
  })
})
