import { Router } from 'express'
import { Server } from 'socket.io'
import SocketService from '../../services/SocketService'
import * as SessionService from '../../services/SessionService'
import { recordIpAddress } from '../../middleware/record-ip-address'
import { authPassport } from '../../utils/auth-utils'
import { InputError, LookupError } from '../../utils/type-utils'
import { resError } from '../res-error'
import { ReportSessionError } from '../../utils/session-utils'

// @todo: figure out a better way to expose SocketService
export function routes(router: Router, io: Server) {
  // io is now passed to this module so that API events can trigger socket events as needed
  const socketService = new SocketService(io)

  // todo: fix "no overload matches this call" error on recordIpAddress
  // @ts-expect-error
  router.route('/session/new').post(recordIpAddress, async function(req, res) {
    try {
      const sessionId = await SessionService.startSession({
        ...req.body,
        user: req.user,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      })
      res.json({ sessionId })
    } catch (error) {
      resError(res, error)
    }
  })

  router.route('/session/end').post(async function(req, res) {
    try {
      if (!Object.prototype.hasOwnProperty.call(req.body, 'sessionId'))
        throw new InputError('Missing sessionId body string')
      await SessionService.finishSession(
        {
          ...req.body,
          user: req.user,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        },
        socketService
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
      const sessionId = await SessionService.checkSession(req.body.sessionId)
      res.json({
        sessionId
      })
    } catch (error) {
      resError(res, error)
    }
  })

  // @todo: switch to a GET request
  router.route('/session/current').post(async function(req, res) {
    try {
      const currentSession = await SessionService.currentSession(req.user)
      if (!currentSession) {
        resError(res, new LookupError('No current session'), 404)
      } else {
        res.json({
          sessionId: currentSession._id,
          data: currentSession
        })
      }
    } catch (error) {
      resError(res, error)
    }
  })

  router.route('/session/latest').post(async function(req, res) {
    try {
      if (!Object.prototype.hasOwnProperty.call(req.body, 'userId'))
        throw new InputError('Missing userId body string')
      const latestSession = await SessionService.studentLatestSession(
        req.body.userId
      )

      res.json({
        sessionId: latestSession._id,
        data: latestSession
      })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/session/review', authPassport.isAdmin, async function(req, res) {
    try {
      const { sessions, isLastPage } = await SessionService.sessionsToReview(
        req.query
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
        sessionId
      })
      res.sendStatus(200)
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/session/:sessionId/photo-url', async function(req, res) {
    try {
      const { sessionId } = req.params
      const { uploadUrl, imageUrl } = await SessionService.getImageAndUploadUrl(
        sessionId
      )
      res.json({ uploadUrl, imageUrl })
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/session/:sessionId/report', async function(req, res) {
    try {
      const { sessionId } = req.params
      const { user } = req
      await SessionService.reportSession({
        sessionId,
        user,
        ...req.body
      })
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
      const { user, ip } = req
      const userAgent = req.get('User-Agent')
      await SessionService.sessionTimedOut({
        sessionId,
        timeout,
        user,
        ip,
        userAgent
      })
      res.sendStatus(200)
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/sessions', authPassport.isAdmin, async function(req, res) {
    try {
      const {
        sessions,
        isLastPage
      } = await SessionService.adminFilteredSessions(req.query)
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
      const session = await SessionService.adminSessionView(sessionId)
      res.json({ session })
    } catch (error) {
      resError(res, error)
    }
  })

  router.get('/session/:sessionId', async function(req, res) {
    try {
      const { sessionId } = req.params
      const [session] = await SessionService.publicSession(sessionId)
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
          sessionId
        )
        res.json({ notifications })
      } catch (error) {
        resError(res, error)
      }
    }
  )
}
