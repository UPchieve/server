import { Router } from 'express'
import newrelic from 'newrelic'
import * as VerificationService from '../../services/VerificationService'
import logger from '../../logger'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'

export interface TwilioError extends Error {
  message: string
  status: number
}

export function routeVerify(router: Router) {
  router.route('/verify/send').post(async function(req, res) {
    const user = extractUser(req)
    const payload = {
      userId: user.id,
      firstName: user.firstName,
      ...req.body,
    }

    try {
      await VerificationService.initiateVerification(payload as unknown)
      res.sendStatus(200)
    } catch (err) {
      const status = (err as TwilioError).status
      let message: string
      if (status === 429) {
        message =
          "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one."
      } else if (status === 404) {
        // Twilio verification resoure was not found
        message =
          'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.'
      } else {
        message = (err as TwilioError).message
      }
      // custom logging for NR alerts
      logger.error(
        { 'error.name': 'twilio verification', error: err },
        (err as TwilioError).message
      )
      resError(res, new Error(message), status)
    }
  })

  router.route('/verify/confirm').post(async function(req, res) {
    const user = extractUser(req)
    const payload = {
      userId: user.id,
      ...req.body,
    } as unknown

    newrelic.addCustomAttribute(
      'role',
      user.isVolunteer ? 'volunteer' : 'student'
    )

    try {
      const isVerified = await VerificationService.confirmVerification(payload)
      res.json({ success: isVerified })
    } catch (err) {
      // custom logging for NR alerts
      logger.error(
        { 'error.name': 'twilio verification', error: err },
        (err as Error).message
      )
      resError(res, err)
    }
  })
}
