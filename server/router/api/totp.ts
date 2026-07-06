import { Router } from 'express'
import { asString } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import * as MultiFactorAuthService from '../../services/MultiFactorAuthService'
import { resError } from '../res-error'
import { resSuccess } from '../res-success'
import { authPassport } from '../../utils/auth-utils'

export function routeTotp(apiRouter: Router): void {
  const router = Router()

  router.post('/enroll', async function (req, res) {
    try {
      const user = extractUser(req)
      const qrUrl = await MultiFactorAuthService.generateTotpSecret(user)
      resSuccess(res, { qrUrl })
    } catch (error) {
      resError(res, error)
    }
  })

  router.post('/verify', async function (req, res) {
    try {
      const user = extractUser(req)
      const token = asString(req.body.token)
      const result = await MultiFactorAuthService.verifyTotpToken(
        user.id,
        token
      )
      if (result) {
        req.session.totpVerifiedAt = Date.now()
      }
      resSuccess(res, { verified: result })
    } catch (error) {
      resError(res, error)
    }
  })

  apiRouter.use('/totp', authPassport.isAdminOnly, router)
}
