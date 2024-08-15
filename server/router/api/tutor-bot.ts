import { Express, Router } from 'express'
import * as TutorBotService from '../../services/TutorBotService'
export function routeTutorBot(app: Express, router: Router): void {
  router.post('/message', async function(req, res) {
    const result = await TutorBotService.sendMessageAndGetUpdatedTranscript(
      req.body.sessionId,
      req.body.message
    )
    return res.json({ transcript: result }).status(200)
  })

  app.use('/api/tutor-bot', router)
}
