import { Router } from 'express'
import { LoadedRequest } from '../app'

import * as VerificationService from '../../services/VerificationService'
import logger from '../../logger'
import { resError } from '../res-error'

export interface TwilioError extends Error {
  message: string
  status: number
}

export function routeVerify(router: Router) {
  router.route('/verify/send').post(async function(req: LoadedRequest, res) {
    const payload = {
      userId: req.user._id.toString(),
      firstName: req.user.firstname,
      ...req.body
    } as unknown

    try {
      await VerificationService.initiateVerification(payload)
      res.sendStatus(200)
    } catch (err) {
      const status = err.status
      let message: string
      if (status === 429) {
        message =
          "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one."
      } else if (status === 404) {
        // Twilio verification resoure was not found
        message =
          'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.'
      } else {
        message = err.message
      }
      // custom logging for NR alerts
      logger.error(
        { 'error.name': 'twilio verification', error: err },
        err.message
      )
      resError(res, new Error(message), status)
    }
  })

  router.route('/verify/confirm').post(async function(req: LoadedRequest, res) {
    const payload = {
      userId: req.user._id.toString(),
      ...req.body
    } as unknown

    try {
      const isVerified = await VerificationService.confirmVerification(payload)
      res.json({ success: isVerified })
    } catch (err) {
      // custom logging for NR alerts
      logger.error(
        { 'error.name': 'twilio verification', error: err },
        err.message
      )
      resError(res, err)
    }
  })
}
