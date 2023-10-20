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
  const socketService = new SocketService(io)

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
      // TODO: should not return an error is session is missing
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
      if (!Object.prototype.hasOwnProperty.call(req.body, 'userId'))
        throw new InputError('Missing userId body string')
      const latestSession = await SessionService.studentLatestSession(
        req.body.userId as unknown
      )

      if (!latestSession) throw new Error('could not find latest session')

      res.json({
        sessionId: latestSession._id,
        data: latestSession,
      })
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
      // Students are only allowed to send messages to tutors who have the feature flag as true
      // TODO: double check my logic here.....
      // TODO: but it has to be for that particular session,no?

      /**
       *
       * Scenario:
       * Tutor has the feature flag as true
       * Tutor doesn't send any messages to student
       * Student sees that they can messagae coach
       *
       *
       * Solution:
       * - Check if any messages were sent after the session ended from the volunteer?
       * - Assume that they are leaving resources, then allow the student to then
       *   send messagaes for this particular session
       *
       * TODO: Document this behavior --- Edge case?
       * - We're going to assume that a message sent after the tutor who has the feature flag as true
       *   as being a resource, which means we will allow students to message a coach.
       *   Example: A coach may be saying "bye" after they get the chatbot message. A student will get
       *   notified of that
       *
       * - Volunteers can still go back to the session in session history and respond to a tutor if they want.. document this behavior:
       *  Basically, if a volunteer has the flag as true, they can go to session history (if they didn't respond to the student) and then send them a message, this will open teh dialogue for student and coach
       * A student will see that they cannot chat, but a tutor will see that they can type a message to the student, initiating the conversation still. or do we ONLY want to lock it out during the session chat?
       *
       *
       *
       *
       *
       *
       *
       *
       */
      const isRecapDmsAvailabile = await SessionService.isRecapDmsAvailabile(
        session.id,
        session.studentId,
        session.volunteerId
      )
      res.json({ session, isRecapDmsAvailabile })
    } catch (err) {
      resError(res, err)
    }
  })
}
