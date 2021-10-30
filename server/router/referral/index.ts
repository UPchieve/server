import express from 'express'
import { getUserByReferralCode } from '../../models/User/queries'
import { asString } from '../../utils/type-utils'
import { resError } from '../res-error'

export function routes(app: express.Express): void {
  const router = express.Router()

  router.get('/:referralCode', async function(req, res) {
    try {
      const referralCode = asString(req.params.referralCode)
      // TODO: is it ok to return no user if code isn't used?
      const user = await getUserByReferralCode(referralCode)
      res.json({ user })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public/referral', router)
}
