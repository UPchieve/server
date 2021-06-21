import { Router } from 'express'
import { KeyNotFoundError } from '../../cache'
import * as SessionService from '../../services/SessionService'
import { resError } from '../res-error'

export function routes(router: Router) {
  router.get('/stats/volunteer/heatmap', async function(req, res) {
    try {
      const { user } = req
      const heatMap = await SessionService.getWaitTimeHeatMap(user)
      res.json({ heatMap })
    } catch (error) {
      if (error instanceof KeyNotFoundError) return res.sendStatus(404)
      resError(res, error)
    }
  })
}
