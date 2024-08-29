import { Router } from 'express'
import * as TutorBotService from '../../services/TutorBotService'
import { resError } from '../res-error'
export function routeTutorBot(router: Router) {
  router.post('/tutor-bot/message', async function(req, res) {
    try {
      const result = await TutorBotService.sendMessageAndGetUpdatedTranscript(
        req.body.userId,
        req.body.sessionId,
        req.body.message
      )
      return res
        .json({ message: result.message, status: result.status })
        .status(200)
    } catch (err) {
      resError(res, err)
    }
  })
}
