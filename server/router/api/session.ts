import { Router } from 'express'
import SocketService from '../../services/SocketService'
import * as TutorBotService from '../../services/TutorBotService'
import * as AssignmentsService from '../../services/AssignmentsService'
import * as SessionService from '../../services/SessionService'
import { authPassport } from '../../utils/auth-utils'
import { InputError, LookupError } from '../../models/Errors'
import { resError } from '../res-error'
import {
  asStartSessionData,
  ReportSessionError,
} from '../../utils/session-utils'
import { extractUser } from '../extract-user'
import { asNumber, asString, asUlid } from '../../utils/type-utils'
import multer from 'multer'
import * as SessionMeetingService from '../../services/SessionMeetingService'
import {
  asSaveUserSurveyAndSubmissions,
  classifyFeedback,
  getStudentFeedbackForSession,
} from '../../services/SurveyService'
import {
  PrimaryUserRole,
  SessionUserRole,
} from '../../services/UserRolesService'
import { getDocEditorSessionImageUrl } from '../../services/SessionService'

export function routeSession(router: Router) {
  // io is now passed to this module so that API events can trigger socket events as needed
  const socketService = SocketService.getInstance()
  const upload = multer()

  router.route('/session/new').post(async function (req, res) {
    try {
      const user = extractUser(req)
      const sessionData = asStartSessionData({
        ...req.body,
        subject: req.body.sessionSubTopic,
        topic: req.body.sessionType,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      })
      const presessionSurvey = req.body.presessionSurvey
        ? asSaveUserSurveyAndSubmissions(req.body.presessionSurvey)
        : undefined
      const session = await SessionService.startSession(user, {
        ...sessionData,
        presessionSurvey,
      })
      const isZwibserveSession = await SessionService.isZwibserveSession(
        session.id
      )
      // For legacy (mobile), we still need to just return the sessionId.
      res.json({ sessionId: session.id, session, isZwibserveSession })
    } catch (error) {
      resError(res, error)
    }
  })

  router.route('/session/join').post(async function (req, res) {
    try {
      const user = extractUser(req)
      const sessionId = asUlid(req.body.sessionId)
      const joinedFrom = asString(req.body.joinedFrom)
      const session = await SessionService.joinSession(user, sessionId, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        joinedFrom,
      })
      const isZwibserveSession = await SessionService.isZwibserveSession(
        session.id
      )
      res.json({ session, isZwibserveSession })
    } catch (error) {
      resError(res, error)
    }
  })

  router.route('/session/end').post(async function (req, res) {
    try {
      if (!Object.prototype.hasOwnProperty.call(req.body, 'sessionId'))
        throw new InputError('Missing sessionId body string')
      const user = extractUser(req)
      const endedSession = await SessionService.endSession(
        asUlid(req.body.sessionId),
        user.id,
        false,
        socketService,
        {
          userAgent: req.get('User-Agent') || '',
          ip: req.ip,
        }
      )
      res.json({ sessionId: req.body.sessionId, session: endedSession })
    } catch (error) {
      resError(res, error)
    }
  })

  // TODO: Remove once no longer have legacy mobile app.
  router.route('/session/check').post(async function (req, res) {
    try {
      if (!Object.prototype.hasOwnProperty.call(req.body, 'sessionId'))
        throw new InputError('Missing sessionId body string')
      const sessionId = await SessionService.checkSession(
        req.body.sessionId as unknown
      )
      res.json({
        sessionId,
      })
    } catch (error) {
      resError(res, error)
    }
  })

  // TODO: switch to a GET request
  router.route('/session/current').post(async function (req, res) {
    try {
      const user = extractUser(req)
      const currentSession = await SessionService.currentSession(user.id)
      if (!currentSession) {
        res.json(null)
      } else {
        res.json({
          sessionId: currentSession.id,
          data: currentSession,
        })
      }
    } catch (error) {
      resError(res, error)
    }
  })

  router.route('/session/recap-dms').post(async function (req, res) {
    try {
      const sessionId = asString(req.body.sessionId)
      const currentSession =
        await SessionService.getRecapSessionForDms(sessionId)
      if (!currentSession) {
        resError(res, new LookupError('No current session'), 404)
      } else {
        res.json({
          sessionId: currentSession.id,
          data: currentSession,
        })
      }
    } catch (error) {
      resError(res, error)
    }
  })

  router.route('/session/latest').post(async function (req, res) {
    try {
      const user = extractUser(req)
      const role = user.roleContext.activeRole
      if (
        role !== ('volunteer' as PrimaryUserRole) &&
        role !== ('student' as PrimaryUserRole)
      ) {
        throw new Error('Cannot get latest session for teacher-type user')
      }
      const latestSession = await SessionService.getLatestSession(
        user.id,
        role as SessionUserRole
      )

      if (!latestSession) {
        res.json(null)
      } else {
        res.json({
          sessionId: latestSession.id,
          data: latestSession,
        })
      }
    } catch (error) {
      resError(res, error)
    }
  })

  router.get(
    '/session/review',
    authPassport.isAdmin,
    async function (req, res) {
      try {
        const { sessions, isLastPage } = await SessionService.sessionsToReview(
          req.query.page as unknown,
          { studentFirstName: req.query.studentFirstName as string }
        )
        res.json({ sessions, isLastPage })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.put(
    '/session/:sessionId',
    authPassport.isAdmin,
    async function (req, res) {
      try {
        const { sessionId } = req.params
        await SessionService.reviewSession({
          ...req.body,
          sessionId,
        } as unknown)
        res.sendStatus(200)
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.get('/session/:sessionId/photo-url', async function (req, res) {
    try {
      const { sessionId } = req.params
      const { uploadUrl, imageUrl } = await SessionService.getImageAndUploadUrl(
        sessionId as unknown
      )
      res.json({ uploadUrl, imageUrl })
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/session/:sessionId/report', async function (req, res) {
    try {
      const { sessionId } = req.params
      const user = extractUser(req)
      await SessionService.reportSession(user, {
        sessionId,
        ...req.body,
      } as unknown)
      res.json({ msg: 'Success' })
    } catch (error) {
      if (error instanceof ReportSessionError) return resError(res, error, 422)
      resError(res, error)
    }
  })

  router.post('/session/:sessionId/timed-out', async function (req, res) {
    try {
      const { sessionId } = req.params
      const { timeout } = req.body
      const { ip } = req
      const user = extractUser(req)
      const userAgent = req.get('User-Agent')
      await SessionService.sessionTimedOut(user, {
        sessionId,
        timeout,
        ip,
        userAgent,
      } as unknown)
      res.sendStatus(200)
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/sessions', authPassport.isAdmin, async function (req, res) {
    try {
      const { sessions, isLastPage } =
        await SessionService.adminFilteredSessions(req.query as unknown)
      res.json({ sessions, isLastPage })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get(
    '/session/:sessionId/admin',
    authPassport.isAdmin,
    async function (req, res) {
      try {
        const { sessionId } = req.params
        const session = await SessionService.adminSessionView(
          sessionId as unknown
        )
        res.json({ session })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.put(
    '/session/:sessionId/tutor-bot-conversation',
    async function (req, res) {
      try {
        const botResponse =
          await TutorBotService.getOrCreateConversationBySessionId({
            sessionId: req.params.sessionId,
          })
        return res.json(botResponse).status(200)
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get('/session/:sessionId', async function (req, res) {
    try {
      const { sessionId } = req.params
      // TODO: could be undefined
      const session = await SessionService.publicSession(sessionId as unknown)
      res.json({ session })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get(
    '/session/:sessionId/notifications',
    authPassport.isAdmin,
    async function (req, res) {
      try {
        const { sessionId } = req.params
        const notifications = await SessionService.getSessionNotifications(
          sessionId as unknown
        )
        res.json({ notifications })
      } catch (error) {
        resError(res, error)
      }
    }
  )

  router.get('/session/:sessionId/assignment', async function (req, res) {
    try {
      const { sessionId } = req.params
      const assignment =
        await AssignmentsService.getStudentAssignmentForSession(sessionId)
      res.json({ assignment })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/sessions/history', async function (req, res) {
    try {
      const user = extractUser(req)
      const filter = SessionService.asSessionHistoryFilter(req.query)

      const pastSessions = await SessionService.getSessionHistory(
        user.id,
        filter
      )

      res.json({ pastSessions })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/sessions/history/total', async function (req, res) {
    try {
      const user = extractUser(req)
      const filter = {
        studentId: req.query.studentId
          ? asUlid(req.query.studentId)
          : undefined,
        volunteerId: req.query.volunteerId
          ? asUlid(req.query.volunteerId)
          : undefined,
      }
      const total = await SessionService.getTotalSessionHistory(user.id, filter)

      res.json({ total })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post(
    '/sessions/history/:sessionId/eligible',
    async function (req, res) {
      try {
        const { sessionId } = req.params
        const { studentId, volunteerId } = req.body
        const isEligible = await SessionService.isEligibleForSessionRecap(
          sessionId,
          asString(studentId),
          asString(volunteerId)
        )
        res.json({ isEligible })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get('/sessions/:sessionId/recap', async function (req, res) {
    try {
      const user = extractUser(req)
      const { sessionId } = req.params
      const isTeacher = user.roleContext.isActiveRole('teacher')
      const isVolunteer = user.roleContext.isActiveRole('volunteer')
      const isStudent = user.roleContext.isActiveRole('student')
      const session = await SessionService.getSessionRecap(
        asUlid(sessionId),
        user.id,
        isTeacher
      )
      const studentFeedbackForVolunteer =
        await getStudentFeedbackForSession(sessionId)
      const classifedFeedback = classifyFeedback(studentFeedbackForVolunteer)
      if (isVolunteer && classifedFeedback.isPositive) {
        const { response, ...withoutResponse } = classifedFeedback.feedback
        session.feedbackFromStudent = withoutResponse
      } else if (isStudent && studentFeedbackForVolunteer) {
        const {
          howMuchDidYourCoachPushYouToDoYourBestWorkToday,
          howSupportiveWasYourCoachToday,
        } = studentFeedbackForVolunteer
        session.feedbackFromStudent = {
          howMuchDidYourCoachPushYouToDoYourBestWorkToday,
          howSupportiveWasYourCoachToday,
        }
      }
      const isRecapDmsAvailable = await SessionService.isRecapDmsAvailable(
        session.id,
        user.id
      )
      res.json({ session, isRecapDmsAvailable: isRecapDmsAvailable.eligible })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/sessions/student/:studentId', async function (req, res) {
    try {
      const studentId = req.params.studentId as string
      const user = extractUser(req)
      const sessionDetails = await SessionService.getStudentSessionDetails(
        studentId,
        user.id
      )
      res.json({ sessionDetails })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/sessions/:sessionId/meeting', async function (req, res) {
    try {
      const sessionId = req.params.sessionId
      const userId = extractUser(req).id
      const { meeting, attendee, partnerAttendee } =
        await SessionMeetingService.getOrCreateSessionMeeting(sessionId, userId)
      return res.json({
        meeting,
        attendee,
        partnerAttendee,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.put('/sessions/:sessionId/meeting', async function (req, res) {
    try {
      const sessionId = req.params.sessionId
      await SessionMeetingService.endMeeting(sessionId)
      return res.sendStatus(204)
    } catch (err) {
      resError(res, err)
    }
  })

  router.post(
    '/sessions/:sessionId/meeting/start-transcription',
    async function (req, res) {
      try {
        const sessionId = req.params.sessionId
        const transcriptionStarted =
          await SessionMeetingService.startTranscription(sessionId)
        return res.json({ transcriptionStarted })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.post(
    '/sessions/:sessionId/meeting/start-recording',
    async function (req, res) {
      try {
        const sessionId = req.params.sessionId
        const recordingId =
          await SessionMeetingService.startRecording(sessionId)
        return res.json({ recordingId })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get('/sessions/:sessionId/images/:fileName', async (req, res) => {
    const { sessionId, fileName } = req.params
    const imageUrl = await getDocEditorSessionImageUrl(sessionId, fileName)
    if (!imageUrl) return res.sendStatus(404)
    res.set('Cache-Control', 'private, max-age=300')
    res.redirect(302, imageUrl)
  })
}
