import { Router } from 'express'
import * as UserProductFlagsRepo from '../../models/UserProductFlags/queries'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import * as UserProductFlagsService from '../../services/UserProductFlagsService'
import * as IncentiveProgramService from '../../services/IncentiveProgramService'
import { asOptional, asString } from '../../utils/type-utils'

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

  router
    .route('/product-flags/fall-incentive-enrollment/enroll')
    .post(async function(req, res) {
      const user = extractUser(req)
      const proxyEmail = asOptional(asString)(req.body.proxyEmail)
      try {
        const fallIncentiveEnrollmentAt = await UserProductFlagsService.incentiveProgramEnrollmentEnroll(
          user.id,
          proxyEmail
        )
        res.json({ fallIncentiveEnrollmentAt })
      } catch (err) {
        resError(res, err)
      }
    })

  router
    .route('/product-flags/fall-incentive-enrollment/denied')
    .post(async function(req, res) {
      const user = extractUser(req)
      try {
        await IncentiveProgramService.queueIncentiveInvitedToEnrollReminderJob(
          user.id
        )
        res.sendStatus(200)
      } catch (err) {
        resError(res, err)
      }
    })
}
