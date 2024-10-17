import { Router, Send } from 'express'
import * as TutorBotService from '../../services/TutorBotService'
import { resError } from '../res-error'
import {
  asFactory,
  asNumber,
  asOptional,
  asString,
} from '../../utils/type-utils'
import { InputError } from '../../models/Errors'

type SenderUserType = 'student' | 'volunteer'

interface MessagePayload {
  userId: string
  conversationId: string
  message: string
  senderUserType: SenderUserType
  subjectName: string
}

interface ConversationPayload {
  userId: string
  message: string
  senderUserType: SenderUserType
  subjectId: number
  sessionId?: string
}

function isSenderUserType(s: unknown): s is SenderUserType {
  return s === 'student' || s === 'volunteer'
}

function asSenderUserType(s: unknown, errMsg = ''): SenderUserType {
  if (isSenderUserType(s)) return s
  throw new InputError(`${errMsg} ${s} must be 'volunteer' or 'student'`)
}

const messageValidator = asFactory<MessagePayload>({
  userId: asString,
  conversationId: asString,
  message: asString,
  senderUserType: asSenderUserType,
  subjectName: asString,
})

const conversationValidator = asFactory<ConversationPayload>({
  userId: asString,
  sessionId: asOptional(asString),
  message: asString,
  senderUserType: asSenderUserType,
  subjectId: asNumber,
})

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
        const data = messageValidator({
          ...req.body,
          ...req.params,
          userId: req.user?.id,
        })
        const botResponse = await TutorBotService.addMessageToConversation(data)
        return res.json(botResponse).status(200)
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
      const data = conversationValidator({
        ...req.body,
        userId: req.user?.id,
      })
      const conversation = await TutorBotService.createTutorBotConversation(
        data
      )
      return res.json(conversation)
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
