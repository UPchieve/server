import express from 'express'
import { asString } from '../../utils/type-utils'
import { resError } from '../res-error'
import * as UserService from '../../services/UserService'

export function routes(app: express.Express): void {
  const router = express.Router()

  router.get('/:referralCode', async function(req, res) {
    try {
      const referralCode = asString(req.params.referralCode)
      const user = await UserService.getUserByReferralCode(referralCode)
      res.json({ user })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public/referral', router)
}
