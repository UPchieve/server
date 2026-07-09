import type { Router, Request, Response } from 'express'
import multer from 'multer'
import * as TutorBotService from '../../services/TutorBotService'
import { resError } from '../res-error'
import {
  asFactory,
  asNumber,
  asOptional,
  asString,
} from '../../utils/type-utils'
import { InputError } from '../../models/Errors'
import type {
  ConversationPayload,
  MessagePayload,
  TutorBotAddMessageResponsePublic,
  TutorBotNewConversationPublic,
  TutorBotTranscriptPublic,
} from '../../contracts/tutor-bot'
import type { TutorBotHumanSenderType } from '../../types/tutor-bot'
import {
  toTutorBotTranscriptPublic,
  toTutorBotAddMessageResponsePublic,
  toNewConversationPublic,
} from '../../public/tutor-bot'

function isSenderUserType(s: unknown): s is TutorBotHumanSenderType {
  return s === 'student' || s === 'volunteer'
}

function asSenderUserType(s: unknown, errMsg = ''): TutorBotHumanSenderType {
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
  const upload = multer()

  router.get(
    '/tutor-bot/conversations/:conversationId',
    async function (req, res: Response<TutorBotTranscriptPublic>) {
      try {
        const botResponse = await TutorBotService.getTranscriptForConversation(
          req.params.conversationId
        )
        const transcript = toTutorBotTranscriptPublic(botResponse)
        return res.status(200).json(transcript)
      } catch (err) {
        resError(res, err)
      }
    }
  )
  router.post(
    '/tutor-bot/conversations/:conversationId/message',
    upload.single('snapshot'),
    async function (
      req: Request,
      res: Response<TutorBotAddMessageResponsePublic>
    ) {
      try {
        const data = messageValidator({
          ...req.body,
          ...req.params,
          userId: req.user?.id,
        })
        const snapshotBuffer = req.file?.buffer
        const botResponse = await TutorBotService.addMessageToConversation({
          ...data,
          snapshotBuffer,
        })
        const payload = toTutorBotAddMessageResponsePublic(botResponse)
        return res.status(200).json(payload)
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.patch(
    '/tutor-bot/conversations/:conversationId',
    async function (req, res: Response<void>) {
      try {
        await TutorBotService.linkTutorBotConversationToSessionId(
          req.params.conversationId,
          req.body.sessionId
        )
        return res.sendStatus(204)
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.post(
    '/tutor-bot/conversations',
    async (req, res: Response<TutorBotNewConversationPublic>) => {
      try {
        const data = conversationValidator({
          ...req.body,
          userId: req.user?.id,
        })
        const conversation =
          await TutorBotService.createTutorBotConversation(data)
        return res.json(toNewConversationPublic(conversation))
      } catch (err) {
        resError(res, err)
      }
    }
  )
}
