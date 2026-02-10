import { Router } from 'express'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'
import * as LiveMediaService from '../../services/LiveMediaService'
import { asString } from '../../utils/type-utils'

export function routeLiveMedia(apiRouter: Router): void {
  const router = Router()

  router.post('/token', async (req, res) => {
    try {
      const user = extractUser(req)
      const sessionId = asString(req.body.sessionId)
      const result = await LiveMediaService.getRoomToken(user, sessionId)
      if (result) {
        res.json(result)
      } else {
        resError(res, undefined, 403)
      }
    } catch (err) {
      resError(res, err)
    }
  })

  apiRouter.use('/live-media', router)
}
