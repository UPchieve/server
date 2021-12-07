import { Types } from 'mongoose'

import * as cache from '../cache'
import * as UserRepo from '../models/User/queries'
import { CHATBOT_CACHE_KEY, CHATBOT_EMAIL } from '../constants'
import logger from '../logger'
import { asObjectId } from './type-utils'

export async function lookupChatbotFromCache(): Promise<Types.ObjectId | undefined> {
  try {
    let chatbot = await cache.get(CHATBOT_CACHE_KEY)
    if (!chatbot) {
      let chatbot = await UserRepo.getUserIdByEmail(CHATBOT_EMAIL)
      if (chatbot) await cache.save(CHATBOT_CACHE_KEY, chatbot.toString())
      return chatbot
    }
    return asObjectId(chatbot)
  } catch (err) {
    logger.error(`Failed to lookup chatbot user: ${(err as Error).message}`)
  }
}