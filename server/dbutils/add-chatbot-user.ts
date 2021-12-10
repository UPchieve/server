import mongoose from 'mongoose'
import * as db from '../db'
import UserModel from '../models/User'

import * as cache from '../cache'
import { CHATBOT_EMAIL, CHATBOT_CACHE_KEY } from '../constants'
import { lookupChatbotFromCache } from '../utils/chatbot-lookup'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const chatbot = await lookupChatbotFromCache()
    if (chatbot) {
      console.log('Chatbot found and in cache - exiting')
      return
    }

    const result = await UserModel.create({
      firstname: 'Chatbot',
      lastname: 'UPchieve',
      email: CHATBOT_EMAIL
    })
    if (result) {
      console.log('Created new chatbot user')
      await cache.save(CHATBOT_CACHE_KEY, result._id.toString())
      console.log('Saved chatbot to cache')
    }
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
