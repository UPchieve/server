import { Router } from 'express'
import { createPushTokenByUserIdToken } from '../../models/PushToken/queries'
import { authPassport } from '../../utils/auth-utils'
import { asString } from '../../utils/type-utils'

export function routePushToken(router: Router): void {
  router.post('/push-token/save', authPassport.isAuthenticated, async function(
    req,
    res
  ) {
    const { token } = req.body

    try {
      if (req.user) {
        await createPushTokenByUserIdToken(req.user._id, asString(token))
        res.sendStatus(200)
      }
    } catch (error) {
      // TODO: use resError error handling
      res.sendStatus(422)
    }
  })
}
