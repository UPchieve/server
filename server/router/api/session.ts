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
import {
  asCamelCaseString,
  asDate,
  asFactory,
  asNumber,
  asOptional,
  asString,
  asUlid,
} from '../../utils/type-utils'
import * as UserRolesService from '../../services/UserRolesService'
import multer from 'multer'
import {
  CreateSessionAudioPayload,
  UpdateSessionAudioPayload,
} from '../../models/SessionAudio'
import * as SessionMeetingService from '../../services/SessionMeetingService'
import * as AwsChimeService from '../../services/AwsChimeService'

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
      sessionData.subject = asCamelCaseString(sessionData.subject)
      sessionData.topic = asCamelCaseString(sessionData.topic)
      const sessionId = await SessionService.startSession(user, sessionData)
      res.json({ sessionId })
    } catch (error) {
      resError(res, error)
    }
  })

  router.route('/session/end').post(async function (req, res) {
    try {
      if (!Object.prototype.hasOwnProperty.call(req.body, 'sessionId'))
        throw new InputError('Missing sessionId body string')
      const user = extractUser(req)
      await SessionService.endSession(
        asUlid(req.body.sessionId),
        user.id,
        false,
        socketService,
        {
          userAgent: req.get('User-Agent') || '',
          ip: req.ip,
        }
      )
      res.json({ sessionId: req.body.sessionId })
    } catch (error) {
      resError(res, error)
    }
  })

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
          sessionId: currentSession._id,
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
          sessionId: currentSession._id,
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
      const latestSession = await SessionService.studentLatestSession(user.id)

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

  router.post(
    '/session/:sessionId/voice-message',
    upload.single('message'),
    async function (req, res) {
      try {
        // 1. save to database
        // 2. upload to storage
        // 3. return voiceMessageId
        const { senderId, sessionId, transcript } = req.body
        const message = req.file
        if (typeof message === 'undefined') {
          throw 'No voice message file uploaded'
        }
        const voiceMessageId = await SessionService.saveVoiceMessage({
          senderId,
          sessionId,
          message,
          transcript,
        })
        res.json({ voiceMessageId })
      } catch (error) {
        resError(res, error)
      }
    }
  )

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

      const { pastSessions, page, isLastPage, totalCount } =
        await SessionService.getSessionHistory(
          user.id,
          asNumber(req.query.page),
          req.query.limit ? asNumber(req.query.limit) : undefined,
          filter
        )

      res.json({ page, isLastPage, pastSessions, totalCount })
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
      const session = await SessionService.getSessionRecap(
        asUlid(sessionId),
        user.id,
        isTeacher
      )
      const isSessionVolunteer = session.volunteerId === user.id

      const isRecapDmsAvailable = await SessionService.isRecapDmsAvailable(
        session.id,
        session.studentId,
        session.volunteerId,
        isSessionVolunteer
      )
      res.json({ session, isRecapDmsAvailable })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/sessions/student/:studentId', async function (req, res) {
    try {
      const studentId = req.params.studentId as string
      const sessionDetails =
        await SessionService.getStudentSessionDetails(studentId)
      res.json({ sessionDetails })
    } catch (err) {
      resError(res, err)
    }
  })

  const createSessionAudioRequestValidator =
    asFactory<CreateSessionAudioPayload>({
      volunteerJoinedAt: asOptional(asDate),
      studentJoinedAt: asOptional(asDate),
      resourceUri: asOptional(asString),
    })
  router.post('/sessions/:sessionId/call', async function (req, res) {
    try {
      const sessionId = req.params.sessionId as string
      const result = await SessionService.getOrCreateSessionAudio(
        sessionId,
        createSessionAudioRequestValidator(req.body)
      )
      return res.json({ sessionAudio: result })
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

  const updateSessionAudioRequestValidator =
    asFactory<UpdateSessionAudioPayload>({
      volunteerJoinedAt: asOptional(asDate),
      studentJoinedAt: asOptional(asDate),
      resourceUri: asOptional(asString),
    })
  router.put('/sessions/:sessionId/call', async function (req, res) {
    try {
      const sessionId = req.params.sessionId as string
      const updated = await SessionService.updateSessionAudio(
        sessionId,
        updateSessionAudioRequestValidator(req.body)
      )
      return res.json({ sessionAudio: updated })
    } catch (err) {
      resError(res, err)
    }
  })
}
