import 'openai/shims/node'
import OpenAI from 'openai'
import config from '../config'
import logger from '../logger'

const openai = new OpenAI({
  apiKey: config.openAIApiKey,
})

export const MODEL_ID = config.openAIModelId

export enum ChatApiResponseType {
  JSON = 'json_object',
  TEXT = 'text',
}
export type ChatApiInput = {
  prompt: string
  userMessage: string
  responseType?: ChatApiResponseType
}

export type ChatApiResults = {
  modelId: string
  results: string | object
}

export const invokeChatApi = async ({
  prompt,
  userMessage,
  responseType = ChatApiResponseType.TEXT,
}: ChatApiInput): Promise<ChatApiResults> => {
  let results = null
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: { type: responseType },
    })

    results = getChatContent(response)
    if (!results) throw new Error("Didn't get an expected openai chat response")
  } catch (err) {
    logger.error(err)
    throw err
  }

  return {
    modelId: MODEL_ID,
    results,
  }
}

const getChatContent = (result: OpenAI.ChatCompletion) =>
  result?.choices[0]?.message?.content
    ? JSON.parse(result.choices[0].message.content)
    : null
