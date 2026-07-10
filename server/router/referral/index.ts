import express, { type Response } from 'express'
import { asString } from '../../utils/type-utils'
import { resError } from '../res-error'
import * as UserService from '../../services/UserService'
import { toUserByReferralCodePublic } from '../../public/users'
import type { UserByReferralCodeResponse } from '../../contracts/users'

export function routes(app: express.Express): void {
  const router = express.Router()

  router.get(
    '/:referralCode',
    async function (req, res: Response<UserByReferralCodeResponse>) {
      try {
        const referralCode = asString(req.params.referralCode)
        const user = await UserService.getUserByReferralCode(referralCode)
        res.json({ user: user ? toUserByReferralCodePublic(user) : undefined })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  app.use('/api-public/referral', router)
}
