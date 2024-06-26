import { Router } from 'express'
import newrelic from 'newrelic'
import * as VerificationService from '../../services/VerificationService'
import logger from '../../logger'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'
import { SmsVerificationDisabledError, TwilioError } from '../../models/Errors'
import { authPassport } from '../../utils/auth-utils'
import { Request, Response } from 'express'

const sendVerificationCommon = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    let message =
      'We were unable to send you a verification code. Please contact the UPchieve team at support@upchieve.org for help.'
    let status = 500

    if (err instanceof TwilioError) {
      // custom logging for NR alerts
      logger.error(
        { 'error.name': 'twilio verification', error: err },
        (err as Error).message
      )

      if (err.status === 429) {
        status = 429
        message =
          "You've made too many attempts for a verification code. Please wait 10 minutes before requesting a new one."
      }
    } else if (err instanceof SmsVerificationDisabledError) {
      status = 403
      message = err.message
    }

    resError(res, new Error(message), status)
  }
}
export function routeVerify(router: Router) {
  router
    .route('/verify/send')
    .post(async function(req: Request, res: Response) {
      await sendVerificationCommon(req, res)
    })

  router
    .route('/verify/v2/send')
    .post(authPassport.checkRecaptcha, async function(
      req: Request,
      res: Response
    ) {
      await sendVerificationCommon(req, res)
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

      let status = 500
      let message =
        'Please double-check your verification code. If the problem persists, please contact the UPchieve team at support@upchieve.org for help.'

      if (err instanceof TwilioError && err.status === 404) {
        status = 400
        message =
          'The code has expired. Please request a new verification code and try again.'
      } else if (err instanceof SmsVerificationDisabledError) {
        status = 403
        message = err.message
      }

      resError(res, new Error(message), status)
    }
  })
}
