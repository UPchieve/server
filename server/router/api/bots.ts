import { generateScorecasterAnalysis } from '../../services/BotsService'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import { Router } from 'express'

export function routeBots(router: Router): void {
  router.get('/bots/scorecaster', async function(req, res) {
    try {
      const user = extractUser(req)
      const analysis = await generateScorecasterAnalysis(user.id)
      res.json(analysis)
    } catch (err) {
      resError(res, err)
    }
  })
}
