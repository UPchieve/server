import type { Response, Router } from 'express'
import * as DirectMessageService from '../../services/DirectMessageService'
import { ConversationNotFoundError } from '../../services/Errors'
import { InputError } from '../../models/Errors'
import { isUuid } from '../../utils/type-utils'
import { extractUser } from '../extract-user'
import { resError } from '../res-error'
import type { GetOrCreateConversationResponse } from '../../contracts/direct-messages'

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
        if (error instanceof ConversationNotFoundError)
          return res.sendStatus(404)
        resError(res, error)
      }
    }
  )
}
