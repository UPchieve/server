import { Router } from 'express'
import * as TutorBotService from '../../services/TutorBotService'
import { resError } from '../res-error'
export function routeTutorBot(router: Router) {
  router.get('/tutor-bot/conversations/:conversationId', async function(
    req,
    res
  ) {
    try {
      const botResponse = await TutorBotService.getTranscriptForConversation(
        req.params.conversationId
      )
      return res.json(botResponse).status(200)
    } catch (err) {
      resError(res, err)
    }
  })
  router.post(
    '/tutor-bot/conversations/:conversationId/message',
    async function(req, res) {
      try {
        const userId = req.user?.id
        if (userId) {
          const botResponse = await TutorBotService.addMessageToConversation({
            userId,
            conversationId: req.params.conversationId,
            message: req.body.message,
            senderUserType: req.body.senderUserType,
          })
          return res.json(botResponse).status(200)
        } else {
          throw 'No current user'
        }
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.patch('/tutor-bot/conversations/:conversationId', async function(
    req,
    res
  ) {
    try {
      await TutorBotService.updateTutorBotConversationSessionId(
        req.params.conversationId,
        req.body.sessionId
      )
      return res.sendStatus(204)
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/tutor-bot/conversations', async function(req, res) {
    try {
      const userId = req.user?.id
      if (userId) {
        const sessionId = req.body.hasOwnProperty('sessionId')
          ? req.body.sessionId
          : null
        const conversation = await TutorBotService.createTutorBotConversation({
          userId,
          message: req.body.message,
          senderUserType: req.body.senderUserType,
          subjectId: req.body.subjectId,
          sessionId,
        })
        return res.json(conversation)
      } else {
        throw 'No current user'
      }
    } catch (err) {
      resError(res, err)
    }
  })

  // TODO should probably just be a get to /tutor-bot/conversations
  router.get('/tutor-bot/conversations/users/:userId', async function(
    req,
    res
  ) {
    try {
      const convos = await TutorBotService.getAllConversationsForUser(
        req.params.userId
      )
      return res.json(convos)
    } catch (err) {
      resError(res, err)
    }
  })
}
