import { Router } from 'express'
import * as RewardsService from '../../services/RewardsService'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'
import { asNumber } from '../../utils/type-utils'

export function routeRewards(router: Router): void {
  router.get('/rewards', async function (req, res) {
    try {
      const user = extractUser(req)
      const offset = asNumber(req.query.offset)
      const userRewardData = await RewardsService.getUserRewards(
        user.id,
        offset
      )
      res.json(userRewardData)
    } catch (err) {
      resError(res, err)
    }
  })
}
