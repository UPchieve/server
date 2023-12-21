import { Router } from 'express'
import { Server } from 'socket.io'
import SocketService from '../../services/SocketService'
import * as SessionService from '../../services/SessionService'
import { authPassport } from '../../utils/auth-utils'
import { InputError, LookupError } from '../../models/Errors'
import { resError } from '../res-error'
import { ReportSessionError } from '../../utils/session-utils'
import { extractUser } from '../extract-user'
import { asString, asUlid } from '../../utils/type-utils'

// TODO: figure out a better way to expose SocketService
export function routeSession(router: Router, io: Server) {
  // io is now passed to this module so that API events can trigger socket events as needed
  const socketService = SocketService.getInstance(io)

  router.route('/session/new').post(async function(req, res) {
    try {
      const user = extractUser(req)
      const sessionId = await SessionService.startSession(user, {
        ...req.body,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      } as unknown)
      res.json({ sessionId })
    } catch (error) {
      resError(res, error)
    }
  })

  router.route('/session/end').post(async function(req, res) {
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

  router.route('/session/check').post(async function(req, res) {
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
  router.route('/session/current').post(async function(req, res) {
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

  router.route('/session/recap-dms').post(async function(req, res) {
    try {
      const sessionId = asString(req.body.sessionId)
      const currentSession = await SessionService.getRecapSessionForDms(
        sessionId
      )
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

  router.route('/session/latest').post(async function(req, res) {
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

  router.get('/session/review', authPassport.isAdmin, async function(req, res) {
    try {
      const { sessions, isLastPage } = await SessionService.sessionsToReview(
        req.query.page as unknown,
        { studentFirstName: req.query.studentFirstName as string }
      )
      res.json({ sessions, isLastPage })
    } catch (error) {
      resError(res, error)
    }
  })

  router.put('/session/:sessionId', authPassport.isAdmin, async function(
    req,
    res
  ) {
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
  })

  router.get('/session/:sessionId/photo-url', async function(req, res) {
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

  router.post('/session/:sessionId/report', async function(req, res) {
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

  router.post('/session/:sessionId/timed-out', async function(req, res) {
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

  router.get('/sessions', authPassport.isAdmin, async function(req, res) {
    try {
      const {
        sessions,
        isLastPage,
      } = await SessionService.adminFilteredSessions(req.query as unknown)
      res.json({ sessions, isLastPage })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/session/:sessionId/admin', authPassport.isAdmin, async function(
    req,
    res
  ) {
    try {
      const { sessionId } = req.params
      const session = await SessionService.adminSessionView(
        sessionId as unknown
      )
      res.json({ session })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/session/:sessionId', async function(req, res) {
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
    async function(req, res) {
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

  router.get('/sessions/history', async function(req, res) {
    try {
      const user = extractUser(req)
      const {
        pastSessions,
        page,
        isLastPage,
      } = await SessionService.getSessionHistory(
        user.id,
        asString(req.query.page)
      )

      res.json({ page, isLastPage, pastSessions })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/sessions/history/total', async function(req, res) {
    try {
      const user = extractUser(req)
      const total = await SessionService.getTotalSessionHistory(user.id)

      res.json({ total })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/sessions/history/:sessionId/eligible', async function(
    req,
    res
  ) {
    try {
      const { sessionId } = req.params
      const { studentId } = req.body
      const isEligible = await SessionService.isEligibleForSessionRecap(
        sessionId,
        asString(studentId)
      )
      res.json({ isEligible })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/sessions/:sessionId/recap', async function(req, res) {
    try {
      const user = extractUser(req)
      const { sessionId } = req.params
      const session = await SessionService.getSessionRecap(
        asUlid(sessionId),
        user.id
      )

      const isRecapDmsAvailable = await SessionService.isRecapDmsAvailable(
        session.id,
        session.studentId,
        session.volunteerId,
        user.isVolunteer
      )
      res.json({ session, isRecapDmsAvailable })
    } catch (err) {
      resError(res, err)
    }
  })
}
