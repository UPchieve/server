import { Router, Response } from 'express'
import * as SessionService from '../../services/SessionService'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'
import {
  VolunteerStatsResponse,
  WaitTimeHeatMapResponse,
} from '../../contracts/stats'
import * as RealtimeStatsService from '../../services/RealtimeStatsService'

export function routes(router: Router) {
  router.get(
    '/stats/volunteer/heatmap',
    async function (req, res: Response<WaitTimeHeatMapResponse>) {
      try {
        const user = extractUser(req)
        const heatMap = await SessionService.getWaitTimeHeatMap(user)
        res.json({ heatMap })
      } catch (error) {
        resError(res, error as Error)
      }
    }
  )

  router.get(
    '/stats/volunteer',
    async function (req, res: Response<VolunteerStatsResponse>) {
      try {
        const stats = await RealtimeStatsService.getVolunteerFacingStats()
        res.json({ ...stats })
      } catch (error) {
        resError(res, error)
      }
    }
  )
}
