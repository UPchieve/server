import * as ModerationCtrl from '../../controllers/ModerationCtrl'
import { resError } from '../res-error'
import { Router } from 'express'
import { asString } from '../../utils/type-utils'

export function routeModeration(router: Router): void {
  router.route('/moderate/message').post((req, res) => {
    try {
      const isClean = ModerationCtrl.moderateMessage(asString(req.body.content))
      res.json({ isClean })
    } catch (error) {
      resError(res, error)
    }
  })
}
