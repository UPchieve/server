import express from 'express'
import { getUserIdByReferralCode } from '../../models/User/queries'
import { asString } from '../../utils/type-utils'
import { resError } from '../res-error'

export default function referralRouter(app: express.Express): void {
  const router = express.Router()

  router.get('/:referralCode', async function(req, res, next) {
    try {
      const referralCode = asString(req.params.referralCode)
      const user = await getUserIdByReferralCode(referralCode)
      res.json({ user })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public/referral', router)
}
