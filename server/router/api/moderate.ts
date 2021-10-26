import * as ModerationCtrl from '../../controllers/ModerationCtrl'
import { resError } from '../res-error'
import { Router } from 'express'

export function routeModeration(router: Router): void {
  router.route('/moderate/message').post((req, res, next) => {
    try {
      // TODO: duck type validators
      const isClean = ModerationCtrl.moderateMessage(req.body)
      res.json({ isClean })
    } catch (error) {
      resError(res, error)
    }
  })
}
