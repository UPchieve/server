import { Router } from 'express'
import { KeyNotFoundError } from '../../cache'
import * as SessionService from '../../services/SessionService'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'

export function routes(router: Router) {
  router.get('/stats/volunteer/heatmap', async function(req, res) {
    try {
      const user = extractUser(req)
      const heatMap = await SessionService.getWaitTimeHeatMap(user)
      res.json({ heatMap })
    } catch (error) {
      resError(res, error as Error)
    }
  })
}
