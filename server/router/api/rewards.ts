import type { Router, Response } from 'express'
import * as RewardsService from '../../services/RewardsService'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'
import { asNumber } from '../../utils/type-utils'
import { toUserRewardPublic } from '../../public/rewards'
import { UserRewardResponse } from '../../contracts/rewards'

export function routeRewards(router: Router): void {
  router.get(
    '/rewards',
    async function (req, res: Response<UserRewardResponse>) {
      try {
        const user = extractUser(req)
        const offset = asNumber(req.query.offset)
        const userRewardData = await RewardsService.getUserRewards(
          user.id,
          offset
        )
        res.json({
          rewards: userRewardData.rewards.map(toUserRewardPublic),
          total: userRewardData.total,
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )
}
