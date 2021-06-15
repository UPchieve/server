import { Router } from 'express'
import * as SessionService from '../../services/SessionService'
import { resError } from '../res-error'

export function routes(router: Router) {
  router.get('/stats/volunteer/heatmap', async function(req, res) {
    try {
      const { user } = req
      const heatMap = await SessionService.getWaitTimeHeatMap(user)
      res.json({ heatMap })
    } catch (error) {
      resError(res, error)
    }
  })
}
