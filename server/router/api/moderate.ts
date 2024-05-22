import * as ModerationService from '../../services/ModerationService'
import { resError } from '../res-error'
import { Router } from 'express'
import { asString } from '../../utils/type-utils'

export function routeModeration(router: Router): void {
  router.route('/moderate/message').post(async (req, res) => {
    try {
      const args = req.body?.content
        ? {
            // Support old versions of high-line and midtown
            message: asString(req.body.content),
            senderId: asString(req.user?.id),
          }
        : {
            message: asString(req.body.message),
            senderId: asString(req.user?.id),
            sessionId: req.body.sessionId,
          }
      const isClean = await ModerationService.moderateMessage(args)
      res.json({ isClean })
    } catch (error) {
      resError(res, error)
    }
  })
}
