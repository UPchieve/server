import { Router } from 'express'
import logger from '../../logger'
import * as UserProductFlagsRepo from '../../models/UserProductFlags/queries'
import * as UserProductFlagsService from '../../services/UserProductFlagsService'
import { asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
export interface TwilioError extends Error {
  message: string
  status: number
}
export function routeProductFlags(router: Router) {
  router.route('/product-flags').get(async function(req, res) {
    try {
      const user = extractUser(req)
      const flags = await UserProductFlagsRepo.getPublicUPFByUserId(user.id)
      res.json({ flags })
    } catch (err) {
      resError(res, err)
    }
  })

  // Basically a copy of the `verify/send` route. We will use `verify/send` on the client
  // for this feature once it supports SMS verification, which is currently underway
  router
    .route('/product-flags/fall-incentive-enrollment/initiate')
    .post(async function(req, res) {
      const user = extractUser(req)
      const phone = asString(req.body.phone)

      try {
        await UserProductFlagsService.incentiveProgramEnrollmentVerify(
          user.id,
          user.firstName,
          phone
        )
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

  router
    .route('/product-flags/fall-incentive-enrollment/enroll')
    .post(async function(req, res) {
      const user = extractUser(req)
      try {
        await UserProductFlagsService.incentiveProgramEnrollmentEnroll(user.id)
        res.sendStatus(200)
      } catch (err) {
        resError(res, err)
      }
    })
}
