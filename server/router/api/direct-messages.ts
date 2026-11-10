import type { Request, Response, Router } from 'express'
import * as DirectMessageService from '../../services/DirectMessageService'
import * as DirectMessageReportService from '../../services/DirectMessageReportService'
import { ConversationNotFoundError } from '../../services/Errors'
import { InputError } from '../../models/Errors'
import { asString, isUuid } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import { toDirectMessagePublic } from '../../contracts/direct-messages.mappers'
import type {
  DirectMessagesResponse,
  GetOrCreateConversationResponse,
  UnreadDirectMessagesResponse,
  ReportDirectMessageResponse,
} from '../../contracts/direct-messages'

function handleError(res: Response, error: unknown) {
  if (error instanceof ConversationNotFoundError) return res.sendStatus(404)
  resError(res, error)
}

// A malformed id can't be a conversation, so it gets the same 404 as one the
// user isn't in
function getConversationId(req: Request) {
  const { conversationId } = req.params
  return isUuid(conversationId) ? conversationId : undefined
}

export function routeDirectMessages(router: Router): void {
  router.post(
    '/conversations',
    async function (req, res: Response<GetOrCreateConversationResponse>) {
      try {
        const user = extractUser(req)
        const { partnerId } = req.body
        if (!isUuid(partnerId)) throw new InputError('Invalid partnerId')

        const conversation = await DirectMessageService.getOrCreateConversation(
          user,
          partnerId
        )
        res.json({ conversationId: conversation.id })
      } catch (error) {
        handleError(res, error)
      }
    }
  )

  router.get(
    '/conversations/:conversationId/messages',
    async function (req, res: Response<DirectMessagesResponse>) {
      try {
        const conversationId = getConversationId(req)
        if (!conversationId) return res.sendStatus(404)
        const user = extractUser(req)
        const messages = await DirectMessageService.getMessages(
          conversationId,
          user
        )
        res.json({ messages: messages.map(toDirectMessagePublic) })
      } catch (error) {
        handleError(res, error)
      }
    }
  )

  router.post(
    '/conversations/:conversationId/last-seen',
    async function (req, res: Response) {
      try {
        const conversationId = getConversationId(req)
        if (!conversationId) return res.sendStatus(404)
        const user = extractUser(req)
        await DirectMessageService.markConversationSeen(conversationId, user)
        res.sendStatus(204)
      } catch (error) {
        handleError(res, error)
      }
    }
  )

  router.get(
    '/conversations/unread',
    async function (req, res: Response<UnreadDirectMessagesResponse>) {
      try {
        const user = extractUser(req)
        const senderIds =
          await DirectMessageService.getUnreadMessageSenderIds(user)
        res.json({ senderIds })
      } catch (error) {
        handleError(res, error)
      }
    }
  )

  router.post(
    '/conversations/:conversationId/report',
    async function (req, res: Response<ReportDirectMessageResponse>) {
      try {
        const conversationId = getConversationId(req)
        if (!conversationId) return res.sendStatus(404)

        const user = extractUser(req)
        const { reportReason, reportMessage } = req.body ?? {}
        const reportId = await DirectMessageReportService.reportConversation(
          conversationId,
          user,
          {
            reportReason: asString(reportReason),
            reportMessage:
              reportMessage === undefined ? undefined : asString(reportMessage),
          }
        )
        res.json({ reportId })
      } catch (error) {
        handleError(res, error)
      }
    }
  )
}
