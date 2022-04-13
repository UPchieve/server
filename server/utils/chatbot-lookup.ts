import { Ulid } from '../models/pgUtils'

import * as cache from '../cache'
import * as UserRepo from '../models/User/queries'
import { CHATBOT_CACHE_KEY, CHATBOT_EMAIL } from '../constants'
import logger from '../logger'
import { asString } from './type-utils'

export async function lookupChatbotFromCache(): Promise<Ulid | undefined> {
  try {
    return asString(await cache.get(CHATBOT_CACHE_KEY))
  } catch (err) {
    if (err instanceof cache.KeyNotFoundError) {
      try {
        const chatbot = await UserRepo.getUserIdByEmail(CHATBOT_EMAIL)
        if (chatbot) await cache.save(CHATBOT_CACHE_KEY, chatbot.toString())
        return chatbot
      } catch (error) {
        err = error
      }
    } else
      logger.error(`Failed to lookup chatbot user: ${(err as Error).message}`)
  }
}
