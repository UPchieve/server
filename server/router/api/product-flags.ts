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
