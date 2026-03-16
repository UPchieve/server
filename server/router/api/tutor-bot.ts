import { Router } from 'express'
import multer from 'multer'
import * as TutorBotService from '../../services/TutorBotService'
import { resError } from '../res-error'
import { asFactory, asString } from '../../utils/type-utils'
import { InputError } from '../../models/Errors'
import { MessagePayload } from '../../contracts/tutor-bot'
import { TutorBotHumanSenderType } from '../../types/tutor-bot'

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

export function routeTutorBot(router: Router) {
  const upload = multer()

  router.get(
    '/tutor-bot/conversations/:conversationId',
    async function (req, res) {
      try {
        const botResponse = await TutorBotService.getTranscriptForConversation(
          req.params.conversationId
        )
        const transcript =
          TutorBotService.toTutorBotTranscriptPublic(botResponse)
        return res.status(200).json(transcript)
      } catch (err) {
        resError(res, err)
      }
    }
  )
  router.post(
    '/tutor-bot/conversations/:conversationId/message',
    upload.single('snapshot'),
    async function (req, res) {
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
        const payload =
          TutorBotService.toTutorBotAddMessageResponsePublic(botResponse)
        return res.status(200).json(payload)
      } catch (err) {
        resError(res, err)
      }
    }
  )
}
