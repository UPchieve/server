import 'openai/shims/node'
import OpenAI from 'openai'
import config from '../config'
import logger from '../logger'

export const openai = new OpenAI({
  apiKey: config.openAIApiKey,
})

export const CHAT_MODEL_ID = config.openAIModelId

type ChatApiInput = {
  prompt: string
  userMessage: string
}

export const invokeChatApi = async ({ prompt, userMessage }: ChatApiInput) => {
  let results = null
  try {
    const response = await openai.chat.completions.create({
      model: CHAT_MODEL_ID,
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: userMessage,
        },
      ],

      response_format: { type: 'json_object' },
    })

    results = getChatContent(response)
    if (!results) throw new Error("Didn't get an expected openai chat response")
  } catch (err) {
    logger.error(err)
    throw err
  }

  return {
    model: CHAT_MODEL_ID,
    results,
  }
}

const getChatContent = (result: OpenAI.ChatCompletion) =>
  result?.choices[0]?.message?.content
    ? JSON.parse(result.choices[0].message.content)
    : null
