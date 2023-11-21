import { Router } from 'express'
import newrelic from 'newrelic'
import * as VerificationService from '../../services/VerificationService'
import logger from '../../logger'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'
import { TwilioError } from '../../models/Errors'

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
      let message: string
      let status: number | undefined
      const defaultErrorMessage =
        'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.'

      if (err instanceof TwilioError) {
        status = err.status
        if (status === 429) {
          message =
            "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one."
        } else if (status === 404) {
          // Twilio verification resource was not found
          message = defaultErrorMessage
          status = 500
        } else {
          message = defaultErrorMessage
          status = 500
        }
        err.message = message

        // custom logging for NR alerts
        logger.error(
          { 'error.name': 'twilio verification', error: err },
          (err as TwilioError).message
        )
      }

      resError(res, err, status)
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

      let defaultStatus = 500
      let defaultErrorMessage =
        'Please double-check your verification code. If the problem persists, please contact the UPchieve team at support@upchieve.org for help.'

      if (err instanceof TwilioError && err.status === 404) {
        err.status = 400
        err.message =
          'The code has expired. Please request a new verification code and try again.'
        resError(res, err, err.status)
      } else {
        resError(res, new Error(defaultErrorMessage), defaultStatus)
      }
    }
  })
}
